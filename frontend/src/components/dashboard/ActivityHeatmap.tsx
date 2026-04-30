'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface ActivityData {
  day: string;
  value: number;
}

export function ActivityHeatmap({ data, streak }: { data: ActivityData[], streak: number }) {
  // 간단한 히트맵 구현
  const getColor = (val: number) => {
    if (val === 0) return 'bg-slate-100';
    if (val === 1) return 'bg-indigo-200';
    if (val === 2) return 'bg-indigo-300';
    if (val === 3) return 'bg-indigo-400';
    return 'bg-indigo-600';
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-800 text-sm font-bold">🔥 활동 달성도</h3>
        <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span className="text-orange-600 text-xs font-bold">{streak}일째</span>
        </div>
      </div>
      
      <p className="text-slate-400 text-[11px] mb-4 leading-relaxed">
        최근 7일간의 학습 및 미션 달성 현황입니다. 매일 성장하는 당신을 응원합니다!
      </p>

      <div className="flex items-end justify-between gap-2 h-24 mb-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className={`w-full rounded-md transition-all duration-500 ${getColor(d.value)}`}
              style={{ height: `${(d.value + 1) * 20}%` }}
            />
            <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50">
        <p className="text-slate-600 text-[11px] font-medium">
          {streak >= 7 ? '🎉 1주일 연속 달성 성공!' : `${7 - (streak % 7)}일 더 힘내면 1주일 완성!`}
        </p>
      </div>
    </div>
  );
}
