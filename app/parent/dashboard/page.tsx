"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

interface Child {
  id: string;
  name: string;
  avatar_emoji: string;
  created_at: string;
}

interface Transaction {
  id: string;
  child_id: string;
  type: "deposit" | "withdraw";
  amount: number;
  memo: string;
  created_at: string;
}

interface Chore {
  id: string;
  child_id: string | null;
  title: string;
  reward_amount: number;
  status: "pending" | "requested" | "approved";
  created_at: string;
}

const EMOJI_OPTIONS = ["👧", "👦", "🧒", "👶", "🐱", "🐶", "🐰", "🦁", "⭐", "🦄"];

export default function ParentDashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean>(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 아이 추가 폼 state
  const [newName, setNewName] = useState<string>("");
  const [newEmoji, setNewEmoji] = useState<string>("👧");

  // 홈알바 등록 폼 state
  const [choreTitle, setChoreTitle] = useState<string>("");
  const [choreReward, setChoreReward] = useState<string>("");
  const [choreTargetChild, setChoreTargetChild] = useState<string>("all");

  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("parentAuth");
    if (!isAuth) {
      router.push("/parent/auth");
      return;
    }
    setAuthed(true);
    fetchData();
  }, [router]);

  async function fetchData() {
    setLoading(true);
    const { data: childData } = await supabase
      .from("children")
      .select("*")
      .order("created_at", { ascending: true });

    if (childData) {
      setChildren(childData);
    }

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (txData) {
      setTransactions(txData);
    }

    const { data: choreData } = await supabase
      .from("chores")
      .select("*")
      .order("created_at", { ascending: false });

    if (choreData) {
      setChores(choreData);
    }

    setLoading(false);
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorPopup("아이 이름을 입력해주세요!");
      return;
    }

    const { error } = await supabase.from("children").insert([
      {
        name: newName.trim(),
        avatar_emoji: newEmoji,
      },
    ]);

    if (error) {
      setErrorPopup("아이 추가 중 오류가 발생했어요!");
      return;
    }

    setNewName("");
    setNewEmoji("👧");
    fetchData();
  };

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`정말 "${childName}" 아이의 저금통과 모든 기록을 삭제하시겠습니까?`)) {
      return;
    }

    const { error } = await supabase.from("children").delete().eq("id", childId);
    if (error) {
      setErrorPopup("아이 삭제 중 오류가 발생했어요!");
      return;
    }
    fetchData();
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("이 입출금 기록을 삭제하시겠습니까? 잔액이 다시 계산됩니다.")) {
      return;
    }

    const { error } = await supabase.from("transactions").delete().eq("id", txId);
    if (error) {
      setErrorPopup("기록 삭제 중 오류가 발생했어요!");
      return;
    }
    fetchData();
  };

  const handleAddChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choreTitle.trim()) {
      setErrorPopup("홈알바 이름을 입력해주세요!");
      return;
    }

    const parsedReward = parseInt(choreReward, 10);
    if (isNaN(parsedReward) || parsedReward <= 0) {
      setErrorPopup("보상 금액을 정확히 입력해주세요!");
      return;
    }

    const { error } = await supabase.from("chores").insert([
      {
        title: choreTitle.trim(),
        reward_amount: parsedReward,
        child_id: choreTargetChild === "all" ? null : choreTargetChild,
        status: "pending",
      },
    ]);

    if (error) {
      setErrorPopup("홈알바 등록 중 오류가 발생했어요!");
      return;
    }

    setChoreTitle("");
    setChoreReward("");
    setChoreTargetChild("all");
    fetchData();
  };

  const handleApproveChore = async (chore: Chore) => {
    if (!chore.child_id) {
      setErrorPopup("알바를 수행한 아이 정보가 지정되지 않았습니다.");
      return;
    }

    // 1. transactions에 입금 내역 추가
    const { error: txError } = await supabase.from("transactions").insert([
      {
        child_id: chore.child_id,
        type: "deposit",
        amount: chore.reward_amount,
        memo: `홈알바: ${chore.title}`,
      },
    ]);

    if (txError) {
      setErrorPopup("저금통 잔액 적립 중 오류가 발생했어요!");
      return;
    }

    // 2. chores 상태를 'approved'로 변경
    const { error: choreError } = await supabase
      .from("chores")
      .update({ status: "approved" })
      .eq("id", chore.id);

    if (choreError) {
      setErrorPopup("알바 승인 상태 업데이트 중 오류가 발생했어요!");
      return;
    }

    fetchData();
  };

  const handleDeleteChore = async (choreId: string) => {
    if (!confirm("이 홈알바 항목을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("chores").delete().eq("id", choreId);
    if (error) {
      setErrorPopup("홈알바 삭제 중 오류가 발생했어요!");
      return;
    }
    fetchData();
  };

  if (!authed) return null;

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
          onClick={() => {
            sessionStorage.removeItem("parentAuth");
            router.push("/");
          }}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          🔒 나가기
        </button>
        <h1 className="text-2xl font-bold text-textColor">부모 모드 관리</h1>
        <div className="w-[88px]"></div>
      </div>

      {loading ? (
        <div className="text-lg text-gray-500 py-12">불러오는 중...</div>
      ) : (
        <div className="flex flex-col w-full gap-8">
          {/* 아이 추가 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-textColor">➕ 새로운 아이 등록</h2>
            <form onSubmit={handleAddChild} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">프로필 이모지</label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewEmoji(emoji)}
                      className={`text-2xl p-2 rounded-xl border-2 transition-all min-h-[48px] flex items-center justify-center ${
                        newEmoji === emoji
                          ? "bg-pink-100 border-primary scale-110"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-2 block">아이 이름</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 민서"
                  className="w-full p-4 text-lg bg-pink-50 rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[52px]"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary text-textColor font-bold w-full py-3 text-lg shadow-sm"
              >
                아이 등록하기 🐷
              </Button>
            </form>
          </div>

          {/* 등록된 아이 목록 & 삭제 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-textColor">👶 등록된 아이 목록</h2>
            {children.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">등록된 아이가 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 bg-pink-50/50 rounded-xl border border-pink-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{child.avatar_emoji}</span>
                      <span className="text-xl font-bold text-textColor">{child.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/bank?child_id=${child.id}`)}
                        className="bg-secondary text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-sky-400 min-h-[40px]"
                      >
                        저금통 가기
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child.id, child.name)}
                        className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-200 min-h-[40px]"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 홈알바 등록 및 승인 관리 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-textColor">🧹 홈알바(집안일) 관리 및 승인</h2>

            {/* 홈알바 등록 폼 */}
            <form onSubmit={handleAddChore} className="flex flex-col gap-4 bg-pink-50/40 p-4 rounded-xl border border-pink-200">
              <h3 className="text-lg font-bold text-textColor">새 홈알바 등록</h3>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">알바 이름</label>
                <input
                  type="text"
                  value={choreTitle}
                  onChange={(e) => setChoreTitle(e.target.value)}
                  placeholder="예: 설거지하기"
                  className="w-full p-3 text-base bg-white rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[48px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">보상 금액 (원)</label>
                  <input
                    type="number"
                    value={choreReward}
                    onChange={(e) => setChoreReward(e.target.value)}
                    placeholder="예: 2000"
                    className="w-full p-3 text-base bg-white rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">대상 아이</label>
                  <select
                    value={choreTargetChild}
                    onChange={(e) => setChoreTargetChild(e.target.value)}
                    className="w-full p-3 text-base bg-white rounded-xl border-2 border-pink-200 focus:outline-none focus:border-primary min-h-[48px]"
                  >
                    <option value="all">전체 아이 공용</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-green-400 text-white font-bold w-full py-3 text-lg shadow-sm hover:bg-green-50"
              >
                홈알바 등록하기 📝
              </Button>
            </form>

            {/* 홈알바 목록 및 승인 대기 처리 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-textColor">등록된 홈알바 및 승인 대기 목록</h3>
              {chores.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">등록된 홈알바가 없습니다.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                  {chores.map((chore) => {
                    const assignedChild = children.find((c) => c.id === chore.child_id);
                    return (
                      <div
                        key={chore.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-secondary">
                              [{assignedChild ? assignedChild.name : "전체 공용"}]
                            </span>
                            <span className="font-bold text-sm text-red-500">
                              +{chore.reward_amount.toLocaleString()}원
                            </span>
                          </div>
                          <span className="text-base font-bold text-textColor">{chore.title}</span>
                          <span className="text-xs text-gray-400">
                            상태: {chore.status === "pending" && "미완료"}
                            {chore.status === "requested" && "승인 대기중 ⏳"}
                            {chore.status === "approved" && "승인 완료 ✨"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {chore.status === "requested" && (
                            <button
                              onClick={() => handleApproveChore(chore)}
                              className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-600 min-h-[40px]"
                            >
                              승인 & 적립 💰
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteChore(chore.id)}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-200 min-h-[40px]"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 전체 내역 및 강제 수정(삭제) 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-100 flex flex-col gap-4 mb-8">
            <h2 className="text-xl font-bold text-textColor">📜 전체 입출금 내역 관리</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">입출금 내역이 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {transactions.map((tx) => {
                  const child = children.find((c) => c.id === tx.child_id);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-secondary">
                            [{child ? child.name : "알 수 없음"}]
                          </span>
                          <span
                            className={`font-bold text-sm ${
                              tx.type === "deposit" ? "text-red-500" : "text-blue-500"
                            }`}
                          >
                            {tx.type === "deposit" ? "입금" : "출금"}
                          </span>
                        </div>
                        <span className="text-base text-textColor font-medium">{tx.memo}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-bold ${
                            tx.type === "deposit" ? "text-textColor" : "text-blue-600"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}
                          {tx.amount.toLocaleString()}원
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="bg-red-100 text-red-600 p-2 rounded-lg text-xs font-bold hover:bg-red-200 min-h-[36px]"
                        >
                          기록 삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
