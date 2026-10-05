# iwrzwr / visual archive

Experimental sound visualizations: moving fields, mechanical signals, particle patterns, and small studies in rhythm and memory.

[Explore the gallery](https://iwrzwr-visual-archive.kaganyaldizkaya.chatgpt.site/)

Shared as-is. This is an experimental archive, not an actively maintained library. There is no commitment to support, new features, or compatibility updates.

## What's inside

- 28 visible collections: 25 study collections and three square compositions.
- The header counts 164 alternatives: 152 individual studies plus 12 alternatives assigned to the compositions as an editorial counting convention. The page renders 155 cards, not 164 separate demos.
- **Signal Assembly**, **Phase Mechanics**, and **Orbital Memory** are the three square compositions.
- HTML, CSS, JavaScript, Canvas drawing code, and the script that assembles the gallery—not just video exports.

Most previews run live in the browser. Orbital Memory uses a small, bundled MP4 of Echo Orchard, Orbit Register, and Parity Bloom; the other two square compositions run from JavaScript.

The main gallery mounts studies in Shadow DOM rather than iframes, with a shared frame scheduler and offscreen pausing. Historical standalone pages and earlier iframe-based tooling remain in the archive, but are not used by the main page.

These are visual prototypes with simulated signals, not a production audio-analysis engine or the native iwrzwr application.

## Run locally

The standalone `iwrzwr-visual-archive` repository contains the website only. The native iOS application and its Git history are not included.

```sh
git clone https://github.com/kaganin/iwrzwr-visual-archive.git
cd iwrzwr-visual-archive
```

With Node.js and Python 3 installed, run from the archive root:

```sh
node build-archive.mjs
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Use an HTTP server: opening `index.html` directly will not work reliably because the gallery fetches study files.

There is no dependency installation needed for the static gallery build. You can also serve the checked-in `dist/` directly without rebuilding.

## Layout

- `sources/` — original studies and preserved iterations.
- `build-archive.mjs` — assembles the current gallery and study catalog.
- `dist/` — static website, study payloads, gallery runtime, and styles.
- `sources/echo-orbit-parity.mp4` — the video needed to reproduce Orbital Memory.

Some preserved sources are not included in the current visible selection. The generated catalog also contains historical entries, so its total is not the main gallery's collection count.

## Media and reuse

The live gallery is the main preview. A video export of every study is unnecessary; the source code is the useful part of this repository. Keep large exports outside Git and link to them when needed.

Original code and accompanying original assets are released under the [MIT License](LICENSE), including permission for commercial use. Copyright and license notices must be retained. The software is provided without warranty.

The license does not grant rights to third-party trademarks, reference material, or assets owned by others. Visual inspiration does not imply affiliation or endorsement.
