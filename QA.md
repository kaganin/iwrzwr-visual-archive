# verification — 2026-10-05

## findings

| Before | After | Why |
| --- | --- | --- |
| Invalid inline redirect JavaScript in the generated entry page | A validated base path and server-side routing | Root and portfolio-prefix hosting must resolve without a broken script. |
| Hidden sibling panels drew when their shared gallery card was visible | Only the selected panel draws | Avoid drawing up to 20 hidden animations per visible card. |
| Source resize observers watched hidden containers | Observers remeasure artwork when its actual card changes size | Preserve sharpness and geometry after resizing or orientation changes. |
| A negative arc radius could throw in a hidden Bearing Fan canvas | Non-positive radii are skipped | A hidden 1px container must not break rendering. |
| Orbital Memory cleared its rows to transparency | Rows are filled with opaque black | Match the preserved video's black background rather than reveal gray strips. |

## verdict

**Performance:** the selected-panel adapter passed its production lifecycle test: 15 selected draws, zero hidden-sibling draws in the sampling window; zero offscreen draws; 15 draws after returning. This is a rendering-isolation check, not a hardware FPS benchmark.

**Origin, physicality & cohesion:** all 155 previews were individually sampled and their contact-sheet frames visually inspected at both viewport sizes. The 152 individual study scripts match the preserved sources after the existing orange-to-red palette conversion. Canvas layouts resize to the card. The three compositions run their own preserved JavaScript, not embedded videos.

**Accessibility:** existing study-level reduced-motion handlers are preserved. Full keyboard, screen-reader, reduced-motion, and photosensitivity certification was not performed. No general accessibility-conformance claim is made.

## tested story

Open the public portfolio path → load the static gallery → fetch 28 collection payloads → run original drawing code inside isolated shadow roots → mount and animate cards on scroll → pause offscreen drawing → resize and resume.

