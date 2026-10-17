# Contributing

1인 프로젝트지만 흐름은 팀처럼 간다. 이슈 → 브랜치 → 테스트 먼저 → 구현 → PR → CI → 머지 → 태그.

## 브랜치

| 브랜치                      | 수명      | 역할        | 따는 곳 | 머지 대상 |
| --------------------------- | --------- | ----------- | ------- | --------- |
| `main`                      | 상시      | 릴리스 기준 | —       | —         |
| `feature/<이슈번호>-<요약>` | 작업 하나 | 개별 작업   | `main`  | `main`    |

- `main`에 직접 커밋하지 않는다. 모든 변경은 PR로 들어간다
- 작업 하나당 이슈 하나, 브랜치 하나
- PR 하나를 머지하고 태그까지 찍은 뒤에 다음 PR을 연다

## 커밋 — Conventional Commits

`<type>(<scope>): <summary>`. `summary`는 영어, 명령형, 소문자, 마침표 없음. type은 `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `chore`, `ci`. TDD 작업은 커밋도 그 순서다: `test:` 다음 `feat:`.

## PR

- 제목은 커밋 형식. 본문에 이슈 번호, 바꾼 이유, 확인한 방법
- CI(포맷, 타입 검사, 테스트)가 전부 통과해야 머지한다. 머지는 rebase merge, 머지 직후 feature 브랜치 삭제
- 모양이 바뀌는 변경은 PR 본문에 stairno.com에서 찍은 전후 스크린샷을 붙인다

## 릴리스

1. `package.json`의 `version`과 `CHANGELOG.md`를 올리는 커밋을 PR에 포함한다
2. 머지 후 `main`에서 `git tag vX.Y.Z && git push origin vX.Y.Z`
3. 사이트 레포마다 `package.json`의 `github:seren-wib/stairno-ui#vX.Y.Z`를 올리고 `npm install`로 lockfile을 갱신하는 PR을 연다

## 환경

- Windows(Git Bash 또는 PowerShell)와 macOS를 오간다. 경로를 하드코딩하지 않는다
- 줄바꿈은 `.gitattributes`가 LF로 고정한다
- Node 22 이상. `package.json`의 `engines`가 기준이다
