# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.1] - 2026-10-18

### Fixed

- Short pages no longer end with a band of page background under the footer. `body` is a column flex box at least `100vh` (`100dvh` where supported) tall, and `.site-footer` takes the leftover space with `margin-top: auto` and does not shrink. `main` keeps its own height, so a grid `main` does not stretch its rows; pages taller than the viewport lay out exactly as before.

## [0.2.0] - 2026-10-18

### Added

- `AccountMenu` component for the header `actions` slot (account.stairno.com SRS FR-79 to FR-82, SDD 7.5). A 36px round button shows the user's initial or a person icon and opens a 280px card: name, email, Manage account and Log out when signed in; Log in and Sign up when signed out. The card pins to the gutters below 480px.
- The user comes from the `user` prop or, on pages without a server, from `sessionUrl` read in the browser with credentials (Better Auth get-session shape, 3 s timeout, signed out on any failure). Log out POSTs to `signOutUrl` and reloads.
- Disclosure behaviour: `aria-expanded` and `aria-controls`, opening focuses the first link, Esc and an outside click close the card and return focus to the button, tabbing out closes it. 120 ms open animation, none under `prefers-reduced-motion`. A `[hidden]` rule keeps class display rules from showing hidden parts.
- `src/lib/account.ts`: `accountInitial`, `parseSession`, `readSession`, `signOut` and `mountAccountMenu`, with unit tests and DOM tests in happy-dom (dev dependency only).

## [0.1.0] - 2026-10-18

### Added

- Design tokens (`tokens.css`) and the shared base stylesheet (`base.css`): reset, type, container, fixed header, locale switch, footer, pill button, reduced-motion rules. Extracted from stairno.com without visual change.
- Astro components `Header`, `Footer`, `ThemeToggle`, `LocaleSwitch`, `ThemeInit` and `Fonts`, all driven by props.
- `theme` helpers (`resolveTheme`, `nextTheme`, `isTheme`, `THEME_KEY`) and `i18n` path helpers (`locales`, `localePath`, `alternateLocale`, `isLocale`).
- Vitest suites for the helpers, the stylesheets and every component; GitHub Actions CI.

[0.2.1]: https://github.com/seren-wib/stairno-ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/seren-wib/stairno-ui/releases/tag/v0.2.0
[0.1.0]: https://github.com/seren-wib/stairno-ui/releases/tag/v0.1.0
