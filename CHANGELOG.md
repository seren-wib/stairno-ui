# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-10-18

### Added

- Design tokens (`tokens.css`) and the shared base stylesheet (`base.css`): reset, type, container, fixed header, locale switch, footer, pill button, reduced-motion rules. Extracted from stairno.com without visual change.
- Astro components `Header`, `Footer`, `ThemeToggle`, `LocaleSwitch`, `ThemeInit` and `Fonts`, all driven by props.
- `theme` helpers (`resolveTheme`, `nextTheme`, `isTheme`, `THEME_KEY`) and `i18n` path helpers (`locales`, `localePath`, `alternateLocale`, `isLocale`).
- Vitest suites for the helpers, the stylesheets and every component; GitHub Actions CI.

[0.1.0]: https://github.com/seren-wib/stairno-ui/releases/tag/v0.1.0
