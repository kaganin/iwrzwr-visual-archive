import AVFoundation
import AppKit
import CoreVideo

let fps: Int32 = 30
let frameCount = Int(ProcessInfo.processInfo.environment["EXPORT_FRAME_COUNT"] ?? "300") ?? 300
let width = 1080
let height = 1080
let arguments = CommandLine.arguments
let framesPath = arguments.count > 1 ? arguments[1] : "/tmp/iwrzwr-thermal-core-frames"
let outputPath = arguments.count > 2
    ? arguments[2]
    : NSString(string: "~/Desktop/Bearing-Fan-Thermal-Core-1080x1080.mp4").expandingTildeInPath
let framesDirectory = URL(fileURLWithPath: framesPath)
let outputURL = URL(fileURLWithPath: outputPath)

guard !FileManager.default.fileExists(atPath: outputPath) else {
    fatalError("Refusing to overwrite existing output: \(outputPath)")
}
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 18_000_000,
        AVVideoExpectedSourceFrameRateKey: fps,
        AVVideoMaxKeyFrameIntervalKey: fps * 2,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]

let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let attributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
]
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attributes)
guard writer.canAdd(input) else { fatalError("Cannot add video input") }
writer.add(input)
guard writer.startWriting() else { fatalError(writer.error?.localizedDescription ?? "Unable to start writer") }
writer.startSession(atSourceTime: .zero)

func pixelBuffer(from image: CGImage) -> CVPixelBuffer {
    var buffer: CVPixelBuffer?
    CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32BGRA,
                        attributes as CFDictionary, &buffer)
    guard let pixelBuffer = buffer else { fatalError("Unable to create pixel buffer") }
    CVPixelBufferLockBaseAddress(pixelBuffer, [])
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, []) }
    guard let base = CVPixelBufferGetBaseAddress(pixelBuffer),
          let context = CGContext(data: base, width: width, height: height,
                                  bitsPerComponent: 8,
                                  bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGBitmapInfo.byteOrder32Little.rawValue |
                                              CGImageAlphaInfo.premultipliedFirst.rawValue)
    else { fatalError("Unable to create context") }
    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return pixelBuffer
}

for frame in 0..<frameCount {
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    let name = String(format: "frame-%04d.png", frame)
    let url = framesDirectory.appendingPathComponent(name)
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
    else { fatalError("Unable to read \(name)") }
    let time = CMTime(value: CMTimeValue(frame), timescale: fps)
    guard adaptor.append(pixelBuffer(from: cgImage), withPresentationTime: time) else {
        fatalError(writer.error?.localizedDescription ?? "Unable to append \(name)")
    }
}

input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting { semaphore.signal() }
semaphore.wait()
guard writer.status == .completed else {
    fatalError(writer.error?.localizedDescription ?? "Encoding failed")
}
print(outputURL.path)
