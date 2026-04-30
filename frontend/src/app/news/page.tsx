'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ExternalLink, Clock, Flame, Bookmark, Search,
  LayoutGrid, List, RefreshCw, Newspaper, FlaskConical,
  Boxes, ChevronRight, AlertCircle, Languages
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  published_at?: string;
  created_at?: string;
  url: string;
  content_type?: string;
}

type CategoryFilter = "전체" | "AI/ML" | "개발" | "인프라" | "보안" | "데이터" | "비즈니스";
type SourceTab = "all" | "news" | "paper" | "service";
type ViewMode = "grid" | "list";

const CATEGORY_FILTERS: CategoryFilter[] = ["전체", "AI/ML", "개발", "인프라", "보안", "데이터", "비즈니스"];

const CATEGORY_MAP: Record<CategoryFilter, string | null> = {
  "전체": null,
  "AI/ML": "AI/ML",
  "개발": "Development",
  "인프라": "Cloud/Infra",
  "보안": "Security",
  "데이터": "Data",
  "비즈니스": "Business",
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
  "AI/ML": "AI",
  "Development": "개발",
  "Cloud/Infra": "인프라",
  "Security": "보안",
  "Data": "데이터",
  "Business": "비즈니스",
  "General": "일반",
};

const CATEGORY_COLORS: Record<string, string> = {
  "AI/ML": "#6366f1",
  "Development": "#10b981",
  "Cloud/Infra": "#06b6d4",
  "Security": "#ef4444",
  "Data": "#8b5cf6",
  "Business": "#f97316",
  "General": "#94a3b8",
};

const CATEGORY_BG: Record<string, string> = {
  "AI/ML": "#eef2ff",
  "Development": "#f0fdf4",
  "Cloud/Infra": "#ecfeff",
  "Security": "#fef2f2",
  "Data": "#f5f3ff",
  "Business": "#fff7ed",
  "General": "#f8fafc",
};

const FILTER_ACTIVE: Record<CategoryFilter, string> = {
  "전체": "#1a1744",
  "AI/ML": "#6366f1",
  "개발": "#10b981",
  "인프라": "#06b6d4",
  "보안": "#ef4444",
  "데이터": "#8b5cf6",
  "비즈니스": "#f97316",
};

// 소스명 → 소스 탭 분류
const PAPER_SOURCES = ["arXiv AI", "arXiv ML", "arXiv CV", "arXiv CL"];
const SERVICE_SOURCES = ["Product Hunt", "GitHub Blog", "AWS Blog"];

function getSourceTab(item: NewsItem): SourceTab {
  if (item.content_type) {
    const ct = item.content_type.toLowerCase();
    if (ct === "news") return "news";
    if (ct === "paper") return "paper";
    if (ct === "service") return "service";
    if (ct === "research") return "paper";
  }
  if (PAPER_SOURCES.includes(item.source)) return "paper";
  if (SERVICE_SOURCES.includes(item.source)) return "service";
  return "news";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff}분 전`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`;
  return `${Math.floor(diff / (60 * 24))}일 전`;
}

const CATEGORY_IMAGES: Record<string, string> = {
  "AI/ML": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&auto=format&fit=crop",
  "Development": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop",
  "Cloud/Infra": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop",
  "Security": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop",
  "Data": "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=400&auto=format&fit=crop",
  "Business": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop",
  "General": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop",
};

