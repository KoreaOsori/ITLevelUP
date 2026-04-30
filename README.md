# 🚀 IT LevelUp - 개인 IT & AI 역량 강화 플랫폼

**IT LevelUp**은 개발자와 IT 실무자들이 매일의 학습과 미션을 통해 꾸준히 성장하고, 자신의 역량을 시각적으로 확인할 수 있는 **게이미피케이션 기반의 역량 강화 플랫폼**입니다.

## 🌟 주요 기능 (Features)

*   **📊 대시보드 및 역량 분석**: AI/ML, 프론트엔드, 백엔드, 클라우드, 보안 등 다양한 분야의 현재 역량을 레이더 차트로 시각화합니다.
*   **✅ 일일 미션 시스템**: 매일 주어지는 미션을 달성하고 XP(경험치)를 획득하여 레벨을 올립니다 (입문기 🌿 -> 마스터 🔮).
*   **🔥 연속 달성(Streak) 및 히트맵**: 깃허브(GitHub) 잔디와 유사한 활동 달성도 히트맵을 통해 꾸준한 학습 습관을 형성합니다.
*   **📝 TIL 및 포트폴리오**: 미션 완료 시 '오늘 배운 점(TIL)'을 기록하고, 이를 모아 개인 포트폴리오로 활용합니다.
*   **📰 IT 트렌드 자동 수집 (Scraping)**: 최신 IT 뉴스, 논문(arXiv), 서비스 소개(Product Hunt 등)를 자동으로 스크래핑하여 맞춤형 인사이트를 제공합니다.

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Data Visualization**: Recharts (역량 레이더 차트, 히트맵 구현)
*   **Animation**: canvas-confetti (레벨업 및 미션 달성 축하 효과)

### Backend
*   **Framework**: FastAPI (Python)
*   **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
*   **API**: RESTful API 아키텍처

### Infrastructure & Deployment
*   **Containerization**: Docker & Docker Compose (프론트엔드, 백엔드 통합 컨테이너 환경 구성)

## 📂 프로젝트 구조 (Project Structure)

```
ITLevelUP/
├── frontend/             # Next.js 프론트엔드 애플리케이션
│   ├── src/
│   │   ├── app/          # App Router 페이지 (대시보드, 로그인 등)
│   │   ├── components/   # 재사용 가능한 UI 컴포넌트
│   │   ├── contexts/     # Auth 등 전역 상태 관리
│   │   └── lib/          # Supabase 클라이언트 및 유틸리티
│   └── package.json
├── backend/              # FastAPI 백엔드 애플리케이션
│   ├── app/
│   │   ├── api/          # 라우터 엔드포인트 (news, user 등)
│   │   ├── core/         # 설정 및 Supabase 클라이언트
│   │   └── services/     # 비즈니스 로직 (뉴스 스크래핑 등)
│   ├── main.py           # FastAPI 엔트리 포인트
│   └── requirements.txt
├── docker-compose.yml    # Docker 통합 환경 설정
└── README.md
```

## 🚀 시작하기 (Getting Started)

이 프로젝트는 Docker를 사용하여 손쉽게 실행할 수 있습니다.

### 1. 환경 변수 설정
`frontend/`와 `backend/` 디렉토리에 각각 `.env` 또는 `.env.local` 파일을 생성하고 다음 값을 채워줍니다. (보안을 위해 깃허브에는 올라가지 않습니다)

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**backend/.env**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Docker를 이용한 실행
```bash
# 컨테이너 빌드 및 백그라운드 실행
docker-compose up --build -d
```

### 3. 접속
*   **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
*   **Backend API (FastAPI Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 💡 구현 주안점 및 해결한 과제

*   **Vite에서 Next.js App Router로의 마이그레이션**: 초기 Vite 기반의 CSR 구조에서 SEO와 초기 로딩 속도, 라우팅 관리의 효율성을 높이기 위해 Next.js App Router 아키텍처로 성공적으로 전환하였습니다.
*   **실시간 데이터 동기화**: 프론트엔드에서 하드코딩된 Mock 데이터를 모두 걷어내고, Supabase와 FastAPI를 거쳐오는 실데이터로 완벽히 연동시켰습니다.
*   **반응형 레이아웃 및 UX**: 넓은 화면에서는 효율적인 2-Column 그리드 시스템을, 모바일/태블릿 화면에서는 가독성을 해치지 않는 수직 정렬을 적용하여 사용자 경험을 최적화했습니다.

## 🤝 기여 (Contributing)
현재 개인 프로젝트로 진행 중이나 피드백 및 이슈 등록은 언제나 환영합니다!
