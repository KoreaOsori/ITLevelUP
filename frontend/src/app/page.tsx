'use client';

import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Target,
  Activity,
  RefreshCw,
  FlaskConical,
  Boxes,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import {
  userData as mockUserData,
  competencyData,
  dailyMissionCountData,
  dailyMissions as mockDailyMissions,
  weeklyMissions,
  monthlyMissions,
} from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";

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

const stageInfo = [
  { label: "입문기", emoji: "🌱", color: "#22c55e", next: "성장기" },
  { label: "성장기", emoji: "🌿", color: "#6366f1", next: "숙련기" },
  { label: "숙련기", emoji: "🌳", color: "#f59e0b", next: "전문가" },
  { label: "전문가", emoji: "⚡", color: "#ef4444", next: "마스터" },
  { label: "마스터", emoji: "🔮", color: "#a855f7", next: null },
];

const categoryColors: Record<string, string> = {
  "AI/ML": "#6366f1",
  "개발": "#10b981",
  "클라우드": "#3b82f6",
  "보안": "#ef4444",
  "DevOps": "#f59e0b",
  "데이터": "#8b5cf6",
  "Development": "#10b981",
  "Cloud/Infra": "#06b6d4",
  "Security": "#ef4444",
  "Data": "#8b5cf6",
  "Business": "#f97316",
  "General": "#94a3b8",
  "서비스": "#06b6d4",
  "도구": "#f59e0b",
  "일반": "#94a3b8",
};

const REVERSE_CATEGORY: Record<string, string> = {
  "AI/ML": "AI",
  "Development": "개발",
  "Cloud/Infra": "인프라",
  "Security": "보안",
  "Data": "데이터",
  "Business": "비즈니스",
  "General": "일반",
};

const NEWS_CATEGORY_IMAGES: Record<string, string> = {
  "AI/ML": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&auto=format&fit=crop",
  "Development": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop",
  "Cloud/Infra": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop",
  "Security": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop",
  "Data": "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=400&auto=format&fit=crop",
  "Business": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop",
  "General": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop",
};

const PAPER_SOURCES = ["arXiv AI", "arXiv ML", "arXiv CV", "arXiv CL"];

