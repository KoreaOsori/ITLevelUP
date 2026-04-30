'use client';

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Zap,
  Brain,
  RefreshCw,
  Trophy,
  Clock,
} from "lucide-react";
import { calendarMissions, quizData } from "@/lib/mockData";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const typeColors: Record<string, { bg: string; color: string; label: string }> = {
  daily: { bg: "#6366f120", color: "#6366f1", label: "일간" },
  weekly: { bg: "#10b98120", color: "#10b981", label: "주간" },
  monthly: { bg: "#f59e0b20", color: "#f59e0b", label: "월간" },
};

const categoryColors: Record<string, string> = {
  "AI/ML": "#6366f1",
  개발: "#10b981",
  클라우드: "#3b82f6",
  보안: "#ef4444",
  DevOps: "#f59e0b",
  데이터: "#8b5cf6",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarTestPage() {
  const today = new Date(2026, 3, 17); // April 17, 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-04-17");

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, xp: 0 });
  const [quizDone, setQuizDone] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const quiz = quizData[quizIndex];
    const isCorrect = idx === quiz.correct;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      xp: s.xp + (isCorrect ? quiz.xp : 0),
    }));
  };

  const nextQuiz = () => {
    if (quizIndex >= quizData.length - 1) {
      setQuizDone(true);
    } else {
      setQuizIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0, xp: 0 });
    setQuizDone(false);
  };

  const currentQuiz = quizData[quizIndex];
  const selectedMissions = selectedDate ? (calendarMissions as any)[selectedDate] || [] : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-slate-800 font-bold text-2xl">캘린더 & 테스트</h2>
        <p className="text-slate-400 text-sm">미션 일정 확인 및 퀴즈로 역량을 점검하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="col-span-full md:col-span-7">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <h3 className="text-slate-800 font-bold">{currentYear}년 {MONTHS[currentMonth]}</h3>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d, i) => (
                <div key={d} className="text-center text-xs py-1 font-bold" style={{ color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#94a3b8" }}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(currentYear, currentMonth, day);
                const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate();
                const isSelected = selectedDate === dateStr;
                const hasMissions = !!(calendarMissions as any)[dateStr];
                const dayMissions = (calendarMissions as any)[dateStr] || [];
                const allCompleted = dayMissions.length > 0 && dayMissions.every((m: any) => m.completed);
                const dayOfWeek = (firstDay + i) % 7;

                return (
                  <button key={day} onClick={() => setSelectedDate(dateStr)} className={`relative flex flex-col items-center p-1.5 rounded-xl transition-all min-h-[52px] ${isSelected ? "bg-indigo-500 text-white shadow-md" : isToday ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50 text-slate-700"}`}>
                    <span className="text-sm font-bold" style={{ color: isSelected ? "white" : dayOfWeek === 0 ? "#ef4444" : dayOfWeek === 6 ? "#3b82f6" : undefined }}>{day}</span>
                    {hasMissions && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-full">
                        {dayMissions.slice(0, 3).map((m: any, mi: number) => <div key={mi} className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? "rgba(255,255,255,0.8)" : typeColors[m.type].color, opacity: m.completed ? 0.5 : 1 }} />)}
                      </div>
                    )}
                    {allCompleted && !isSelected && <span className="absolute top-0.5 right-0.5 text-[8px]">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-wrap">
              {Object.entries(typeColors).map(([type, info]) => (
                <div key={type} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: info.color }} /><span className="text-slate-400 text-xs">{info.label} 미션</span></div>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
              <h4 className="text-slate-800 text-sm mb-3 font-bold">📅 {selectedDate.split("-").slice(1).join("월 ").replace("-", "일")}의 미션</h4>
              {selectedMissions.length > 0 ? (
                <div className="space-y-2">
                  {selectedMissions.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: typeColors[m.type].bg }}>
                      {m.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Clock className="w-4 h-4 shrink-0" style={{ color: typeColors[m.type].color }} />}
                      <span className="text-slate-700 text-sm flex-1 font-bold">{m.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: typeColors[m.type].color }}>{typeColors[m.type].label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6"><div className="text-3xl mb-2">📭</div><p className="text-slate-400 text-sm">이 날에는 예정된 미션이 없습니다.</p></div>
              )}
            </div>
          )}
        </div>

        {/* Quiz Panel */}
        <div className="col-span-full md:col-span-5">
          <div className="rounded-2xl p-4 mb-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #1a1744, #0f0d2e)" }}>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center"><Brain className="w-5 h-5 text-indigo-400" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold">역량 퀴즈</p>
              <p className="text-white/50 text-xs">{quizIndex + 1} / {quizData.length} 문제</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{score.correct} 정답</span></div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /><span className="text-indigo-300 text-xs">+{score.xp} XP</span></div>
            </div>
          </div>

          {!quizDone ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
              <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(quizIndex / quizData.length) * 100}%` }} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: `${categoryColors[currentQuiz.category] || "#6366f1"}15`, color: categoryColors[currentQuiz.category] || "#6366f1" }}>{currentQuiz.category}</span>
                <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-0.5"><Zap className="w-2.5 h-2.5 text-amber-400" /><span className="text-amber-500 text-xs font-bold">+{currentQuiz.xp} XP</span></div>
              </div>

              <h3 className="text-slate-800 text-sm leading-relaxed mb-5 font-bold">Q{quizIndex + 1}. {currentQuiz.question}</h3>

              <div className="space-y-2.5 mb-5">
                {currentQuiz.options.map((opt, i) => {
                  let bg = "white", borderColor = "#e2e8f0", textColor = "#475569";
                  if (showResult) {
                    if (i === currentQuiz.correct) { bg = "#f0fdf4"; borderColor = "#10b981"; textColor = "#10b981"; }
                    else if (i === selectedAnswer) { bg = "#fef2f2"; borderColor = "#ef4444"; textColor = "#ef4444"; }
                  } else if (selectedAnswer === i) { bg = "#eef2ff"; borderColor = "#6366f1"; textColor = "#6366f1"; }

                  return (
                    <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3" style={{ background: bg, borderColor, color: textColor }}>
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold" style={{ background: showResult && i === currentQuiz.correct ? "#10b981" : showResult && i === selectedAnswer ? "#ef4444" : "#f1f5f9", color: showResult && (i === currentQuiz.correct || i === selectedAnswer) ? "white" : "#64748b" }}>{String.fromCharCode(65 + i)}</span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className="p-3.5 rounded-xl mb-4" style={{ background: selectedAnswer === currentQuiz.correct ? "#f0fdf4" : "#fef9c3", borderLeft: `3px solid ${selectedAnswer === currentQuiz.correct ? "#10b981" : "#eab308"}` }}>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium"><span className="font-bold" style={{ color: selectedAnswer === currentQuiz.correct ? "#10b981" : "#ca8a04" }}>{selectedAnswer === currentQuiz.correct ? "✅ 정답!" : "💡 해설"}</span> {currentQuiz.explanation}</p>
                </div>
              )}

              {showResult && <button onClick={nextQuiz} className="w-full py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-indigo-100" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>{quizIndex >= quizData.length - 1 ? "결과 확인" : "다음 문제 →"}</button>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50 text-center">
              <div className="text-5xl mb-4">{score.correct === quizData.length ? "🏆" : score.correct >= 3 ? "🎉" : "📚"}</div>
              <h3 className="text-slate-800 mb-1 font-bold">퀴즈 완료!</h3>
              <p className="text-slate-400 text-sm mb-6">{score.correct === quizData.length ? "완벽한 점수입니다!" : score.correct >= 3 ? "훌륭한 결과입니다!" : "더 연습해 보세요!"}</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-indigo-50 rounded-2xl p-4"><p className="text-indigo-600 text-xl font-bold">{score.correct}</p><p className="text-indigo-400 text-xs">정답</p></div>
                <div className="bg-slate-50 rounded-2xl p-4"><p className="text-slate-700 text-xl font-bold">{quizData.length - score.correct}</p><p className="text-slate-400 text-xs">오답</p></div>
                <div className="bg-amber-50 rounded-2xl p-4"><p className="text-amber-500 text-xl font-bold">+{score.xp}</p><p className="text-amber-400 text-xs">XP 획득</p></div>
              </div>
              <button onClick={resetQuiz} className="w-full py-3 rounded-xl border-2 border-indigo-200 text-indigo-600 text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50"><RefreshCw className="w-4 h-4" /> 다시 풀기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
