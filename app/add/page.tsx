"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

const EMOJI_OPTIONS = ["💰", "🪙", "💵", "🎁", "⭐", "🍎", "🧸", "📚", "🎨", "🍭"];

function AddContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");

  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("💰 용돈");
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorPopup("금액을 정확히 넣어주세요!");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("transactions").insert([
      {
        child_id: childId,
        type,
        amount: parsedAmount,
        memo,
      },
    ]);

    if (error) {
      setErrorPopup("저장 중 오류가 발생했어요. 다시 시도해주세요!");
      setSubmitting(false);
      return;
    }

    router.push(`/bank?child_id=${childId}`);
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full py-6 relative">
      {errorPopup && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-6 animate-pop">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full border-4 border-red-300">
            <span className="text-5xl mb-4 block">🚨</span>
            <h2 className="text-xl font-bold mb-2 text-textColor">알림</h2>
            <p className="text-lg text-gray-600 mb-6">{errorPopup}</p>
            <Button
              onClick={() => setErrorPopup(null)}
              className="bg-primary text-textColor font-bold w-full py-3 text-lg"
            >
              확인
            </Button>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => router.push(`/bank?child_id=${childId}`)}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          돌아가기
        </button>
        <h1 className="text-2xl font-bold text-textColor">돈 넣고 빼기</h1>
        <div className="w-[88px]"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={() => setType("deposit")}
            className={`flex-1 py-4 rounded-xl text-xl font-bold shadow-md transition-all min-h-[64px] ${
              type === "deposit"
                ? "bg-primary text-textColor border-4 border-yellow-400 scale-105"
                : "bg-white text-gray-500"
            }`}
          >
            🐷 돈 넣기
          </button>
          <button
            type="button"
            onClick={() => setType("withdraw")}
            className={`flex-1 py-4 rounded-xl text-xl font-bold shadow-md transition-all min-h-[64px] ${
              type === "withdraw"
                ? "bg-secondary text-white border-4 border-sky-300 scale-105"
                : "bg-white text-gray-500"
            }`}
          >
            💸 돈 빼기
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
          <label className="text-base font-bold text-textColor">얼마인가요?</label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="금액을 입력하세요"
              className="w-full p-4 text-2xl font-bold bg-pink-50 rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary text-right pr-12 min-h-[60px]"
            />
            <span className="absolute right-4 text-xl font-bold text-textColor">원</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
          <label className="text-base font-bold text-textColor">어떤 사유인가요? (이모지 선택)</label>
          <div className="grid grid-cols-5 gap-3">
            {EMOJI_OPTIONS.map((emoji) => {
              const labelMap: Record<string, string> = {
                "💰": "용돈",
                "🪙": "저축",
                "💵": "심부름",
                "🎁": "선물",
                "⭐": "칭찬",
                "🍎": "간식",
                "🧸": "장난감",
                "📚": "책",
                "🎨": "미술",
                "🍭": "군것질",
              };
              const memoText = `${emoji} ${labelMap[emoji] || "기타"}`;
              const isSelected = memo.startsWith(emoji);

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setMemo(memoText)}
                  className={`text-3xl p-3 rounded-xl border-2 transition-all min-h-[60px] flex items-center justify-center ${
                    isSelected
                      ? "bg-pink-100 border-primary scale-110 shadow-sm"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="사유를 직접 입력할 수도 있어요"
            className="w-full p-4 text-base bg-pink-50 rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[50px] mt-2"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="bg-primary text-textColor font-bold w-full py-5 text-xl mt-4 shadow-lg hover:bg-yellow-400 min-h-[64px]"
        >
          {submitting ? "저장 중..." : "저장하기 💾"}
        </Button>
      </form>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-lg text-gray-500">로딩 중...</div>}>
      <AddContent />
    </Suspense>
  );
}
