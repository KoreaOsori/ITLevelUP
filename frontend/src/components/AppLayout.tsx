'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Newspaper,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userData } from "@/lib/mockData";
import Image from "next/image";
import logoImage from "@/imports/Copilot_20260417_152049.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "대시보드", exact: true },
  { to: "/missions", icon: Target, label: "미션" },
  { to: "/calendar", icon: CalendarDays, label: "캘린더 & 테스트" },
  { to: "/news", icon: Newspaper, label: "뉴스 스크랩" },
  { to: "/portfolio", icon: Briefcase, label: "포트폴리오" },
];

const stageColors: Record<number, { from: string; to: string; glow: string }> = {
  0: { from: "#22c55e", to: "#16a34a", glow: "#22c55e40" },
  1: { from: "#6366f1", to: "#8b5cf6", glow: "#6366f140" },
  2: { from: "#f59e0b", to: "#d97706", glow: "#f59e0b40" },
  3: { from: "#ef4444", to: "#dc2626", glow: "#ef444440" },
  4: { from: "#a855f7", to: "#7c3aed", glow: "#a855f740" },
};

const stageEmojis = ["🌱", "🌿", "🌳", "⚡", "🔮"];
const stageLabels = ["입문기", "성장기", "숙련기", "전문가", "마스터"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const res = await fetch(`${API_BASE}/api/user/profile?user_id=${user.id}`);
          if (res.ok) setProfile(await res.json());
        } catch (e) {
          console.error("Layout profile load failed:", e);
        }
      }
    };
    loadProfile();
  }, [user, API_BASE]);

  useEffect(() => {
    if (!authLoading && !user && pathname !== "/login" && pathname !== "/signup") {
      router.replace("/login");
    }
  }, [user, authLoading, router, pathname]);

  if (pathname === "/login" || pathname === "/signup") {
    return <main className="min-h-screen bg-[#f0f4ff]">{children}</main>;
  }

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a1744]">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
        <p className="text-white/60 text-sm font-medium animate-pulse">인증 정보 확인 중...</p>
      </div>
    );
  }

  if (!user) return null;

  const currentProfile = profile || {
    name: user.name || "User",
    title: user.title || "입문기 개발자",
    stage_index: 0,
    level: 1,
    xp: 0,
    streak: 1,
  };
  const stageIdx = currentProfile.stage_index || 0;
  const colors = stageColors[stageIdx] || stageColors[1];
  const emoji = stageEmojis[stageIdx] || "🌿";
  const stageLabel = currentProfile.title || stageLabels[stageIdx] || "입문기";
  const displayName = user.name || currentProfile.name;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#f0f4ff] overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 relative transition-all duration-300"
        style={{
          width: collapsed ? "68px" : "256px",
          background: "linear-gradient(180deg, #1a1744 0%, #0f0d2e 100%)",
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-10 border border-indigo-300/20 transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 2px 8px rgba(99,102,241,0.5)",
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-white" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white" />
          )}
        </button>

        {/* Logo */}
        <div
          className="px-4 py-5 border-b border-white/10 overflow-hidden"
          style={{ minHeight: "72px" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
              <Image src={logoImage} alt="IT LevelUp Logo" className="object-cover" fill />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white text-sm whitespace-nowrap" style={{ fontWeight: 700 }}>
                  IT LevelUp
                </p>
                <p className="text-white/40 text-xs whitespace-nowrap">역량 강화 플랫폼</p>
              </div>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}33, ${colors.to}55)`,
                    border: `2px solid ${colors.from}88`,
                    boxShadow: `0 0 16px ${colors.glow}`,
                  }}
                >
                  {emoji}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{
                    background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                    fontWeight: 700,
                  }}
                >
                  {currentProfile.level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate" style={{ fontWeight: 600 }}>
                  {displayName}
                </p>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                  style={{
                    background: `linear-gradient(90deg, ${colors.from}33, ${colors.to}44)`,
                    color: colors.from,
                    border: `1px solid ${colors.from}55`,
                    fontWeight: 600,
                  }}
                >
                  {stageLabel}
                </span>
                  <div className="mt-1.5">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(currentProfile.xp % 100)}%`, // Simplified XP pct
                          background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                        }}
                      />
                    </div>
                    <p className="text-white/30 text-[10px] mt-0.5">
                      {currentProfile.xp.toLocaleString()} XP
                    </p>
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.to || (item.exact && pathname === item.to);
            return (
              <div key={item.to} className="relative group">
                <Link
                  href={item.to}
                  className={`flex items-center gap-3 rounded-xl transition-all ${
                    collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(90deg, ${colors.from}22, ${colors.to}15)`,
                          border: `1px solid ${colors.from}33`,
                        }
                      : {}
                  }
                >
                  <item.icon
                    className="w-5 h-5 shrink-0"
                    style={isActive ? { color: colors.from } : {}}
                  />
                  {!collapsed && (
                    <>
                      <span className="text-sm flex-1 whitespace-nowrap" style={{ fontWeight: isActive ? 600 : 400 }}>
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 opacity-60 shrink-0" style={{ color: colors.from }} />
                      )}
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
              <span className="text-lg shrink-0">🔥</span>
              <div className="overflow-hidden">
                <p className="text-white text-xs whitespace-nowrap" style={{ fontWeight: 600 }}>
                  {currentProfile.streak}일 연속 달성
                </p>
                <p className="text-white/40 text-[10px] whitespace-nowrap">오늘도 미션 완료하세요!</p>
              </div>
            </div>
          )}

          <button
            className={`w-full flex items-center gap-3 rounded-xl py-2.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all ${
              collapsed ? "px-0 justify-center" : "px-3"
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm whitespace-nowrap">설정</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl py-2.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ${
              collapsed ? "px-0 justify-center" : "px-3"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm whitespace-nowrap">로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8faff]">
        {children}
      </main>
    </div>
  );
}
