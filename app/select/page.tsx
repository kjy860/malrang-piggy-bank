"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import PiggyAnimation from "@/components/PiggyAnimation";

interface Child {
  id: string;
  name: string;
  avatar_emoji: string;
}

export default function ChildSelectAliasPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChildren() {
      const { data, error } = await supabase
        .from("children")
        .select("id, name, avatar_emoji")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setChildren(data);
      }
      setLoading(false);
    }

    fetchChildren();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full py-8">
      <div className="mb-6">
        <PiggyAnimation />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-center text-textColor">말랑저금통</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">내 이름을 터치해서 저금통에 들어가봐요!</p>

      {loading ? (
        <div className="text-lg text-gray-500 py-8">불러오는 중...</div>
      ) : children.length === 0 ? (
        <div className="text-center py-6 bg-white/60 rounded-xl p-6 w-full mb-6">
          <p className="text-gray-600 mb-4">등록된 어린이가 없어요!</p>
          <p className="text-sm text-gray-500 mb-4">부모 모드에서 아이를 먼저 추가해주세요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full mb-8">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => router.push(`/bank?child_id=${child.id}`)}
              className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-transform active:scale-95 border-2 border-pink-100 min-h-[80px]"
            >
              <span className="text-4xl p-3 bg-pink-50 rounded-full">{child.avatar_emoji}</span>
              <div className="text-left flex-1">
                <span className="text-2xl font-bold text-textColor">{child.name}</span>
                <p className="text-sm text-gray-500">저금통 열기 🐷</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="w-full mt-auto pt-4 border-t border-pink-200 flex justify-center">
        <Button
          onClick={() => router.push("/parent/auth")}
          className="bg-secondary text-white hover:bg-sky-400 w-full py-4 text-xl"
        >
          🔒 부모 모드
        </Button>
      </div>
    </div>
  );
}