function getSourceType(source: string): "paper" | "service" | "news" {
  if (PAPER_SOURCES.includes(source)) return "paper";
  if (["Product Hunt", "GitHub Blog", "AWS Blog"].includes(source)) return "service";
  return "news";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff}분 전`;
  if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
  return `${Math.floor(diff / 1440)}일 전`;
}

const missionProgress = {
  daily: {
    total: mockDailyMissions.length,
    completed: mockDailyMissions.filter((m) => m.completed).length,
  },
  weekly: {
    total: weeklyMissions.length,
    completed: weeklyMissions.filter((m) => m.completed).length,
  },
  monthly: {
    total: monthlyMissions.length,
    completed: monthlyMissions.filter((m) => m.completed).length,
  },
};

function getCompetencyComment(data: typeof competencyData) {
  const avg = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const highest = data.reduce((max, item) => (item.value > max.value ? item : max));
  const lowest = data.reduce((min, item) => (item.value < min.value ? item : min));

  if (avg >= 70) {
    return `전반적으로 우수한 역량! ${highest.subject} 분야 강점, ${lowest.subject} 분야 보완 필요.`;
  } else if (avg >= 60) {
    return `중급 이상의 실력. ${highest.subject} 강점을 살리고 ${lowest.subject} 분야 집중 성장 기대.`;
  } else {
    return `기초를 탄탄히 다지는 단계. ${highest.subject} 분야에서 좋은 출발!`;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // TIL 모달 상태
  const [showTILModal, setShowTILModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [tilContent, setTilContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 실시간 뉴스
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [hasNewsData, setHasNewsData] = useState(true);
  const [activeNewsTab, setActiveNewsTab] = useState<"all" | "News" | "Paper" | "Service">("all");

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [profileRes, missionsRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/api/user/profile?user_id=${user.id}`),
          fetch(`${API_BASE}/api/user/missions?user_id=${user.id}`),
          fetch(`${API_BASE}/api/user/activity?user_id=${user.id}`),
        ]);
        
        if (profileRes.ok) setProfile(await profileRes.json());
        if (missionsRes.ok) setMissions(await missionsRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (e) {
        console.error("Dashboard data load failed:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    const fetchRecentNews = async () => {
      setNewsLoading(true);
      try {
        let url = `${API_BASE}/api/news/?limit=6`;
        if (activeNewsTab !== "all") {
          url += `&content_type=${activeNewsTab}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRecentNews(data.slice(0, 6));
          setHasNewsData(true);
        } else {
          setRecentNews([]);
          setHasNewsData(false);
        }
      } catch {
        setHasNewsData(false);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchRecentNews();
  }, [activeNewsTab]);

  const openTILModal = (mission: any) => {
    setSelectedMission(mission);
    setShowTILModal(true);
  };

  const handleTILSubmit = async () => {
    if (!user || !selectedMission) return;
    setIsSubmitting(true);

    try {
      // 1. TIL 내용 저장 (Supabase 직접 호출)
      if (tilContent.trim()) {
        await supabase.from('portfolios').insert({
          user_id: user.id,
          mission_id: selectedMission.id,
          title: `[TIL] ${selectedMission.title}`,
          content: tilContent,
          is_public: true
        });
      }

      // 2. 미션 완료 처리
      const res = await fetch(`${API_BASE}/api/user/missions/${selectedMission.id}/complete?user_id=${user.id}`, {
        method: "POST"
      });

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b']
        });

        // 데이터 리로드
        const [p, m] = await Promise.all([
          fetch(`${API_BASE}/api/user/profile?user_id=${user.id}`).then(r => r.json()),
          fetch(`${API_BASE}/api/user/missions?user_id=${user.id}`).then(r => r.json())
        ]);
        setProfile(p);
        setMissions(m);
        
        // 레벨업 체크 (예: 이전 XP와 새 XP를 비교해서 레벨이 올랐다면 축하 애니메이션 추가)
        if (p && currentProfile && p.level > currentProfile.level) {
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#f59e0b', '#fbbf24', '#fcd34d']
            });
          }, 1000);
        }
      }
    } catch (e) {
      console.error("Mission completion failed:", e);
    } finally {
      setIsSubmitting(false);
      setShowTILModal(false);
      setSelectedMission(null);
      setTilContent("");
    }
  };

  const currentProfile = profile || {
    name: user?.name || "User",
    title: user?.title || "입문기 개발자",
    stage_index: 0,
    level: 1,
    xp: 0,
    streak: 1,
    totalMissionsCompleted: 0
  };
  const currentMissions = Array.isArray(missions) ? missions : [];
  const stage = stageInfo[currentProfile.stage_index] || stageInfo[0];
  const xpMax = 100; // 단순화
  const xpPct = Math.round(((currentProfile.xp % xpMax) / xpMax) * 100);
  const avgCompetency = (
    competencyData.reduce((sum, item) => sum + item.value, 0) / competencyData.length
  ).toFixed(1);
  const competencyComment = getCompetencyComment(competencyData);

  const completedCount = currentMissions.filter(m => m.completed).length;
  const totalCount = currentMissions.length;

  if (!mounted) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Top Row: Profile, Competency, Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Profile Card */}
        <div className="col-span-1 flex flex-col">
          <div
            className="rounded-2xl p-5 flex flex-col items-center relative overflow-hidden shadow-sm border border-slate-100 flex-1 w-full h-full"
            style={{ background: `linear-gradient(135deg, #1a1744 0%, #0f0d2e 100%)` }}
          >
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: stage.color, filter: "blur(40px)" }}
          />
          <div
            className="text-xs px-2.5 py-1 rounded-full mb-4 self-end font-semibold"
            style={{ background: `${stage.color}22`, color: stage.color, border: `1px solid ${stage.color}44` }}
          >
            {stage.label}
          </div>

          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-4 relative"
            style={{
              background: `linear-gradient(135deg, ${stage.color}33, ${stage.color}15)`,
              border: `2px solid ${stage.color}55`,
              boxShadow: `0 0 40px ${stage.color}40`,
            }}
          >
            {stage.emoji}
          </div>

          <h3 className="text-white text-base font-bold mb-0.5">{currentProfile.name}</h3>
          <p className="text-white/50 text-xs mb-4">{currentProfile.title || "입문기 개발자"}</p>

          <div className="w-full rounded-xl p-3 mb-3 bg-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/60 text-xs">레벨</span>
              <span className="text-xs font-bold" style={{ color: stage.color }}>
                Lv.{currentProfile.level}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${xpPct}%`, background: stage.color }} />
            </div>
            <p className="text-white/30 text-[10px] mt-1">
              {currentProfile.xp.toLocaleString()} XP
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 mt-auto">
            <div className="rounded-xl p-2.5 text-center bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-white text-sm font-bold">{currentProfile.totalMissionsCompleted || completedCount}</p>
              <p className="text-white/40 text-[10px]">완료 미션</p>
            </div>
            <div className="rounded-xl p-2.5 text-center bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <p className="text-white text-sm font-bold flex items-center justify-center gap-0.5">🔥 {currentProfile.streak}</p>
              <p className="text-white/40 text-[10px]">연속 일수</p>
            </div>
          </div>
        </div>

        {/* Competency Analysis */}
        <div className="col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 flex flex-col flex-1 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-800 text-sm font-bold">📊 역량 분석</h3>
                <p className="text-slate-400 text-xs">영역별 현재 수준</p>
                </div>
                <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-2.5 py-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-indigo-600 text-xs font-semibold">평균 {avgCompetency}</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={competencyData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} />
                    <Radar name="역량" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 mt-2">
                <p className="text-indigo-900 text-[11px] leading-relaxed">
                  💡 <span className="font-semibold">AI 분석:</span> {competencyComment}
                </p>
              </div>
          </div>
        </div>

        {/* Today's Mission */}
        <div className="col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 flex-1 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-800 text-sm font-bold">✅ 오늘의 미션</h3>
                <p className="text-indigo-500 text-[10px] font-bold mt-0.5">오늘도 미션 완료하세요!</p>
                </div>
                <a href="/missions" className="text-indigo-500 text-xs hover:text-indigo-700 font-semibold transition-colors">
                  전체 보기 →
                </a>
              </div>
              <div className="space-y-2 mb-4">
                {currentMissions.slice(0, 4).map((mission: any) => (
                  <div 
                    key={mission.id} 
                    onClick={() => !mission.completed && openTILModal(mission)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 group"
                  >
                    {mission.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0 group-hover:text-indigo-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${mission.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"}`}>
                        {mission.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[10px] text-amber-500 font-bold">+{mission.xp_reward || mission.xp} XP</span>
                      </div>
                    </div>
                  </div>
                ))}
                {currentMissions.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-4">오늘은 예정된 미션이 없습니다.</p>
                )}
              </div>
              <div className="pt-3 border-t border-slate-100 mt-auto">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">오늘 완료 현황</span>
                  <span className="text-indigo-600 font-bold">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Heatmap, News */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Activity Heatmap Widget (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="w-full flex-1">
            <ActivityHeatmap data={activity.length > 0 ? activity : dailyMissionCountData} streak={currentProfile.streak} />
          </div>
        </div>

        {/* 최신 뉴스 섹션 (col-span-8) */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-800 text-sm font-bold">📰 IT 트렌드 & 연구 소식</h3>
                <p className="text-slate-400 text-xs">최신 뉴스, 논문, 서비스 소식을 한눈에</p>
              </div>
              <a
                href="/news"
                className="text-indigo-500 text-xs hover:text-indigo-700 font-semibold transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                더보기 →
              </a>
            </div>

            {/* 뉴스 탭 */}
            <div className="flex items-center gap-1.5 mb-5 p-1 bg-slate-50 rounded-xl w-fit">
              {[
                { id: "all", label: "전체" },
                { id: "News", label: "뉴스" },
                { id: "Paper", label: "논문/연구" },
                { id: "Service", label: "서비스" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveNewsTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeNewsTab === tab.id
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {newsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-100 animate-pulse">
                    <div className="h-24 bg-slate-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasNewsData ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm mb-3">아직 수집된 데이터가 없습니다</p>
                <a
                  href="/news"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  뉴스 동기화하러 가기
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {recentNews.slice(0, 4).map((item) => {
                  const type = item.content_type?.toLowerCase() || getSourceType(item.source);
                  const catColor = categoryColors[item.category] || "#6366f1";
                  const catLabel = REVERSE_CATEGORY[item.category] || item.category;
                  const imgUrl = NEWS_CATEGORY_IMAGES[item.category] || NEWS_CATEGORY_IMAGES["General"];

                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group block bg-white"
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.src = NEWS_CATEGORY_IMAGES["General"]; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span
                            className="text-[9px] px-2 py-0.5 rounded-full text-white font-bold"
                            style={{ background: catColor }}
                          >
                            {catLabel}
                          </span>
                          {type === "paper" && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                              📄 논문
                            </span>
                          )}
                          {type === "service" && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">
                              🔧 서비스
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="text-slate-800 text-[11px] font-bold leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                          <span className="text-slate-400 text-[9px] truncate max-w-[80px]">{item.source}</span>
                          <div className="flex items-center gap-0.5 text-slate-400 text-[9px]">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(item.published_at || item.created_at)}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIL Modal */}
      {showTILModal && selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-500">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-slate-800 font-extrabold text-lg">미션 달성 기록하기</h3>
                  <p className="text-slate-500 text-xs">배운 점을 기록하면 포트폴리오로 저장됩니다.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTILModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                <p className="text-indigo-900 font-bold text-sm mb-1">{selectedMission.title}</p>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 text-xs font-bold">+{selectedMission.xp_reward || selectedMission.xp} XP 획득 예정</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-slate-700 text-sm font-bold block">오늘 무엇을 배우셨나요? (TIL)</label>
                <textarea
                  value={tilContent}
                  onChange={(e) => setTilContent(e.target.value)}
                  placeholder="새롭게 알게 된 사실이나 느낀 점을 간단히 적어보세요. (선택사항)"
                  className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none bg-slate-50"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center gap-3 bg-white">
              <button
                onClick={() => setShowTILModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleTILSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 저장 중...</>
                ) : (
                  <>🎉 완료 및 기록하기</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

