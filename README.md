# 골라먹 (Golrameok)

강아지·고양이 사료를 **공개 스코어**로 비교하는 순위·등급 파인더 초안입니다.

- 빠른 모드: 순위별 / 등급별 / 가성비 / 알러지
- 골라먹 스코어: 고기·단백·가성비·알러지·알크기 (가중치 공개)
- 브랜드 표기 등급(참고)과 골라먹 스코어 밴드 분리
- 쿠팡 링크는 플레이스홀더 (추후 파트너스 URL로 교체)

## 실행

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Cloudflare Pages 배포

이 프로젝트는 Vite 정적 빌드라 **Cloudflare Pages에 바로 배포 가능**합니다.

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 저장소 `lab486486/top10` 연결
3. 빌드 설정:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (기본)
4. 배포할 브랜치:
   - 미리보기: `cursor/golrameok-petfood-finder-f9d8`
   - 운영: `main`에 머지 후 Production branch를 `main`으로
5. 도메인 연결: Pages 프로젝트 → **Custom domains**에서 `dogfoodrank.com` 등 연결

로컬에서 Cloudflare에 직접 올리고 싶다면 (계정 로그인 필요):

```bash
npm i -g wrangler
npm run build
npx wrangler pages deploy dist --project-name=golrameok
```
