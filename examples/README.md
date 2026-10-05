# composition examples

| collection | video | drawing source |
| --- | --- | --- |
| 26 — signal assembly | [mp4](26-signal-assembly.mp4) | [javascript](../dist/signal-assembly.js) |
| 27 — phase mechanics | [mp4](27-phase-mechanics.mp4) | [javascript](../dist/phase-mechanics.js) |
| 28 — orbital memory | [mp4](28-orbital-memory.mp4) | [javascript](../dist/orbital-memory.js) |

1080 × 1080, 30 fps, 20 seconds, h.264, silent. these are code-rendered examples, not website dependencies. timing is unchanged; the end-to-start boundary is not guaranteed to loop seamlessly.

## reproduce

on macos with node.js, swift and a dedicated chromium debugging session on port 9224:

```sh
node scripts/export-composition-examples.mjs
```

the default source is the live gallery. set `GALLERY_URL` to another served build if needed. existing video outputs are never overwritten; preserve or move them before re-exporting. temporary png frames are removed only after successful encoding; failed exports preserve their frames for recovery.

these optional assets total approximately 4.8 mb. the main gallery requires no video downloads.
