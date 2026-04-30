'use client';

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CheckCircle2,
  Circle,
  Plus,
  Zap,
  Trophy,
  Calendar,
  Tag,
  X,
  ChevronRight,
  Target,
} from "lucide-react";
import { dailyMissions, weeklyMissions, monthlyMissions } from "@/lib/mockData";

type Tab = "daily" | "weekly" | "monthly";
type Mission = {
  id: string;
  title: string;
  description: string;
  category: string;
  xp: number;
  completed: boolean;
  difficulty: string;
  dueDate?: string;
  progress?: number;
};

const difficultyColors: Record<string, string> = {
  쉬움: "#10b981",
  보통: "#3b82f6",
  어려움: "#f59e0b",
  "매우 어려움": "#ef4444",
};

const categoryColors: Record<string, string> = {
  "AI/ML": "#6366f1",
  개발: "#10b981",
  클라우드: "#3b82f6",
  보안: "#ef4444",
  DevOps: "#f59e0b",
  데이터: "#8b5cf6",
  일반: "#94a3b8",
};

const tabLabels: Record<Tab, string> = {
  daily: "일간 미션",
  weekly: "주간 미션",
  monthly: "월간 미션",
};

const tabColors: Record<Tab, string> = {
  daily: "#6366f1",
  weekly: "#10b981",
  monthly: "#f59e0b",
};

