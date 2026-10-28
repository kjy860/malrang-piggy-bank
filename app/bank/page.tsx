"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import PiggyAnimation from "@/components/PiggyAnimation";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  memo: string;
  created_at: string;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  is_achieved: boolean;
}

function BankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");

  const [childName, setChildName] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  useEffect(() => {
    if (!childId) {
      router.push("/");
      return;
    }

    async function fetchData() {
      // 아이 정보 조회
      const { data: childData } = await supabase
        .from("children")
        .select("name")
        .eq("id", childId)
        .single();

      if (childData) {
        setChildName(childData.name);
      }

      // 거래 내역 조회
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false });

      const txs: Transaction[] = txData || [];
      setTransactions(txs);

      // 잔액 계산 (deposit - withdraw)
      const calculatedBalance = txs.reduce((acc, tx) => {
        return tx.type === "deposit" ? acc + tx.amount : acc - tx.amount;
      }, 0);
      setBalance(calculatedBalance);

      // 목표 조회
      const { data: goalData } = await supabase
        .from("goals")
        .select("*")
        .eq("child_id", childId)
        .single();

      if (goalData) {
        setGoal(goalData);
        // 만약 current_amount가 잔액과 다를 경우 동기화 또는 목표 달성 체크
        if (!goalData.is_achieved && calculatedBalance >= goalData.target_amount) {
          await supabase
            .from("goals")
            .update({ current_amount: calculatedBalance, is_achieved: true })
            .eq("id", goalData.id);
          setGoal({ ...goalData, current_amount: calculatedBalance, is_achieved: true });
          setShowCelebration(true);
        } else if (goalData.current_amount !== calculatedBalance) {
          await supabase
            .from("goals")
            .update({ current_amount: calculatedBalance })
            .eq("id", goalData.id);
          setGoal({ ...goalData, current_amount: calculatedBalance });
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [childId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 w-full py-12">
        <p className="text-xl text-gray-500">저금통을 여는 중...</p>
      </div>
    );
  }

  const progressPercent = goal
    ? Math.min(Math.floor((balance / goal.target_amount) * 100), 100)
    : 0;

  return (
    <div className="flex flex-col items-center flex-1 w-full py-6 relative">
      {showCelebration && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-6 animate-pop">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full border-4 border-primary">
            <span className="text-6xl mb-4 block">🎉🐷✨</span>
            <h2 className="text-2xl font-bold mb-2 text-textColor">축하합니다!</h2>
            <p className="text-lg text-gray-600 mb-6">저축 목표를 달성했어요!</p>
            <Button
              onClick={() => setShowCelebration(false)}
              className="bg-primary text-textColor font-bold w-full py-3 text-lg"
            >
              신나요! 🥳
            </Button>
          </div>
        </div>
      )}

      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center mb-4">
        <button
          onClick={() => router.push("/")}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          🏠 처음으로
        </button>
        <span className="text-xl font-bold text-textColor">{childName}의 저금통</span>
        <button
          onClick={() => router.push(`/goal?child_id=${childId}`)}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          🎯 목표 설정
        </button>
      </div>

      {/* 저금통 애니메이션 영역 */}
      <div className="my-4">
        <PiggyAnimation />
      </div>

      {/* 현재 잔액 표시 */}
      <div className="bg-white w-full p-6 rounded-xl shadow-md text-center mb-6 border-2 border-pink-100">
        <p className="text-base text-gray-500 mb-1">현재 모은 돈</p>
        <h1 className="text-4xl font-extrabold text-textColor">
          {balance.toLocaleString()}원
        </h1>
      </div>

      {/* 목표 진행도 표시 */}
      {goal && (
        <div className="bg-white w-full p-5 rounded-xl shadow-md mb-6 border-2 border-pink-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-textColor text-base">목표: {goal.title}</span>
            <span className="font-bold text-primary text-base">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-2">
            <div
              className="bg-primary h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{balance.toLocaleString()}원</span>
            <span>목표 {goal.target_amount.toLocaleString()}원</span>
          </div>
        </div>
      )}

      {/* 입출금 버튼 */}
      <div className="w-full flex gap-4 mb-8">
        <Button
          onClick={() => router.push(`/add?child_id=${childId}&type=deposit`)}
          className="flex-1 bg-primary text-textColor hover:bg-yellow-400 py-4 text-xl font-bold"
        >
          💰 돈 넣기
        </Button>
        <Button
          onClick={() => router.push(`/add?child_id=${childId}&type=withdraw`)}
          className="flex-1 bg-secondary text-white hover:bg-sky-400 py-4 text-xl font-bold"
        >
          💸 돈 빼기
        </Button>
      </div>

      {/* 최근 입출금 내역 */}
      <div className="w-full bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 mb-6">
        <h3 className="text-xl font-bold mb-4 text-textColor">최근 내역</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 내역이 없어요. 저금을 시작해봐요!</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center p-3 bg-pink-50/50 rounded-xl border border-pink-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tx.memo.split(" ")[0] || "💰"}</span>
                  <div>
                    <p className="font-bold text-textColor text-base">{tx.memo}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-lg ${
                    tx.type === "deposit" ? "text-red-500" : "text-blue-500"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}{tx.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BankPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 w-full py-12"><p className="text-xl text-gray-500">로딩 중...</p></div>}>
      <BankContent />
    </Suspense>
  );
}
