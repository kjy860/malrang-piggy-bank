"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

interface Chore {
  id: string;
  child_id: string | null;
  title: string;
  reward_amount: number;
  status: "pending" | "requested" | "approved";
  created_at: string;
}

function ChoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("child_id");

  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successPopup, setSuccessPopup] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) {
      router.push("/");
      return;
    }
    fetchChores();
  }, [childId, router]);

  async function fetchChores() {
    setLoading(true);
    // 공용(child_id is null)이거나 해당 아이의 홈알바 목록 조회
    const { data, error } = await supabase
      .from("chores")
      .select("*")
      .or(`child_id.is.null,child_id.eq.${childId}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setChores(data);
    }
    setLoading(false);
  }

  const handleRequestChore = async (choreId: string) => {
    const { error } = await supabase
      .from("chores")
      .update({ status: "requested", child_id: childId })
      .eq("id", choreId);

    if (error) {
      alert("완료 신청 중 오류가 발생했어요!");
      return;
    }

    setSuccessPopup("부모님께 완료 요청을 보냈어요! 승인을 기다려주세요 🎉");
    fetchChores();
  };

  return (
    <div className="flex flex-col items-center flex-1 w-full py-6 relative">
      {successPopup && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-6 animate-pop">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full border-4 border-green-300">
            <span className="text-5xl mb-4 block">🙌</span>
            <h2 className="text-xl font-bold mb-2 text-textColor">신청 완료!</h2>
            <p className="text-lg text-gray-600 mb-6">{successPopup}</p>
            <Button
              onClick={() => setSuccessPopup(null)}
              className="bg-green-400 text-white font-bold w-full py-3 text-lg"
            >
              확인
            </Button>
          </div>
        </div>
      )}

      <div className="w-full flex justify-between items-center mb-6">
        <button
          onClick={() => router.push(`/bank?child_id=${childId}`)}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          돌아가기
        </button>
        <h1 className="text-2xl font-bold text-textColor">🧹 홈알바 목록</h1>
        <div className="w-[88px]"></div>
      </div>

      <div className="bg-white w-full p-6 rounded-xl shadow-md mb-6 border-2 border-pink-100 text-center">
        <p className="text-base text-gray-600">집안일이나 심부름을 완료하고 보상금을 받아봐요!</p>
      </div>

      {loading ? (
        <div className="text-lg text-gray-500 py-12">불러오는 중...</div>
      ) : chores.length === 0 ? (
        <div className="bg-white w-full p-8 rounded-xl shadow-md text-center border-2 border-pink-100">
          <p className="text-gray-500 text-lg">등록된 홈알바가 없어요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full mb-8">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-textColor mb-1">{chore.title}</h3>
                  <span className="text-lg font-extrabold text-red-500">
                    +{chore.reward_amount.toLocaleString()}원
                  </span>
                </div>
                <div>
                  {chore.status === "pending" && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-bold">
                      미완료
                    </span>
                  )}
                  {chore.status === "requested" && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-bold">
                      승인 대기중 ⏳
                    </span>
                  )}
                  {chore.status === "approved" && (
                    <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold">
                      승인 완료 ✨
                    </span>
                  )}
                </div>
              </div>

              {chore.status === "pending" && (
                <Button
                  onClick={() => handleRequestChore(chore.id)}
                  className="bg-green-400 text-white hover:bg-green-50 w-full py-3 text-lg font-bold shadow-md"
                >
                  완료했어요! 🙌
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChoresPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center flex-1 w-full py-12">로딩 중...</div>}>
      <ChoresContent />
    </Suspense>
  );
}
