# deployment

the archive is static: no npm installation, database, microphone permission, or backend is needed.

the dedicated vercel project is `iwrzwr-visual-archive`, production domain `iwrzwr-visual-archive.vercel.app`, in `kyaldizkaya-gmailcoms-projects`. `vercel.json` sets the build command and output directory, adding `<base href="/iwrzwr/visual-archive/">` for asset resolution behind the portfolio subpath.

```sh
IWRZWR_BASE_PATH=/iwrzwr/visual-archive/ node build-archive.mjs
```

build without this variable for local root hosting.

## portfolio routing

the portfolio owns `kagan.in` and redirects to `www.kagan.in`; preserve that configuration. add only this scoped external rewrite to the portfolio project, replacing the placeholder with the archive's verified production domain:

```json
{
  "source": "/iwrzwr/visual-archive/:path*",
  "destination": "https://iwrzwr-visual-archive.vercel.app/iwrzwr/visual-archive/:path*"
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

## current deployment

on 2026-10-05 the cli session was renewed and the site deployed successfully. the portfolio uses a single project-level regex rewrite from [deployment/portfolio-route.json](deployment/portfolio-route.json), published without redeploying or changing the portfolio. both entry paths and all 28 study payloads returned 200; the portfolio homepage remained available.

the github repository remains private. automatic git deployment is pending permission for the vercel github app to access this repository. until that is granted, publish from the repository root with:

```sh
vercel link --project iwrzwr-visual-archive --scope kyaldizkaya-gmailcoms-projects --yes
vercel deploy --prod --scope kyaldizkaya-gmailcoms-projects --yes
```

after the github permission is granted:

```sh
vercel git connect https://github.com/kaganin/iwrzwr-visual-archive.git --scope kyaldizkaya-gmailcoms-projects --yes
```

keep credentials in vercel's local auth storage; never commit tokens, `.env.local`, or `.vercel/`. production aliases are publicly readable while generated deployment urls retain the team's protection. the portfolio's protection settings were not changed.

the git author must correspond to the project owner's verified github identity. this checkout's automatic `@Kagans-Mac-mini.local` address was corrected in repository-local git settings; earlier commits are preserved, not rewritten. vercel blocked those unmatched-author deployments rather than building them.