export default function MissionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [missions, setMissions] = useState({
    daily: dailyMissions,
    weekly: weeklyMissions,
    monthly: monthlyMissions,
  });
  const [showModal, setShowModal] = useState(false);
  const [newMission, setNewMission] = useState({
    title: "",
    description: "",
    category: "개발",
    difficulty: "보통",
  });

  const currentMissions = (missions[activeTab] as unknown) as Mission[];
  const completed = currentMissions.filter((m) => m.completed).length;
  const total = currentMissions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { name: "완료", value: completed, color: tabColors[activeTab] },
    { name: "미완료", value: total - completed, color: "#e2e8f0" },
  ];

  const categoryStats = Object.entries(categoryColors)
    .map(([ cat]) => ({
      category: cat,
      count: currentMissions.filter((m) => m.category === cat).length,
      completed: currentMissions.filter((m) => m.category === cat && m.completed).length,
    }))
    .filter((s) => s.count > 0);

  const toggleMission = (id: string) => {
    setMissions((prev: any) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((m: Mission) =>
        m.id === id ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  const addMission = () => {
    if (!newMission.title.trim()) return;
    const newItem: Mission = {
      id: `new-${Date.now()}`,
      title: newMission.title,
      description: newMission.description,
      category: newMission.category,
      xp: activeTab === "daily" ? 40 : activeTab === "weekly" ? 150 : 400,
      completed: false,
      difficulty: newMission.difficulty,
      dueDate: activeTab !== "daily" ? "4월 30일" : undefined,
    };
    setMissions((prev: any) => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newItem],
    }));
    setNewMission({ title: "", description: "", category: "개발", difficulty: "보통" });
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-slate-800 font-bold text-2xl">미션 관리</h2>
          <p className="text-slate-400 text-sm">일간·주간·월간 미션을 관리하고 성장하세요</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm transition-all hover:opacity-90 active:scale-95 font-semibold shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}cc)`,
          }}
        >
          <Plus className="w-4 h-4" />
          새로운 미션 추가하기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Missions List */}
        <div className="col-span-full md:col-span-8">
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
            {(["daily", "weekly", "monthly"] as Tab[]).map((tab) => {
              const tabMissions = missions[tab] as any[];
              const tabCompleted = tabMissions.filter((m) => m.completed).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white shadow-md font-bold"
                      : "bg-white text-slate-500 border border-slate-100 hover:border-slate-200 font-medium"
                  }`}
                  style={activeTab === tab ? { background: `linear-gradient(135deg, ${tabColors[tab]}, ${tabColors[tab]}cc)` } : {}}
                >
                  {tabLabels[tab]}
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full"
                    style={activeTab === tab ? { background: "rgba(255,255,255,0.25)", color: "white" } : { background: "#f1f5f9", color: "#64748b" }}
                  >
                    {tabCompleted}/{tabMissions.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {currentMissions.map((mission) => (
              <div
                key={mission.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  mission.completed ? "border-emerald-100 opacity-80" : "border-indigo-50"
                }`}
                onClick={() => toggleMission(mission.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {mission.completed ? (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#10b981]">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5" style={{ color: tabColors[activeTab] }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold ${mission.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                      {mission.title}
                    </h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-2">{mission.description}</p>

                    {activeTab === "monthly" && "progress" in mission && !mission.completed && (
                      <div className="mb-2">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>진행률</span>
                          <span style={{ color: tabColors[activeTab], fontWeight: 600 }}>{mission.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${mission.progress}%`, background: tabColors[activeTab] }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ background: `${categoryColors[mission.category] || "#94a3b8"}15`, color: categoryColors[mission.category] || "#94a3b8" }}>
                        <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                        {mission.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" style={{ background: `${difficultyColors[mission.difficulty]}15`, color: difficultyColors[mission.difficulty] }}>
                        {mission.difficulty}
                      </span>
                      {mission.dueDate && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-medium">
                          <Calendar className="w-2.5 h-2.5" /> {mission.dueDate}까지
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-500 text-sm font-bold">+{mission.xp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Stats */}
        <div className="col-span-full md:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
            <h4 className="text-slate-800 text-sm mb-4 font-bold">완료율</h4>
            <div className="relative h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-extrabold" style={{ color: tabColors[activeTab] }}>{pct}%</p>
                  <p className="text-slate-400 text-[11px]">완료</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="rounded-xl p-2.5 text-center" style={{ background: `${tabColors[activeTab]}10` }}>
                <p className="text-slate-800 font-bold">{completed}</p>
                <p className="text-slate-400 text-[10px]">완료</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-slate-800 font-bold">{total - completed}</p>
                <p className="text-slate-400 text-[10px]">남은 미션</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
            <h4 className="text-slate-800 text-sm mb-4 font-bold">카테고리별 현황</h4>
            <div className="space-y-3">
              {categoryStats.map((stat) => (
                <div key={stat.category}>
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-slate-600">{stat.category}</span>
                    <span className="font-bold" style={{ color: categoryColors[stat.category] || "#94a3b8" }}>{stat.completed}/{stat.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${stat.count > 0 ? (stat.completed / stat.count) * 100 : 0}%`, background: categoryColors[stat.category] || "#94a3b8" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: tabColors[activeTab] }}>
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-slate-800 font-bold">새로운 미션 추가</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X className="w-4 h-4 text-slate-600" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-700 text-xs mb-1.5 block font-bold">미션 제목 *</label>
                <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100" placeholder="미션 제목을 입력하세요" value={newMission.title} onChange={(e) => setNewMission({ ...newMission, title: e.target.value })} />
              </div>
              <div>
                <label className="text-slate-700 text-xs mb-1.5 block font-bold">설명</label>
                <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="미션 세부 내용을 입력하세요" rows={3} value={newMission.description} onChange={(e) => setNewMission({ ...newMission, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">카테고리</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white" value={newMission.category} onChange={(e) => setNewMission({ ...newMission, category: e.target.value })}>{Object.keys(categoryColors).map(c => <option key={c}>{c}</option>)}</select>
                </div>
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">난이도</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white" value={newMission.difficulty} onChange={(e) => setNewMission({ ...newMission, difficulty: e.target.value })}>{Object.keys(difficultyColors).map(d => <option key={d}>{d}</option>)}</select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">취소</button>
              <button onClick={addMission} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg" style={{ background: `linear-gradient(135deg, ${tabColors[activeTab]}, ${tabColors[activeTab]}cc)` }}>미션 추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
