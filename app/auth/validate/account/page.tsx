"use client";

import ApiLinks from "@/ev-const/api-links";
import PageTemplate from "@/components/templates/PageTemplate";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OLF from "@/ev-lib/ElectroVisionFetch";
import { CheckCircle, Loader2, XCircle, Zap } from "lucide-react";

export default function VerifyAccountPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Read token from query string (?token=...) or path hash
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") ?? window.location.hash.replace("#", "");
    setToken(t || null);
  }, []);

  useEffect(() => {
    if (!token) return;

    const validate = async () => {
      try {
        await OLF.put(`${ApiLinks.validateAccount}/${token}`);
        setStatus("success");
        toast.success("Account validated!", { duration: 3000 });
      } catch (error) {
        console.error("Validation error:", error);
        setStatus("error");
        toast.error(
          error instanceof Error ? error.message : "Account validation failed",
          { duration: 5000 }
        );
      }
    };

    validate();
  }, [token]);

  return (
    <PageTemplate allowUnauthenticated>
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-ev-yellow/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-ev-yellow" />
          </div>

          {status === "loading" && (
            <>
              <Loader2 className="w-8 h-8 text-ev-yellow animate-spin mx-auto mb-4" />
              <h2 className="text-slate-100 font-semibold text-lg mb-1">Verifying your account</h2>
              <p className="text-slate-400 text-sm">Please wait a moment...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
              <h2 className="text-slate-100 font-semibold text-lg mb-1">Account verified!</h2>
              <p className="text-slate-400 text-sm">Your Electro Vision account is now active.</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h2 className="text-slate-100 font-semibold text-lg mb-1">Verification failed</h2>
              <p className="text-slate-400 text-sm">The token may be invalid or expired.</p>
            </>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}
