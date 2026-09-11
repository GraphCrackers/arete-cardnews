# 카드뉴스 게시 서버

Cloudflare `arete-cardnews-api`의 모듈 Worker에 `worker.mjs` 내용을 배포합니다.

런타임 환경 변수:

- `GITHUB_CLIENT_ID`: GitHub App Client ID (일반 변수)
- `GITHUB_CLIENT_SECRET`: GitHub App Client secret (Secret)

GitHub App Redirect URI:
`https://arete-cardnews-api.gang789gang.workers.dev/auth/callback`

앱은 `GraphCrackers/arete-cardnews`에만 설치하고 Contents 읽기·쓰기 권한을 부여합니다.
각 팀원은 자기 계정으로 로그인하며 저장소 쓰기 권한이 필요합니다.
사용자 권한과 앱 권한의 교집합인 GitHub 사용자 토큰으로 게시합니다.
설치 토큰이나 private key는 서버에서 사용하지 않습니다.

로그인은 PKCE 및 10분짜리 HttpOnly 상태 쿠키로 확인합니다. GitHub 사용자 토큰은
Client secret에서 파생한 키로 암호화하며, 최대 8시간의 세션을 편집기 탭 메모리에만
전달합니다. 새로고침하거나 세션이 만료되면 다시 로그인합니다.
Client secret을 변경하면 기존 세션도 무효가 됩니다.

게시 요청은 편 JSON과 목록을 하나의 커밋으로 반영하며 강제 푸시는 하지 않습니다.
편집 시작 시점의 파일 SHA가 일치하지 않으면 409로 거절합니다.
과거 편집기에서 남긴 임시저장에는 SHA가 없어서 기존 편 게시가 거절될 수 있습니다.
이때 JSON을 백업하고 최신 편을 다시 연 뒤 필요한 변경을 반영합니다.
첨부 이미지는 JSON 안에 보관되며 전체 요청은 8MB까지 허용합니다.

## 팀원 사용법

1. 기존 카드뉴스 주소를 열고 GitHub 로그인 버튼을 누릅니다.
2. 팝업에서 자기 계정으로 앱 사용을 승인합니다.
3. 카드뉴스를 편집하고 사이트에 반영을 누릅니다.
4. 공개 게시 확인 후 사이트 반영 완료 안내를 기다립니다.

동시에 같은 편을 수정했다면 나중 게시가 거절됩니다. JSON을 백업하고 최신 편을
열어 변경 내용을 합쳐주세요. JSON 내보내기는 백업 기능으로 계속 사용할 수 있습니다.

Worker 배포만으로 편집기가 바뀌지는 않습니다. `index.html`도 GitHub Pages에 배포해야 합니다.
실제 GitHub 승인·커밋·Pages 배포는 본인 계정으로 최종 확인해야 합니다.
