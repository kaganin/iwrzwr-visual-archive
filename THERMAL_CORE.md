# Thermal Core / Bearing Fan

The source animation is `dist/exports/thermal-core.html`. It is a deterministic 10-second, 30 fps, 1080×1080 loop on black.

Render PNG frames:

```sh
npm install
node export-thermal-core.mjs
```

Inside a Codex bundled runtime, `CODEX_PLAYWRIGHT_MODULE` can point at its installed Playwright package instead of creating a project-local `node_modules` directory.

Encode the frames with AVFoundation on macOS:

```sh
xcrun swift encode-thermal-core.swift \
  /tmp/iwrzwr-thermal-core-frames \
  "$HOME/Desktop/Bearing-Fan-Thermal-Core-1080x1080.mp4"
```

Generated frames and videos are intentionally ignored. The HTML and both export scripts are the reproducible source of truth.

## Archive source layout

`sources/` contains the portable HTML/SVG/source snapshot required by `build-archive.mjs`. `research/` contains the lightweight Markdown/JSON research record. Downloaded reference PDFs and rendered research images remain external and are intentionally not duplicated into Git.
