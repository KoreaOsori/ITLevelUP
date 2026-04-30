'use client';

import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Share2,
  ExternalLink,
  Calendar,
  Zap,
  Tag,
  Trophy,
  TrendingUp,
  Github,
  Copy,
  CheckCircle,
  Filter,
} from "lucide-react";
import { portfolioItems, competencyData, levelProgressData, userData } from "@/lib/mockData";

const categoryColors: Record<string, string> = {
  "AI/ML": "#6366f1",
  개발: "#10b981",
  클라우드: "#3b82f6",
  보안: "#ef4444",
  DevOps: "#f59e0b",
  일반: "#94a3b8",
};

const categoryBg: Record<string, string> = {
  "AI/ML": "#eef2ff",
  개발: "#f0fdf4",
  클라우드: "#eff6ff",
  보안: "#fef2f2",
  DevOps: "#fffbeb",
  일반: "#f8fafc",
};

const stageEmoji = ["🌱", "🌿", "🌳", "⚡", "🔮"];
const primaryColor = "#6366f1";

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"portfolio" | "stats">("portfolio");
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [copied, setCopied] = useState(false);

  const categories = ["전체", ...Array.from(new Set(portfolioItems.map((p) => p.category)))];

  const filteredItems =
    filterCategory === "전체"
      ? portfolioItems
      : portfolioItems.filter((p) => p.category === filterCategory);

  const totalXP = portfolioItems.reduce((sum, p) => sum + p.xpEarned, 0);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDFDownload = () => {
    alert("포트폴리오 PDF 다운로드 기능은 실제 배포 환경에서 사용 가능합니다.");
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">포트폴리오</h2>
          <p className="text-slate-400 text-sm">완료된 미션이 자동으로 포트폴리오에 기록됩니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-sm hover:bg-indigo-50 transition-colors font-semibold"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                링크 공유
              </>
            )}
          </button>
          <button
            onClick={handlePDFDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:opacity-90 font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Download className="w-4 h-4" />
            PDF 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="col-span-full md:col-span-4 space-y-5">
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1744, #0f0d2e)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: primaryColor, filter: "blur(50px)" }} />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: `${primaryColor}22`, border: `2px solid ${primaryColor}55`, boxShadow: `0 0 30px ${primaryColor}40` }}>
                {stageEmoji[userData.stageIndex]}
              </div>
              <div>
                <h3 className="text-white font-bold">{userData.name}</h3>
                <p className="text-white/50 text-xs mb-1.5">{userData.title}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${primaryColor}33`, color: primaryColor, border: `1px solid ${primaryColor}55` }}>
                  Lv.{userData.level} {userData.stage}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-3 mb-3 bg-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">경험치</span>
                <span className="font-bold" style={{ color: primaryColor }}>{userData.xp.toLocaleString()} / {userData.xpToNextLevel.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(userData.xp / userData.xpToNextLevel) * 100}%`, background: `linear-gradient(90deg, ${primaryColor}, #8b5cf6)` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-2.5 text-center bg-white/5">
                <p className="text-white text-sm font-bold">{portfolioItems.length}</p>
                <p className="text-white/40 text-[10px]">포트폴리오</p>
              </div>
              <div className="rounded-xl p-2.5 text-center bg-white/5">
                <p className="text-white text-sm font-bold">{userData.totalMissionsCompleted}</p>
                <p className="text-white/40 text-[10px]">완료 미션</p>
              </div>
              <div className="rounded-xl p-2.5 text-center bg-white/5">
                <p className="text-amber-400 text-sm font-bold">{totalXP.toLocaleString()}</p>
                <p className="text-white/40 text-[10px]">총 XP</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-slate-800 text-sm font-bold">역량 레이더</h4>
              <div className="flex items-center gap-1 text-indigo-500 text-xs font-bold"><TrendingUp className="w-3.5 h-3.5" /> 평균 64.2</div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={competencyData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }} />
                  <Radar name="역량" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-span-full md:col-span-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("portfolio")} className={`px-4 py-2 rounded-xl text-sm transition-all font-bold ${activeTab === "portfolio" ? "bg-indigo-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-100"}`}>포트폴리오 항목 ({portfolioItems.length})</button>
              <button onClick={() => setActiveTab("stats")} className={`px-4 py-2 rounded-xl text-sm transition-all font-bold ${activeTab === "stats" ? "bg-indigo-500 text-white shadow-md" : "bg-white text-slate-500 border border-slate-100"}`}>통계</button>
            </div>

            {activeTab === "portfolio" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className={`text-xs px-3 py-1.5 rounded-lg transition-all whitespace-nowrap font-bold ${filterCategory === cat ? 'text-white' : 'bg-slate-100 text-slate-500'}`} style={filterCategory === cat ? { background: categoryColors[cat] || "#6366f1" } : {}}>{cat}</button>
                ))}
              </div>
            )}
          </div>

          {activeTab === "portfolio" ? (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0" style={{ background: categoryBg[item.category] || "#f8fafc", border: `1.5px solid ${categoryColors[item.category] || "#94a3b8"}30` }}>
                      {item.category === "AI/ML" ? "🤖" : item.category === "개발" ? "💻" : item.category === "클라우드" ? "☁️" : item.category === "보안" ? "🔒" : item.category === "DevOps" ? "⚙️" : "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-slate-800 text-sm font-bold">{item.title}</h4>
                        <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-500 text-xs font-bold">+{item.xpEarned} XP</span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-3">{item.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">{item.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">#{tag}</span>)}</div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.completedDate}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {item.source}</span>
                        <span className="px-2 py-0.5 rounded-md font-bold" style={{ background: `${categoryColors[item.category] || "#94a3b8"}15`, color: categoryColors[item.category] || "#94a3b8" }}>{item.category}</span>
                        <a href={item.githubUrl} className="ml-auto flex items-center gap-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"><Github className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-2.5 h-2.5" /></a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "총 포트폴리오", value: portfolioItems.length, icon: "📁", color: "#6366f1" },
                  { label: "획득 XP", value: `${totalXP.toLocaleString()}`, icon: "⚡", color: "#f59e0b" },
                  { label: "완료 미션", value: userData.totalMissionsCompleted, icon: "✅", color: "#10b981" },
                  { label: "현재 레벨", value: `Lv.${userData.level}`, icon: "🏆", color: "#8b5cf6" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-50 text-center">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <p className="text-lg font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-slate-400 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #1a1744, #0f0d2e)" }}>
                <div className="text-center sm:text-left">
                  <p className="text-white mb-1 font-bold">포트폴리오를 공유하세요</p>
                  <p className="text-white/50 text-sm">PDF 또는 링크로 나의 IT 역량을 보여주세요</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/10"><Share2 className="w-4 h-4" /> 링크 공유</button>
                  <button onClick={handlePDFDownload} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}><Download className="w-4 h-4" /> PDF 다운로드</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
