# PETFOOD · 사료 계급도

강아지·고양이 사료 브랜드를 **공개 스코어 서열(1~6등급)**로 비교하는 사이트입니다.

- 사이트: https://petfood.pe.kr
- 상단: 펫푸드 스코어 / 강아지 사료 / 고양이 사료 / 블로그
- 계급도: 브랜드 카드(스펙·국기·구매 링크)
- 블로그: `content/blog/*.md` — Decap CMS(`/admin`)로 작성
- RSS: https://petfood.pe.kr/rss
- Sitemap: https://petfood.pe.kr/sitemap.xml

## 실행

```bash
npm install
npm run feeds   # RSS·sitemap·robots 생성
npm run dev
```

```bash
npm run build
npm run preview
```

`npm run build` 시 `prebuild`로 피드가 자동 생성됩니다.

## 블로그 · Decap CMS

관리자: 배포 사이트 기준 `/admin/`  
게시글 폴더: `content/blog/`  
업로드: `public/uploads/`  
GitHub 저장소: `lab486486/top10` (이름을 `petfood`로 바꾼 뒤 Decap `repo` 설정도 같이 바꾸세요)

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

이 저장소는 Pages Functions(`/api/oauth/auth`, `/api/oauth/callback`)로 GitHub OAuth를 처리합니다.

1. **GitHub OAuth App 생성**
   - GitHub → Settings → Developer settings → OAuth Apps → New
   - Application name: `PETFOOD Decap` (자유)
   - Homepage URL: `https://petfood.pe.kr`
   - Authorization callback URL: `https://petfood.pe.kr/api/oauth/callback`
   - Client ID / Client Secret 발급

2. **Cloudflare Pages 환경변수**
   - Workers & Pages → **`petfood`** 프로젝트 → Settings → Environment variables
   - **Production** 환경에 추가 (Preview만 넣으면 본 도메인에 안 붙음):
     - `GITHUB_CLIENT_ID` = OAuth App Client ID
     - `GITHUB_CLIENT_SECRET` = OAuth App Client Secret (Encrypt 권장)
   - 저장 후 **반드시 재배포**: Deployments → 최신 배포 **Retry deployment**  
     또는 `main`에 커밋 푸시. **변수만 저장하고 재배포하지 않으면 Functions에 안 보입니다.**

3. **확인**
   - `https://petfood.pe.kr/api/oauth/auth` 접속 시 GitHub로 리다이렉트되면 OK  
     (`GITHUB_CLIENT_ID 환경변수가…` 문구가 나오면 아직 미반영)
   - `/admin` → Login with GitHub → 팝업이 **같은 도메인** `/api/oauth/auth` 로 열려야 함
   - 로그인 GitHub 계정은 `lab486486/top10` **push 권한** 필요

로컬 글쓰기(`npx decap-server`)는 OAuth 없이 가능합니다.

OAuth Client Secret은 이 저장소에 올리지 마세요.

## 쿠팡 파트너스 (구매 버튼)

브랜드 카드 **구매**는 `/api/coupang/buy` Functions로 연결됩니다.  
서버에서 Partners Open API로 상품을 검색한 뒤, 제휴 딥링크로 302 리다이렉트합니다.

1. [쿠팡 파트너스](https://partners.coupang.com) → 도구 → Open API → Access Key / Secret Key 발급
2. Cloudflare Pages → **`petfood`** → Settings → Environment variables → **Production**:
   - `COUPANG_ACCESS_KEY`
   - `COUPANG_SECRET_KEY` (Encrypt 권장)
   - (선택) `COUPANG_SUB_ID` — 채널 구분용, 기본값 `petfood`
3. **재배포 필수** (변수만 저장하면 Functions에 안 보임): Deployments → Retry, 또는 `main` 푸시
4. 확인:
   - `https://petfood.pe.kr/api/coupang/buy?brand=로얄캐닌&species=dog&debug=1`  
     → `{"ok":true,"target":"https://..."}` 이면 OK  
     → `missing COUPANG_…` 이면 키/재배포 미반영
   - 계급도에서 **구매** 클릭 시 쿠팡 상품(또는 제휴 검색)으로 이동

키·시크릿은 저장소/채팅에 넣지 마세요. 노출됐다면 파트너스에서 재발급하세요.

## 네이버 서치어드바이저

소유 확인 후 아래를 제출하세요.

| 종류 | URL |
| --- | --- |
| RSS | `https://petfood.pe.kr/rss` |
| 사이트맵 | `https://petfood.pe.kr/sitemap.xml` |

RSS는 RSS 2.0 + UTF-8이며, 글 **본문 전체**를 `<description>`에 넣고, 모든 link/guid가 `petfood.pe.kr` 도메인입니다. SPA HTML이 아니라 정적 XML로 응답합니다 (`Content-Type: application/rss+xml`).

## Cloudflare Pages 배포

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 저장소 `lab486486/top10` 연결
3. 빌드 설정:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Production branch: `main`
5. Custom domain: `petfood.pe.kr`

```bash
npm i -g wrangler
npm run build
npx wrangler pages deploy dist --project-name=petfood
```
