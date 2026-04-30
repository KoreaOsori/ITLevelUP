-- ============================================
-- ITLevelUP - News Table Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. news 테이블 생성 (없으면)
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    summary TEXT,
    source TEXT,
    category TEXT DEFAULT 'General',
    content_type TEXT DEFAULT 'News', -- News, Paper, Service, Research
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 3. 일반 사용자: 읽기 허용
DROP POLICY IF EXISTS "Allow public read access" ON public.news;
CREATE POLICY "Allow public read access" ON public.news
    FOR SELECT USING (true);

-- 4. 서비스 롤: 모든 권한 (백엔드 쓰기용)
DROP POLICY IF EXISTS "Allow service role management" ON public.news;
CREATE POLICY "Allow service role management" ON public.news
    FOR ALL USING (auth.role() = 'service_role');

-- 5. 인덱스 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);
CREATE INDEX IF NOT EXISTS idx_news_content_type ON public.news(content_type);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON public.news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON public.news(source);

-- 6. profiles 테이블 생성 (사용자 메타데이터)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- auth.users.id와 연결됨
    name TEXT,
    streak INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    stage_index INTEGER DEFAULT 0,
    title TEXT DEFAULT '입문기 개발자',
    interests TEXT[] DEFAULT '{}',
    target_job TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. missions 테이블 생성
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 10,
    frequency TEXT DEFAULT 'daily', -- daily, weekly, monthly
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. user_missions 테이블 생성 (미션 완료 기록)
CREATE TABLE IF NOT EXISTS public.user_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- auth.users.id
    mission_id UUID REFERENCES public.missions(id),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. portfolios 테이블 생성 (TIL 및 포트폴리오 자동 기록)
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- auth.users.id
    mission_id UUID REFERENCES public.missions(id),
    title TEXT NOT NULL,
    content TEXT, -- TIL 내용
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 및 정책 설정 (portfolios)
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own portfolios" ON public.portfolios;
CREATE POLICY "Users can manage their own portfolios" ON public.portfolios FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Public portfolios are viewable by everyone" ON public.portfolios;
CREATE POLICY "Public portfolios are viewable by everyone" ON public.portfolios FOR SELECT USING (is_public = true);

-- RLS 및 정책 설정 (profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles can be managed by service role" ON public.profiles;
CREATE POLICY "Profiles can be managed by service role" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- RLS 및 정책 설정 (missions)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Missions are viewable by everyone" ON public.missions;
CREATE POLICY "Missions are viewable by everyone" ON public.missions FOR SELECT USING (true);

-- RLS 및 정책 설정 (user_missions)
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own mission completion" ON public.user_missions;
CREATE POLICY "Users can manage their own mission completion" ON public.user_missions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "User missions can be managed by service role" ON public.user_missions;
CREATE POLICY "User missions can be managed by service role" ON public.user_missions FOR ALL USING (auth.role() = 'service_role');
