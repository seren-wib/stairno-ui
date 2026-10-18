# Contributing

This is a one-person project, but the flow is a team's: issue → branch → test first → implementation → PR → CI → merge → tag.

## Branches

| Branch                    | Lifetime | Role              | Branched from | Merged into |
| ------------------------- | -------- | ----------------- | ------------- | ----------- |
| `main`                    | Always   | Release baseline  | —             | —           |
| `feature/<issue>-<topic>` | One task | One piece of work | `main`        | `main`      |

- Never commit to `main` directly. Every change goes in through a PR
- One issue and one branch per task
- Merge one PR and tag it before opening the next

## Commits: Conventional Commits

`<type>(<scope>): <summary>`. The `summary` is English, imperative, lowercase, with no trailing period. Types are `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `chore`, `ci`. TDD work is committed in that order too: `test:` before `feat:`.

## Pull requests

- The title follows the commit format. The body has the issue number, why the change was made and how it was checked
- Merge only when CI (format, type check, tests) passes. Merge with rebase merge and delete the feature branch right after
- A change that alters how things look attaches before and after screenshots taken on stairno.com to the PR body

## Releases

1. Include a commit that bumps `version` in `package.json` and `CHANGELOG.md` in the PR
2. After the merge, on `main`: `git tag vX.Y.Z && git push origin vX.Y.Z`
3. In each site repository, open a PR that bumps `github:seren-wib/stairno-ui#vX.Y.Z` in `package.json` and refreshes the lockfile with `npm install`

## Documents

- Public documents (`README.md`, `CONTRIBUTING.md`) are written in English
- Specs and `CLAUDE.md` stay in Korean

## Environment

- Work moves between Windows (Git Bash or PowerShell) and macOS. Do not hardcode paths
- `.gitattributes` pins line endings to LF
- Node 22 or newer. `engines` in `package.json` is the reference
