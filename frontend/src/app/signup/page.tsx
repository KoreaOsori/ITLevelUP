'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import logoImage from "@/imports/Copilot_20260417_152049.png";

const stages = [
  { emoji: "🌱", label: "입문기", desc: "IT를 처음 시작하는 단계" },
  { emoji: "🌿", label: "성장기", desc: "기초를 다지고 있는 단계" },
  { emoji: "🌳", label: "숙련기", desc: "실무 경험이 있는 단계" },
  { emoji: "⚡", label: "전문가", desc: "깊이 있는 전문 지식 보유" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: 기본정보, 2: 관심분야
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [selectedStage, setSelectedStage] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);

  const interestOptions = [
    { label: "AI/ML", emoji: "🤖" },
    { label: "웹 개발", emoji: "💻" },
    { label: "클라우드", emoji: "☁️" },
    { label: "보안", emoji: "🔒" },
    { label: "DevOps", emoji: "⚙️" },
    { label: "데이터 분석", emoji: "📊" },
    { label: "모바일", emoji: "📱" },
    { label: "블록체인", emoji: "🔗" },
  ];

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("이름을 입력해 주세요."); return; }
    if (!email.trim()) { setError("이메일을 입력해 주세요."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }
    if (password !== confirmPw) { setError("비밀번호가 일치하지 않습니다."); return; }
    setStep(2);
  };

  const handleStep2 = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: signupError } = await signup(name, email, password, selectedStage, interests);
      if (signupError) {
        setError(signupError);
        setStep(1); // Go back to fix errors
      } else {
        router.push("/");
      }
    } catch (e: any) {
      setError(e.message || "회원가입 중 오류가 발생했습니다.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
            <Image src={logoImage} alt="IT LevelUp Logo" className="object-cover" fill />
          </div>
          <span className="text-slate-800 text-xl font-extrabold">IT LevelUp</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all" style={step > s ? { background: "#10b981", color: "white" } : step === s ? { background: "#6366f1", color: "white", boxShadow: "0 0 12px #6366f150" } : { background: "#e2e8f0", color: "#94a3b8" }}>{step > s ? <CheckCircle2 className="w-4 h-4" /> : s}</div>
              <span className="text-sm font-bold" style={{ color: step === s ? "#1e293b" : "#94a3b8" }}>{s === 1 ? "기본 정보" : "나의 수준"}</span>
              {s < 2 && <div className="w-8 h-px bg-slate-200 ml-1" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50">
          {step === 1 ? (
            <>
              <h2 className="text-slate-800 mb-1 font-extrabold text-2xl">계정 만들기 ✨</h2>
              <p className="text-slate-400 text-sm mb-6">IT LevelUp과 함께 성장을 시작하세요</p>
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">이름</label>
                  <input type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                </div>
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">이메일</label>
                  <input type="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                </div>
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">비밀번호</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="6자 이상 입력" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 text-xs mb-1.5 block font-bold">비밀번호 확인</label>
                  <div className="relative">
                    <input type={showConfirmPw ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {confirmPw && <p className={`text-[11px] mt-1 font-bold ${password === confirmPw ? "text-emerald-500" : "text-red-400"}`}>{password === confirmPw ? "✓ 비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}</p>}
                </div>
                {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-500 text-xs">{error}</div>}
                <button type="submit" className="w-full py-3.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-100" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>다음 단계 →</button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-slate-800 mb-1 font-extrabold text-2xl">현재 나의 수준은? 🎯</h2>
              <p className="text-slate-400 text-sm mb-6">맞춤형 미션과 학습 경로를 추천해 드릴게요</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {stages.map((s, i) => (
                  <button key={i} onClick={() => setSelectedStage(i)} className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedStage === i ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white'}`}>
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <p className="text-slate-800 text-sm font-bold">{s.label}</p>
                    <p className="text-slate-400 text-xs">{s.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-slate-700 text-xs mb-2 font-bold">관심 분야 선택 (복수 선택 가능)</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {interestOptions.map((opt) => (
                  <button key={opt.label} onClick={() => toggleInterest(opt.label)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all border font-bold ${interests.includes(opt.label) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`}><span>{opt.emoji}</span>{opt.label}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">← 이전</button>
                <button onClick={handleStep2} disabled={loading} className="flex-1 py-3 rounded-xl text-white text-sm font-bold shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>{loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 가입 중...</span> : "🚀 시작하기"}</button>
              </div>
            </>
          )}
          <p className="text-center text-slate-400 text-sm mt-5">이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 font-bold">로그인</Link></p>
        </div>
      </div>
    </div>
  );
}
