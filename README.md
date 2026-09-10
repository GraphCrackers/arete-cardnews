# ARETE 카드뉴스 에디터

인스타그램 카드뉴스(1080×1350)를 브라우저에서 만들고, 팀원이 링크로 들어와 바로 수정하는 도구.

## 쓰는 법

- 편집기 열기 — `https://<계정>.github.io/<저장소>/`
- 특정 편 열기 — 주소 뒤에 `?p=<편이름>`
- 수정 후 **JSON 내보내기** → `projects/` 에 같은 이름으로 올리면 반영

## 배포

Settings > Pages > Source: Deploy from a branch > `main` / `(root)`

공개 저장소여야 무료 플랜에서 Pages가 동작합니다.

## 구조

- `index.html` — 에디터 본체 (전부 이 안에 있음)
- `projects/` — 카드뉴스 한 편 = JSON 한 개
- `assets/fonts/`, `assets/img/` — 폰트·이미지
- `reference/samples/` — 기존 카드뉴스 10장 (레이아웃 참고용)
- `voice.md` — 카드뉴스 문구를 쓸 때 지키는 문체 규칙. **초안 뽑기 전에 읽는다**

작업 맥락과 설계 배경은 `HANDOFF.md` 참고.
