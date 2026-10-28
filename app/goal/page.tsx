"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

function GoalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");

  const [title, setTitle] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!childId) {
      router.push("/");
      return;
    }

    async function fetchData() {
      const { data: txData } = await supabase
        .from("transactions")
        .select("type, amount")
        .eq("child_id", childId);

      const txs = txData || [];
      const balance = txs.reduce((acc, tx) => {
        return tx.type === "deposit" ? acc + tx.amount : acc - tx.amount;
      }, 0);
      setCurrentBalance(balance);

      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("child_id", childId)
        .single();

      if (goalData) {
        setTitle(goalData.title);
        setTargetAmount(goalData.target_amount.toString());
      }

      setLoading(false);
    }

    fetchData();
  }, [childId, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;

    if (!title.trim()) {
      setErrorPopup("목표 이름을 입력해주세요!");
      return;
    }

    const parsedTarget = parseInt(targetAmount, 10);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorPopup("목표 금액을 정확히 넣어주세요!");
      return;
    }

    setSubmitting(true);

    const isAchieved = currentBalance >= parsedTarget;

    const { data: existingGoal } = await supabase
      .from("goals")
      .select("id")
      .eq("child_id", childId)
      .single();

    if (existingGoal) {
      const { error } = await supabase
        .from("goals")
        .update({
          title,
          target_amount: parsedTarget,
          current_amount: currentBalance,
          is_achieved: isAchieved,
        })
        .eq("id", existingGoal.id);

      if (error) {
        setErrorPopup("목표 저장 중 오류가 발생했어요!");
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.from("goals").insert([
        {
          child_id: childId,
          title,
          target_amount: parsedTarget,
          current_amount: currentBalance,
          is_achieved: isAchieved,
        },
      ]);

      if (error) {
        setErrorPopup("목표 생성 중 오류가 발생했어요!");
        setSubmitting(false);
        return;
      }
    }

    router.push(`/bank?child_id=${childId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 w-full py-12">
        <p className="text-xl text-gray-500">목표 불러오는 중...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-textColor">저축 목표 설정</h1>
        <div className="w-[88px]"></div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col w-full gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
          <label className="text-base font-bold text-textColor">어떤 장난감이나 선물을 사고 싶나요?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 레고 장난감"
            className="w-full p-4 text-xl font-bold bg-pink-50 rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[60px]"
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
          <label className="text-base font-bold text-textColor">목표 금액은 얼마인가요?</label>
          <div className="relative flex items-center">
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="목표 금액 입력"
              className="w-full p-4 text-2xl font-bold bg-pink-50 rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary text-right pr-12 min-h-[60px]"
            />
            <span className="absolute right-4 text-xl font-bold text-textColor">원</span>
          </div>
        </div>

        <div className="mt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-primary text-textColor font-bold w-full py-4 text-xl shadow-md hover:bg-yellow-400 min-h-[64px]"
          >
            {submitting ? "저장 중..." : "🎯 목표 저장하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function GoalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 w-full py-12">로딩 중...</div>}>
      <GoalContent />
    </Suspense>
  );
}
