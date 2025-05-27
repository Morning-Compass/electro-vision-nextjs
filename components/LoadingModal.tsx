// components/LoadingModal.tsx
"use client";

import { Loader2 } from "lucide-react";

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl min-w-[250px]">
        <Loader2 className="animate-spin text-emerald-600 w-12 h-12" />
        <p className="text-lg font-semibold">Just a moment...</p>
      </div>
    </div>
  );
};

export default LoadingModal;
