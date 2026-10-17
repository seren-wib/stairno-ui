# stairno-ui

브랜드 Stairno의 모든 사이트가 같이 쓰는 디자인 패키지 `@stairno/ui`. 토큰, 리셋·헤더·푸터 CSS, `Header`, `Footer`, `ThemeToggle`, `LocaleSwitch`, `ThemeInit`, `Fonts` 컴포넌트, 테마와 로케일 경로 헬퍼가 있다. 사이트별 섹션(히어로, 카드, 폼)은 여기 두지 않는다.

## 규칙

- 모든 Stairno 사이트는 stairno.com과 같은 모양이다(2026-10-18 결정). 색, 글꼴, 헤더·푸터·토글은 여기서만 바꾼다. 사이트 레포에서 같은 선택자를 덮어쓰지 않는다
- npm에 올리지 않는다. 사이트는 git 태그로 설치한다: `"@stairno/ui": "github:seren-wib/stairno-ui#v0.1.0"`. 바꾸면 버전을 올리고 태그를 찍은 뒤 사이트 쪽 `package.json`을 갱신한다
- 소스(`.astro`, `.css`, `.ts`)를 그대로 내보낸다. 빌드 단계 없음. 진입점은 `package.json`의 `exports`
- 컴포넌트는 데이터를 모른다. 문구, 링크, 브랜드 이름은 전부 props로 받는다. 사전과 프로젝트 목록은 사이트에 있다
- 개발 방식은 TDD. 실패하는 테스트를 먼저 쓰고 통과시킨다. 단위(`tests/unit`)와 컴포넌트(`tests/component`, Astro Container API) 두 층
- `main`에 직접 커밋하지 않는다. 모든 변경은 PR이고 CI(`verify`)가 통과해야 머지한다. 커밋은 Conventional Commits, 머지는 rebase
- 외부 스크립트, 추적 도구를 넣지 않는다. `localStorage`에는 테마 값(`theme`)만 둔다

## 스택

Astro 7(peer), TypeScript, CSS 변수, Vitest, Prettier, GitHub Actions.

```bash
npm ci
npm test
npm run check
npm run format
```

## 로컬에서 사이트와 같이 고칠 때

사이트 레포에서 `npm install ../stairno-ui`로 링크해서 작업하고, 커밋 전에 `package.json`과 lockfile을 git 태그 의존성으로 되돌린다. `file:` 의존성은 머지하지 않는다.
