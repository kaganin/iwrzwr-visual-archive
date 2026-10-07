# iwrzwr / visual archive

160+ experimental visualization studies across 25+ categories, built with javascript. explore waveform animations, spectrum-inspired displays, matrix patterns, particle fields, rhythm, memory, and mechanical motion. study the drawing code and adapt the live examples for your own creative-coding projects.

like it? [🌟 leave a star on github](https://github.com/kaganin/iwrzwr-visual-archive): it helps others discover these experiments.

## examples

[🔗 explore all studies on the website](https://www.kagan.in/iwrzwr/visual-archive/).

video examples: 20 seconds, 1080 × 1080, 30 fps, silent.

https://github.com/user-attachments/assets/3c562edf-f039-4f97-9b2b-23967390c4df

https://github.com/user-attachments/assets/85ce9b2a-076d-4d9b-bbe3-24c8f8fcdcb3

https://github.com/user-attachments/assets/9da2bee4-0f7c-45a1-9a4e-ffc95380485e

the videos are exported from the same drawing code. the website runs the javascript versions, not mp4 playback.

## run it

with node.js 22 or newer and python 3:

```sh
git clone https://github.com/kaganin/iwrzwr-visual-archive.git
cd iwrzwr-visual-archive
node build-archive.mjs
node scripts/check-archive.mjs
python3 -m http.server 8000 --directory dist
```

open [localhost:8000](http://localhost:8000/). use an http server; opening `index.html` directly won't work because the gallery fetches study files.

no dependency installation is needed for the gallery build. `npm run build` and `npm run check` are equivalent shortcuts. you can also serve the checked-in `dist/` without rebuilding.

## license

original code and original assets use the [mit license](LICENSE), which permits personal and commercial use. retain copyright and license notices. provided without warranty.

third-party fonts are not covered by this license and their binaries are not included in the repository. this does not grant rights to third-party trademarks, reference images, or others' assets. visual inspiration does not imply affiliation or endorsement.
