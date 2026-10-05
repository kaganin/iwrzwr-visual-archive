# deployment

the archive is static: no npm installation, database, microphone permission, or backend is needed.

connect `kaganin/iwrzwr-visual-archive` to a dedicated vercel project, production branch `main`. `vercel.json` sets the build command and output directory, adding `<base href="/iwrzwr/visual-archive/">` for asset resolution behind the portfolio subpath.

```sh
IWRZWR_BASE_PATH=/iwrzwr/visual-archive/ node build-archive.mjs
```

build without this variable for local root hosting.

## portfolio routing

the portfolio owns `kagan.in` and redirects to `www.kagan.in`; preserve that configuration. add only this scoped external rewrite to the portfolio project, replacing the placeholder with the archive's verified production domain:

```json
{
  "source": "/iwrzwr/visual-archive/:path*",
  "destination": "https://ARCHIVE_PRODUCTION_DOMAIN/iwrzwr/visual-archive/:path*"
}
```

also route the slashless `/iwrzwr/visual-archive` path to the archive index, or redirect it to the slash-terminated path. do not replace unrelated routing rules. the archive config supports either entry path; a base tag resolves assets without client-side redirects.

the dedicated production deployment must be publicly readable through this rewrite. do not disable protection globally on the portfolio or expose unrelated previews.

## release checks

- build and static checks pass from the repository root.
- slashless and slash-terminated public addresses resolve.
- javascript, css, and all 28 study payloads return 200 beneath the prefix.
- the page displays 155 live previews, 28 collections, no videos, and no main-gallery iframes.
- run browser verification against the public address, not just localhost.
- an unrelated portfolio route still works.

## current access limitation

on 2026-10-05 the public archive path returned 404. the connected vercel app returned 403 for project creation, and the local cli token was invalid. source configuration is prepared, but production publication has not been verified. a connection with publication permissions is required to finish.
