"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function ParentAuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [errorPopup, setErrorPopup] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (password.length < 4) {
      setPassword((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleVerify = () => {
    if (password === "1234") {
      sessionStorage.setItem("parentAuth", "true");
      router.push("/parent/dashboard");
    } else {
      setErrorPopup("비밀번호가 올바르지 않아요! (기본값: 1234)");
      setPassword("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full py-8 relative">
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
          onClick={() => router.push("/")}
          className="bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 text-base font-bold text-gray-700 min-h-[48px]"
        >
          🏠 홈으로
        </button>
        <h1 className="text-2xl font-bold text-textColor">부모 모드 인증</h1>
        <div className="w-[88px]"></div>
      </div>

      <div className="bg-white w-full p-8 rounded-xl shadow-md text-center mb-6 border-2 border-pink-100 flex flex-col items-center">
        <span className="text-5xl mb-3">🔒</span>
        <h2 className="text-xl font-bold mb-2 text-textColor">부모님 비밀번호를 입력해주세요</h2>
        <p className="text-sm text-gray-500 mb-6">초기 비밀번호는 1234 입니다</p>

        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                password.length > i
                  ? "bg-secondary text-white border-sky-400 shadow-sm"
                  : "bg-pink-50 border-pink-200 text-gray-400"
              }`}
            >
              {password.length > i ? "●" : ""}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="bg-gray-50 hover:bg-pink-50 text-2xl font-bold py-4 rounded-xl border-2 border-pink-100 transition-all active:scale-95 min-h-[64px]"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="bg-gray-100 hover:bg-gray-200 text-lg font-bold py-4 rounded-xl border-2 border-gray-200 transition-all active:scale-95 min-h-[64px]"
          >
            지우기
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="bg-gray-50 hover:bg-pink-50 text-2xl font-bold py-4 rounded-xl border-2 border-pink-100 transition-all active:scale-95 min-h-[64px]"
          >
            0
          </button>
          <button
            onClick={handleVerify}
            className="bg-primary hover:bg-yellow-400 text-lg font-bold py-4 rounded-xl border-2 border-yellow-300 transition-all active:scale-95 min-h-[64px]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