Public entry: [kagan.in/iwrzwr/visual-archive](https://kagan.in/iwrzwr/visual-archive/).

| Boundary | Result | Evidence |
| --- | --- | --- |
| Public route | Pass | Slashless and slash-terminated paths return HTTP 200 after the existing www redirect. |
| Portfolio | Pass | Homepage remains available; only one scoped archive rewrite was published. |
| Assets | Pass | CSS, gallery runtime, three composition scripts, and all 28 JSON payloads return HTTP 200 through the real prefix. |
| Gallery structure | Pass | 155 cards, 28 collections, no main-gallery iframe or video elements, no horizontal overflow. |
| Static source checks | Pass | 28 payload scripts compile, runtime compiles, 152 individual study scripts match preserved source, 3 composition builds match their source files. |
| Motion | Pass | 310/310 card/viewport samples animate; no permanently blank previews; no captured browser errors. |
| Lifecycle | Pass | Hidden-panel isolation, offscreen pause/resume, and resize without navigation all pass. |
| Clean build | Pass | No dependency installation required; root and prefixed builds pass in a clean Git-export fixture. |

## procedure and artifacts

Chromium desktop: 1280 × 900. Chromium mobile-layout emulation: 390 × 844. Device scale factor: 1. Testing on an actual iPhone/Safari or Firefox is not covered.

Each card is scrolled into view and sampled at least three times. Quiet or initially unchanged samples receive longer observation (up to six frames). Motion detection hashes all RGBA channels, including alpha. Every card has a first/middle/last-frame contact-sheet row; both viewport sets were visually inspected. Some beat-triggered studies legitimately go quiet between events; this is distinguished from a permanently blank or frozen card.

Full production run: source commit `1442b61`; 310 samples, 310 animated, zero blank, zero errors. Release `d31a6e8` subsequently changes only Orbital Memory's opaque row fill and adds diagnostic scripts/static validation. Its three compositions are retested at both sizes after deployment. The other 152 drawings and gallery adapter are unchanged.

Temporary inspection artifacts remain outside Git at `/tmp/iwrzwr-gallery-qa-20261005/`:
`final/results.json`, 16 contact sheets, page screenshots, `final-compositions/`, and the Orbital Memory comparison sheet. They are not website assets or required dependencies.

Reproduce:

```sh
node build-archive.mjs
npm run check
python3 -m http.server 8000 --directory dist
# In a dedicated Chromium debugging session on port 9224:
GALLERY_URL=http://localhost:8000/ node scripts/verify-gallery.mjs
GALLERY_URL=http://localhost:8000/ node scripts/verify-gallery-lifecycle.mjs
```

Set `QA_OUTPUT` to choose an artifact directory, `QA_INDICES` to sample selected zero-based card indices, and `QA_FRAME_DELAYS` to change observation intervals.

The preserved Orbital Memory video was also inspected beside code-rendered frames at 1.72, 5, and 10 seconds. This caught the transparent-row regression. Dot spacing, palette, row placement, and the three motifs were visually compared. This is **not** a pixel-by-pixel equivalence certificate: video encoding, starting phase, and floating-point/raster differences can affect frames. Comparable historical MP4s are not present for every study; the code-source identity check is the fidelity evidence for the 152 originals.

Optional local comparison (requires the preserved reference MP4 and local HTTP server):

```sh
COMPOSITION_URL=http://localhost:8000/studies/orbital-memory.html node scripts/compare-orbital-memory.mjs
```

## release constraints

- Repository is still private. The MIT license documents permitted reuse; it does not itself make a private repository publicly accessible.
- Vercel production deployment works through the authenticated CLI. Automatic Git deployments still need the owner's repository-specific Vercel GitHub App grant; do not make the repository public as a workaround.
- No source media, unique changes, or prior iterations were deleted. No new dependency installation or duplicate clone was needed.
- Browser frame sampling proves liveness in the tested environment, not a perfect loop, real audio reactivity, universal browser support, or sustained mobile FPS.
- Header count 164 is editorial: 152 studies + 12 composition-assigned alternatives. Actual live cards: 155. Visible collections: 28.

## individual checklist

“Pass” means loaded, produced visible artwork during observation, changed frames, and was visually reviewed. Collection plus ordinal disambiguates repeated names.

| # | Preview | Collection | Desktop | Mobile |
| --- | --- | --- | --- | --- |
| 001 | Spectrum Ribbon | soundwave-directions | Pass | Pass |
| 002 | Mono Wave | soundwave-directions | Pass | Pass |
| 003 | Silk Layers | soundwave-directions | Pass | Pass |
| 004 | Liquid Wave | soundwave-directions | Pass | Pass |
| 005 | Fine Spectrum | soundwave-directions | Pass | Pass |
| 006 | Teletext Pulse | geek-soundwaves | Pass | Pass |
| 007 | Vector Scope | geek-soundwaves | Pass | Pass |
| 008 | Wireframe Echo | geek-soundwaves | Pass | Pass |
| 009 | ASCII Stream | geek-soundwaves | Pass | Pass |
| 010 | Spectral Tape | geek-soundwaves | Pass | Pass |
| 011 | Phosphor Sweep | vector-soundwave-studies | Pass | Pass |
| 012 | XY Dust | vector-soundwave-studies | Pass | Pass |
| 013 | Phase Braid | vector-soundwave-studies | Pass | Pass |
| 014 | Terminal Trace | vector-soundwave-studies | Pass | Pass |
| 015 | Contour Memory | vector-soundwave-studies | Pass | Pass |
| 016 | Resonance Sand | sound-machines | Pass | Pass |
| 017 | Harmonic Motor | sound-machines | Pass | Pass |
| 018 | Spring Rail | sound-machines | Pass | Pass |
| 019 | Pendulum Choir | sound-machines | Pass | Pass |
| 020 | Grain Conveyor | sound-machines | Pass | Pass |
| 021 | Gate Register | night-01-raster-protocol | Pass | Pass |
| 022 | Packet Stitch | night-01-raster-protocol | Pass | Pass |
| 023 | Raster Comb | night-01-raster-protocol | Pass | Pass |
| 024 | Parity Bloom | night-01-raster-protocol | Pass | Pass |
| 025 | Address Bus | night-01-raster-protocol | Pass | Pass |
| 026 | Coupled Nodes | night-02-causal-instruments | Pass | Pass |
| 027 | Bearing Fan | night-02-causal-instruments | Pass | Pass |
| 028 | Causal Relay | night-02-causal-instruments | Pass | Pass |
| 029 | State Boxes | night-02-causal-instruments | Pass | Pass |
| 030 | Branch Memory | night-02-causal-instruments | Pass | Pass |
| 031 | Segment Relay | night-03-pocket-machines | Pass | Pass |
| 032 | Compression Treaty | night-03-pocket-machines | Pass | Pass |
| 033 | Splice Loom | night-03-pocket-machines | Pass | Pass |
| 034 | Orbit Punchcard | night-03-pocket-machines | Pass | Pass |
| 035 | Sample Hold Ladder | night-03-pocket-machines | Pass | Pass |
| 036 | Calibrated Horizons | night-04-calibration-desk | Pass | Pass |
| 037 | Delay Vernier | night-04-calibration-desk | Pass | Pass |
| 038 | Phase Aperture | night-04-calibration-desk | Pass | Pass |
| 039 | Pursuit Orbit | night-04-calibration-desk | Pass | Pass |
| 040 | Folding Topology | night-04-calibration-desk | Pass | Pass |
| 041 | Broken Grid | night-05-plotter-logic | Pass | Pass |
| 042 | Step Weave | night-05-plotter-logic | Pass | Pass |
| 043 | Cell Courier | night-05-plotter-logic | Pass | Pass |
| 044 | Factor Constellation | night-05-plotter-logic | Pass | Pass |
| 045 | Gesture Fragments | night-05-plotter-logic | Pass | Pass |
| 046 | Rank Sieve | night-06-selective-memory | Pass | Pass |
| 047 | Exchange Tray | night-06-selective-memory | Pass | Pass |
| 048 | Impression Press | night-06-selective-memory | Pass | Pass |
| 049 | Slice Loupe | night-06-selective-memory | Pass | Pass |
| 050 | Overstrike Seal | night-06-selective-memory | Pass | Pass |
| 051 | Wake Field | night-07-signal-translations | Pass | Pass |
| 052 | Revision Strata | night-07-signal-translations | Pass | Pass |
| 053 | Perforation Logic | night-07-signal-translations | Pass | Pass |
| 054 | Transcode Window | night-07-signal-translations | Pass | Pass |
| 055 | Wire Loom | night-07-signal-translations | Pass | Pass |
| 056 | Skew Profile | night-08-quiet-telemetry | Pass | Pass |
| 057 | Duration Receipt | night-08-quiet-telemetry | Pass | Pass |
| 058 | Stepped Throat | night-08-quiet-telemetry | Pass | Pass |
| 059 | Shear Belt | night-08-quiet-telemetry | Pass | Pass |
| 060 | Carrier Window | night-08-quiet-telemetry | Pass | Pass |
| 061 | Quantized Handoff | night-09-control-laws | Pass | Pass |
| 062 | Clipped Travel | night-09-control-laws | Pass | Pass |
| 063 | Retrigger Ratchet | night-09-control-laws | Pass | Pass |
| 064 | Context Lease | night-09-control-laws | Pass | Pass |
| 065 | Schmitt Memory | night-09-control-laws | Pass | Pass |
| 066 | Section Gate | night-10-field-operations | Pass | Pass |
| 067 | Field Strain | night-10-field-operations | Pass | Pass |
| 068 | Compression Atlas | night-10-field-operations | Pass | Pass |
| 069 | Flare Stem | night-10-field-operations | Pass | Pass |
| 070 | Event Slots | night-10-field-operations | Pass | Pass |
| 071 | Choke Pair | night-11-shared-resources | Pass | Pass |
| 072 | Voice Vacancy | night-11-shared-resources | Pass | Pass |
| 073 | Docked Phrase | night-11-shared-resources | Pass | Pass |
| 074 | Masked Recall | night-11-shared-resources | Pass | Pass |
| 075 | Routed Emphasis | night-11-shared-resources | Pass | Pass |
| 076 | Ricochet Register | night-12-inference-engines | Pass | Pass |
| 077 | Identity Hold | night-12-inference-engines | Pass | Pass |
| 078 | Critical Sections | night-12-inference-engines | Pass | Pass |
| 079 | Deferred Yield | night-12-inference-engines | Pass | Pass |
| 080 | Range Reduction | night-12-inference-engines | Pass | Pass |
| 081 | Confidence Fence | night-13-conditional-machines | Pass | Pass |
| 082 | Vector Closure | night-13-conditional-machines | Pass | Pass |
| 083 | Cycle Escapement | night-13-conditional-machines | Pass | Pass |
| 084 | Reversible Detour | night-13-conditional-machines | Pass | Pass |
| 085 | Mutation Quota | night-13-conditional-machines | Pass | Pass |
| 086 | Moment Balance | night-14-visible-invariants | Pass | Pass |
| 087 | Marginal Print | night-14-visible-invariants | Pass | Pass |
| 088 | Area Contract | night-14-visible-invariants | Pass | Pass |
| 089 | Registration Residual | night-14-visible-invariants | Pass | Pass |
| 090 | Occlusion Order | night-14-visible-invariants | Pass | Pass |
| 091 | Order Residue | night-15-procedural-marks | Pass | Pass |
| 092 | Euclidean Packing | night-15-procedural-marks | Pass | Pass |
| 093 | Error Escrow | night-15-procedural-marks | Pass | Pass |
| 094 | Series Product | night-15-procedural-marks | Pass | Pass |
| 095 | Nested Span | night-15-procedural-marks | Pass | Pass |
| 096 | Carry Cascade | bloom-ten-studies | Pass | Pass |
| 097 | Diamond Relay | bloom-ten-studies | Pass | Pass |
| 098 | Bit Weave | bloom-ten-studies | Pass | Pass |
| 099 | Phase Shutter | bloom-ten-studies | Pass | Pass |
| 100 | Binary Tide | bloom-ten-studies | Pass | Pass |
| 101 | Voxel Lung | bloom-ten-studies | Pass | Pass |
| 102 | Fault Orchard | bloom-ten-studies | Pass | Pass |
| 103 | Orbit Register | bloom-ten-studies | Pass | Pass |
| 104 | XOR Interference | bloom-ten-studies | Pass | Pass |
| 105 | Sieve Memory | bloom-ten-studies | Pass | Pass |
| 106 | Gravity Curtain | matrix-direction-studies | Pass | Pass |
| 107 | Oblique Relay | matrix-direction-studies | Pass | Pass |
| 108 | Twin Helix | matrix-direction-studies | Pass | Pass |
| 109 | Spiral Sink | matrix-direction-studies | Pass | Pass |
| 110 | Corner Tide | matrix-direction-studies | Pass | Pass |
| 111 | Figure Eight | matrix-routes-ten | Pass | Pass |
| 112 | Ricochet Register | matrix-routes-ten | Pass | Pass |
| 113 | Square Circuit | matrix-routes-ten | Pass | Pass |
| 114 | Pendulum Bank | matrix-routes-ten | Pass | Pass |
| 115 | Fountain Fold | matrix-routes-ten | Pass | Pass |
| 116 | Counter Rotors | matrix-routes-ten | Pass | Pass |
| 117 | Hourglass Drift | matrix-routes-ten | Pass | Pass |
| 118 | Junction Turn | matrix-routes-ten | Pass | Pass |
| 119 | Orbital Shells | matrix-routes-ten | Pass | Pass |
| 120 | Accordion Field | matrix-routes-ten | Pass | Pass |
| 121 | Kick Ricochet | sound-motion-four-series | Pass | Pass |
| 122 | Snare Prism | sound-motion-four-series | Pass | Pass |
| 123 | Hat Escapement | sound-motion-four-series | Pass | Pass |
| 124 | Impact Cage | sound-motion-four-series | Pass | Pass |
| 125 | Pluck Rebound | sound-motion-four-series | Pass | Pass |
| 126 | Envelope Orbit | sound-motion-four-series | Pass | Pass |
| 127 | Band Satellites | sound-motion-four-series | Pass | Pass |
| 128 | Phase Gyro | sound-motion-four-series | Pass | Pass |
| 129 | Resonance Petals | sound-motion-four-series | Pass | Pass |
| 130 | Stereo Sling | sound-motion-four-series | Pass | Pass |
| 131 | String Bridge | sound-motion-four-series | Pass | Pass |
| 132 | Fold Bank | sound-motion-four-series | Pass | Pass |
| 133 | Coupled Frames | sound-motion-four-series | Pass | Pass |
| 134 | Pulse Louvers | sound-motion-four-series | Pass | Pass |
| 135 | Spectral Fan | sound-motion-four-series | Pass | Pass |
| 136 | Echo Chambers | sound-motion-four-series | Pass | Pass |
| 137 | Memory Loom | sound-motion-four-series | Pass | Pass |
| 138 | Attack Ledger | sound-motion-four-series | Pass | Pass |
| 139 | Decay Halo | sound-motion-four-series | Pass | Pass |
| 140 | Diffusion Bed | sound-motion-four-series | Pass | Pass |
| 141 | Echo Orchard | cell-memory-ten | Pass | Pass |
| 142 | Halo Cache | cell-memory-ten | Pass | Pass |
| 143 | Band Ledger | cell-memory-ten | Pass | Pass |
| 144 | Diamond Spill | cell-memory-ten | Pass | Pass |
| 145 | Orbital Dust | cell-memory-ten | Pass | Pass |
| 146 | Twin Wells | cell-memory-ten | Pass | Pass |
| 147 | Spiral Retain | cell-memory-ten | Pass | Pass |
| 148 | Pulse Quilt | cell-memory-ten | Pass | Pass |
| 149 | Rebound Cloud | cell-memory-ten | Pass | Pass |
| 150 | Diagonal Sediment | cell-memory-ten | Pass | Pass |
| 151 | Spectral Fan | fan-satellites-refined | Pass | Pass |
| 152 | Band Satellites | fan-satellites-refined | Pass | Pass |
| 153 | Signal Assembly | signal-assembly | Pass | Pass |
| 154 | Phase Mechanics | phase-mechanics | Pass | Pass |
| 155 | Orbital Memory | orbital-memory | Pass | Pass |

