// components/LoadingModal.tsx
"use client";

import { Loader2 } from "lucide-react";

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-2xl min-w-[220px]">
        <Loader2 className="animate-spin text-[#F6AA1C] w-10 h-10" />
        <p className="text-sm font-medium text-slate-300">Just a moment...</p>
      </div>
    </div>
  );
};

export default LoadingModal;
