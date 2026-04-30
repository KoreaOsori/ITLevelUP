'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, TrendingUp, Target, Newspaper, Briefcase } from "lucide-react";
import Image from "next/image";
import logoImage from "@/imports/Copilot_20260417_152049.png";

const features = [
  { icon: TrendingUp, title: "역량 성장 추적", desc: "6개 영역별 IT 역량을 레이더 차트로 시각화" },
  { icon: Target, title: "미션 기반 학습", desc: "일간·주간·월간 미션으로 꾸준한 성장 달성" },
  { icon: Newspaper, title: "최신 IT 트렌드", desc: "AI·개발·서비스 분야 뉴스 자동 큐레이션" },
  { icon: Briefcase, title: "포트폴리오 자동 생성", desc: "완료된 미션이 포트폴리오로 자동 기록" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setLoading(true);
    const { error: loginError } = await login(email, password);
    if (!loginError) {
      router.push("/");
    } else {
      setError(loginError || "이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex">
      {/* Left: Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1744 0%, #0f0d2e 100%)" }}
      >
        <div
          className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-20"
          style={{ background: "#6366f1", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15"
          style={{ background: "#8b5cf6", filter: "blur(70px)" }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
            <Image src={logoImage} alt="IT LevelUp Logo" className="object-cover" fill />
          </div>
          <div>
            <p className="text-white text-lg font-bold">IT LevelUp</p>
            <p className="text-white/40 text-xs">개인 IT 역량 강화 플랫폼</p>
          </div>
        </div>

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold"
            style={{
              background: "rgba(99,102,241,0.2)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#a5b4fc",
            }}
          >
            🚀 지금 바로 시작하세요
          </div>
          <h1
            className="text-white mb-4 leading-tight text-4xl font-extrabold"
          >
            나만의 IT 역량을
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              레벨업
            </span>
            하세요
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            미션 기반의 학습 시스템으로 꾸준히 성장하고,
            <br />
            포트폴리오를 자동으로 완성하세요.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  <f.icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{f.title}</p>
                  <p className="text-white/40 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          {[
            { value: "1,200+", label: "활성 사용자" },
            { value: "47,000+", label: "완료된 미션" },
            { value: "98%", label: "만족도" },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-white text-xl font-extrabold">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f4ff]">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
              <Image src={logoImage} alt="IT LevelUp Logo" className="object-cover" fill />
            </div>
            <span className="text-slate-800 text-lg font-bold">IT LevelUp</span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50">
            <h2 className="text-slate-800 mb-1 font-extrabold text-2xl">다시 만나서 반가워요! 👋</h2>
            <p className="text-slate-400 text-sm mb-8">로그인하고 오늘의 미션을 시작하세요</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-700 text-xs mb-1.5 block font-bold">이메일</label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-700 text-xs font-bold">비밀번호</label>
                  <button type="button" className="text-indigo-500 text-xs hover:text-indigo-700 font-medium">비밀번호 찾기</button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-500 text-xs">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 font-bold shadow-lg shadow-indigo-100"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 로그인 중...</span> : "로그인"}
              </button>
            </form>


            <p className="text-center text-slate-400 text-sm mt-6">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-bold">회원가입</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
