"use client";

import React from "react";

interface PiggyAnimationProps {
  className?: string;
}

export default function PiggyAnimation({ className = "" }: PiggyAnimationProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative animate-bounce-small select-none">
        <div className="w-36 h-36 bg-pink-300 rounded-full flex items-center justify-center shadow-lg border-4 border-pink-400 relative overflow-hidden">
          {/* 돼지 귀 왼쪽 */}
          <div className="absolute -top-3 left-6 w-10 h-10 bg-pink-300 rounded-full border-4 border-pink-400 rotate-[-15deg]" />
          {/* 돼지 귀 오른쪽 */}
          <div className="absolute -top-3 right-6 w-10 h-10 bg-pink-300 rounded-full border-4 border-pink-400 rotate-[15deg]" />

          {/* 돼지 코 */}
          <div className="absolute w-14 h-10 bg-pink-400 rounded-2xl flex justify-around items-center shadow-inner mt-4">
            <div className="w-2.5 h-3.5 bg-pink-600 rounded-full" />
            <div className="w-2.5 h-3.5 bg-pink-600 rounded-full" />
          </div>

          {/* 눈 왼쪽 */}
          <div className="absolute top-10 left-9 w-3.5 h-3.5 bg-textColor rounded-full" />
          {/* 눈 오른쪽 */}
          <div className="absolute top-10 right-9 w-3.5 h-3.5 bg-textColor rounded-full" />

          {/* 볼터치 왼쪽 */}
          <div className="absolute top-14 left-6 w-5 h-3 bg-pink-400 rounded-full opacity-70" />
          {/* 볼터치 오른쪽 */}
          <div className="absolute top-14 right-6 w-5 h-3 bg-pink-400 rounded-full opacity-70" />

          {/* 저금통 동전 투입구 */}
          <div className="absolute top-3 w-12 h-2.5 bg-pink-500 rounded-full shadow-inner" />
        </div>

        {/* 반짝이 효과 */}
        <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
      </div>
    </div>
  );
}