const SOURCE_TABS = [
  { key: "all" as SourceTab, label: "전체", icon: Newspaper, color: "#6366f1" },
  { key: "news" as SourceTab, label: "뉴스 · 기사", icon: Newspaper, color: "#10b981" },
  { key: "paper" as SourceTab, label: "논문 · 연구", icon: FlaskConical, color: "#8b5cf6" },
  { key: "service" as SourceTab, label: "서비스 · 도구", icon: Boxes, color: "#f97316" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("전체");
  const [activeSourceTab, setActiveSourceTab] = useState<SourceTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatedMap, setTranslatedMap] = useState<Record<string, { title: string; summary: string }>>({});

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 모든 뉴스를 한꺼번에 가져옴 (클라이언트 사이드 필터링을 위해)
      const url = `${API_BASE}/api/news/?limit=200`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("뉴스 불러오기 실패:", e);
      setError("뉴스를 불러오지 못했습니다. 백엔드 서버를 확인해주세요.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/news/fetch`, { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      setSyncMsg(data.message || "동기화 완료");
      await fetchNews();
    } catch {
      setSyncMsg("동기화 실패. 서버 연결을 확인해주세요.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  };

  const handleTranslate = async () => {
    if (translating) return;
    setTranslating(true);
    
    // 현재 필터링된 뉴스 중 아직 번역되지 않은 뉴스만 추출 (최대 10개씩 시도 권장)
    const toTranslate = filteredNews.filter(n => !translatedMap[n.id]).slice(0, 5);
    
    if (toTranslate.length === 0) {
      setTranslating(false);
      return;
    }

    try {
      const promises = toTranslate.map(async (item) => {
        const textToTranslate = `Title: ${item.title}\nSummary: ${item.summary}`;
        const res = await fetch(`${API_BASE}/api/news/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textToTranslate })
        });
        if (!res.ok) return null;
        const data = await res.json();
        
        // 결과 파싱 (Title: ... Summary: ... 형식 기대)
        const parts = data.translated_text.split(/\n|Summary:/);
        const translatedTitle = parts[0].replace(/Title:\s*/i, "").trim();
        const translatedSummary = parts[parts.length - 1].trim();

        return { id: item.id, title: translatedTitle, summary: translatedSummary };
      });

      const results = await Promise.all(promises);
      const newMap = { ...translatedMap };
      results.forEach(r => {
        if (r) newMap[r.id] = { title: r.title, summary: r.summary };
      });
      setTranslatedMap(newMap);
    } catch (e) {
      console.error("Translation failed:", e);
    } finally {
      setTranslating(false);
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 필터링: 소스탭 + 카테고리 + 검색 (클라이언트 사이드)
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // 1. 소스 탭 필터
      const tab = getSourceTab(item);
      if (activeSourceTab !== "all" && tab !== activeSourceTab) return false;

      // 2. 카테고리 필터
      const catKey = CATEGORY_MAP[activeCategory];
      if (catKey && item.category !== catKey) return false;

      // 3. 검색 필터
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.summary?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [news, activeSourceTab, activeCategory, searchQuery]);

  const hotItems = useMemo(() => {
    return filteredNews.filter((n) => getSourceTab(n) !== "paper").slice(0, 3);
  }, [filteredNews]);

  return (
    <div className="p-6 min-h-screen" style={{ background: "linear-gradient(180deg, #f8faff 0%, #f1f5f9 100%)" }}>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-slate-800 font-extrabold text-2xl tracking-tight">
            📰 뉴스 &amp; 스크랩
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            최신 IT/AI 뉴스, 논문, 서비스 소식을 한곳에서
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "수집 중..." : "소식 업데이트"}
          </button>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 text-xs font-bold">{bookmarked.size}</span>
          </div>
        </div>
      </div>

      {/* 동기화 메시지 */}
      {syncMsg && (
        <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-indigo-700 text-sm flex items-center gap-2">
          <ChevronRight className="w-4 h-4 shrink-0" />
          {syncMsg}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* 1. 소스 타입 탭 (상단) */}
      <div className="flex items-center gap-2 mb-4">
        {SOURCE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSourceTab === tab.key;
          const count = tab.key === "all"
            ? news.length
            : news.filter((n) => getSourceTab(n) === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSourceTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={
                isActive
                  ? { background: tab.color, color: "white", boxShadow: `0 4px 14px ${tab.color}40` }
                  : { background: "white", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. 카테고리 필터 (중단) */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {CATEGORY_FILTERS.map((filter) => {
          const catKey = CATEGORY_MAP[filter];
          const count = filter === "전체"
            ? news.length
            : news.filter((n) => n.category === catKey).length;
          const isActive = activeCategory === filter;
          const activeColor = FILTER_ACTIVE[filter];
          return (
            <button
              key={filter}
              onClick={() => setActiveCategory(filter)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={
                isActive
                  ? { background: activeColor, color: "white", boxShadow: `0 4px 12px ${activeColor}40` }
                  : { background: "white", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {filter}
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#f1f5f9" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. 검색창 (하단) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="제목, 내용으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 결과 수 + 번역 버튼 + 정렬 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-slate-500 text-sm">
          <span className="text-slate-800 font-bold">{filteredNews.length}개</span>의 콘텐츠
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleTranslate}
            disabled={translating || filteredNews.length === 0}
            className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors disabled:opacity-50"
          >
            <Languages className={`w-3.5 h-3.5 ${translating ? "animate-pulse" : ""}`} />
            {translating ? "번역 중..." : "한글로 번역"}
          </button>
          <p className="text-slate-400 text-xs">최신순</p>
        </div>
      </div>

      {/* 로딩 / 결과 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
              <div className="h-36 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            {error ? "⚠️" : news.length === 0 ? "📭" : "🔍"}
          </div>
          <p className="text-slate-600 font-semibold mb-1">
            {error ? "연결 오류" : news.length === 0 ? "아직 수집된 뉴스가 없어요" : "검색 결과가 없습니다"}
          </p>
          <p className="text-slate-400 text-sm mb-4">
            {error ? "백엔드 서버가 실행 중인지 확인해주세요" : news.length === 0 ? "'뉴스 동기화' 버튼을 눌러 최신 콘텐츠를 불러오세요" : "다른 키워드로 검색해보세요"}
          </p>
          {news.length === 0 && !error && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {syncing ? "수집 중..." : "지금 뉴스 수집하기"}
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* 그리드 뷰 */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((item) => {
            const isPaper = getSourceTab(item) === "paper";
            const isHot = hotItems.some((h) => h.id === item.id);
            const catColor = CATEGORY_COLORS[item.category] || "#6366f1";
            const catLabel = REVERSE_CATEGORY_MAP[item.category] || item.category;
            const imgUrl = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES["General"];
            const isBookmarked = bookmarked.has(item.id);
            
            const translated = translatedMap[item.id];
            const title = translated ? translated.title : item.title;
            const summary = translated ? translated.summary : item.summary;

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-200 group cursor-pointer flex flex-col"
              >
                {/* 썸네일 */}
                <div className="relative h-36 overflow-hidden shrink-0">
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = CATEGORY_IMAGES["General"]; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* 뱃지 */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold"
                      style={{ background: catColor }}
                    >
                      {catLabel}
                    </span>
                    {isPaper && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold flex items-center gap-0.5">
                        <FlaskConical className="w-2.5 h-2.5" />
                        논문
                      </span>
                    )}
                    {isHot && !isPaper && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white flex items-center gap-0.5 font-bold">
                        <Flame className="w-2.5 h-2.5" /> HOT
                      </span>
                    )}
                  </div>

                  {/* 북마크 */}
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
                  >
                    <Bookmark
                      className="w-3.5 h-3.5"
                      style={{ color: isBookmarked ? "#fbbf24" : "white", fill: isBookmarked ? "#fbbf24" : "transparent" }}
                    />
                  </button>
                </div>

                {/* 내용 */}
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="text-slate-800 text-sm font-bold leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                    {title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                    {summary}
                  </p>
                  
                  {/* 푸터 (하단 고정) */}
                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                      <span className="text-[11px] truncate max-w-[80px] font-medium">{item.source}</span>
                      <span className="text-slate-200">·</span>
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="text-[11px] shrink-0">{formatDate(item.published_at || item.created_at)}</span>
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-indigo-500 text-[11px] hover:text-indigo-700 font-bold transition-colors shrink-0"
                    >
                      원문 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* 리스트 뷰 */
        <div className="space-y-3">
          {filteredNews.map((item) => {
            const isPaper = getSourceTab(item) === "paper";
            const catColor = CATEGORY_COLORS[item.category] || "#6366f1";
            const catBg = CATEGORY_BG[item.category] || "#f8fafc";
            const catLabel = REVERSE_CATEGORY_MAP[item.category] || item.category;
            const imgUrl = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES["General"];
            const isBookmarked = bookmarked.has(item.id);

            const translated = translatedMap[item.id];
            const title = translated ? translated.title : item.title;
            const summary = translated ? translated.summary : item.summary;

            return (
              <article
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group flex gap-5 items-start"
              >
                <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { e.currentTarget.src = CATEGORY_IMAGES["General"]; }}
                  />
                </div>
                <div className="flex-1 min-w-0 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-slate-800 text-sm font-bold leading-snug line-clamp-1 group-hover:text-indigo-700 transition-colors">
                      {title}
                    </h4>
                    <button onClick={(e) => toggleBookmark(item.id, e)} className="shrink-0">
                      <Bookmark
                        className="w-4 h-4"
                        style={{ color: isBookmarked ? "#fbbf24" : "#cbd5e1", fill: isBookmarked ? "#fbbf24" : "transparent" }}
                      />
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-1 mb-3">
                    {summary}
                  </p>
                  <div className="mt-auto flex items-center gap-2.5 flex-wrap">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                      style={{ background: catBg, color: catColor }}
                    >
                      {catLabel}
                    </span>
                    {isPaper && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 font-bold">
                        📄 논문
                      </span>
                    )}
                    <span className="text-slate-200">|</span>
                    <span className="text-slate-400 text-[11px] font-medium">{item.source}</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.published_at || item.created_at)}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-indigo-500 text-[11px] hover:text-indigo-700 font-bold transition-colors"
                    >
                      원문 보기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
