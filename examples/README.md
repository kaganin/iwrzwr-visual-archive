# composition examples

| collection | video | drawing source |
| --- | --- | --- |
| signal assembly | [mp4](signal-assembly.mp4) | [javascript](../dist/signal-assembly.js) |
| phase mechanics | [mp4](phase-mechanics.mp4) | [javascript](../dist/phase-mechanics.js) |
| orbital memory | [mp4](orbital-memory.mp4) | [javascript](../dist/orbital-memory.js) |

1080 × 1080, 30 fps, 20 seconds, h.264, silent. these are code-rendered examples, not website dependencies. timing is unchanged; the end-to-start boundary is not guaranteed to loop seamlessly.

## reproduce

on macos with node.js, swift and a dedicated chromium debugging session on port 9224:

```sh
node scripts/export-composition-examples.mjs
```

the default source is the live gallery. set `GALLERY_URL` to another served build if needed. existing video outputs are never overwritten; preserve or move them before re-exporting. temporary png frames are removed only after successful encoding; failed exports preserve their frames for recovery.

the mp4 files total approximately 4.8 mb. the main readme embeds original mp4 attachments hosted by github via the closed [video asset issue](https://github.com/kaganin/iwrzwr-visual-archive/issues/1). older gif previews remain preserved but are no longer used. the main gallery requires neither the video nor gif files.
