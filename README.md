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

### 운영(Cloudflare Pages)에서 GitHub 연동 — 직접 조치 필요

Cloudflare Pages에는 Netlify Identity / Git Gateway가 **없습니다**.  
Decap이 GitHub에 커밋하려면 **GitHub OAuth App + OAuth 프록시(Worker)** 가 필요합니다.

1. **GitHub OAuth App 생성**
   - GitHub → Settings → Developer settings → OAuth Apps → New
   - Homepage URL: Cloudflare Pages 도메인 (예: `https://petfood.pages.dev`)
   - Authorization callback URL: OAuth Worker 콜백  
     예: `https://YOUR-OAUTH-WORKER.workers.dev/callback`
   - Client ID / Client Secret 발급

2. **Cloudflare Worker OAuth 프록시 배포**
   - 예: [decap-cms GitHub backend 가이드](https://decapcms.org/docs/github-backend/) 또는  
     커뮤니티 Worker (`cloudflare-workers-oauth` / `cms-oauth` 계열)
   - Worker 환경변수에 `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` 설정
   - Pages 도메인을 허용 오리진에 포함

3. **`public/admin/config.yml` 수정 (머지 후 main 기준)**

```yml
backend:
  name: github
  repo: lab486486/top10
  branch: main
  base_url: https://YOUR-OAUTH-WORKER.workers.dev
  auth_endpoint: auth

# 운영에서는 local_backend를 끄거나 삭제
# local_backend: true
```

4. **Pages ↔ GitHub**
   - Cloudflare Pages가 `lab486486/top10`에 연결되어 있어야 CMS 커밋 후 자동 재배포됩니다.
   - Production 브랜치: `main`
   - Build: `npm run build` / Output: `dist`

5. **권한**
   - `/admin`에 로그인하는 GitHub 계정은 해당 저장소 **push 권한**이 있어야 합니다.

OAuth Worker·Client Secret은 이 저장소에 올리지 마세요.

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
