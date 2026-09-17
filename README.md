# PETFOOD · 사료 계급도

강아지·고양이 사료 브랜드를 **공개 스코어 서열(1~6등급)**로 비교하는 사이트입니다.

- 상단: 펫푸드 스코어 / 강아지 사료 / 고양이 사료 / 블로그
- 계급도: 브랜드 카드(스펙·국기·구매 링크)
- 블로그: `content/blog/*.md` — Decap CMS(`/admin`)로 작성

## 실행

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## 블로그 · Decap CMS

관리자: 배포 사이트 기준 `/admin/`  
게시글 폴더: `content/blog/`  
업로드: `public/uploads/`

### 로컬에서 글 쓰기

1. `npm run dev`로 사이트 실행
2. 별도 터미널에서 Decap 로컬 백엔드 실행:

```bash
npx decap-server
```

3. 브라우저에서 `http://localhost:5173/admin/` 접속 후 로그인 없이 편집

`public/admin/config.yml`에 `local_backend: true`가 켜져 있어야 합니다.

### 운영(Cloudflare Pages)에서 GitHub 연동

Cloudflare Pages에는 Netlify Identity가 **없습니다**.  
`api.netlify.com/auth` 로 가면 **Not Found** 가 정상입니다.

이 저장소는 Pages Functions(`/auth`, `/callback`)로 GitHub OAuth를 처리합니다.

1. **GitHub OAuth App 생성**
   - GitHub → Settings → Developer settings → OAuth Apps → New
   - Application name: `PETFOOD Decap` (자유)
   - Homepage URL: `https://top10-4ri.pages.dev` (또는 커스텀 도메인)
   - Authorization callback URL: `https://top10-4ri.pages.dev/callback`  
     (커스텀 도메인을 쓰면 그 도메인의 `/callback` 도 추가)
   - Client ID / Client Secret 발급

2. **Cloudflare Pages 환경변수**
   - Workers & Pages → `petfood`(또는 해당 프로젝트) → Settings → Environment variables
   - Production에 추가:
     - `GITHUB_CLIENT_ID` = OAuth App Client ID
     - `GITHUB_CLIENT_SECRET` = OAuth App Client Secret
   - 저장 후 **재배포** (환경변수만 넣으면 기존 배포에 안 붙을 수 있음)

3. **확인**
   - `https://top10-4ri.pages.dev/admin/` 접속
   - Login with GitHub → 팝업이 **같은 도메인** `/auth` 로 열려야 함 (netlify.com 이면 안 됨)
   - 로그인 GitHub 계정은 `lab486486/top10` **push 권한** 필요

로컬 글쓰기(`npx decap-server`)는 OAuth 없이 가능합니다.

OAuth Client Secret은 이 저장소에 올리지 마세요.

## Cloudflare Pages 배포

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 저장소 `lab486486/top10` 연결
3. 빌드 설정:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Production branch: `main`
5. Custom domain 연결 (선택)

```bash
npm i -g wrangler
npm run build
npx wrangler pages deploy dist --project-name=petfood
```
