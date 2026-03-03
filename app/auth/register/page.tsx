"use client";

import { useState } from "react";
import Link from "next/link";
import PageTemplate from "@/components/templates/PageTemplate";
import OLF from "@/ev-lib/ElectroVisionFetch";
import ApiLinks from "@/ev-const/api-links";
import AuthConst from "@/ev-const/authconst";
import Regex from "@/ev-const/regex";
import Themes from "@/ev-const/themes";
import useUserContext from "@/ev-contexts/userContextProvider";
import { User as UserEntityType } from "@/ev-types/user-types";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Zap, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import LoadingModal from "@/components/LoadingModal";

type FormProps = {
  username: string;
  email: string;
  password: string;
  repPassword: string;
};

const benefits = [
  "Manage jobs, teams, and workspaces",
  "Real-time task tracking and scheduling",
  "Built-in reporting and invoicing tools",
  "Secure role-based access control",
];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepPassword, setShowRepPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { UserDispatch } = useUserContext();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormProps>({ mode: "onTouched", reValidateMode: "onChange" });

  const onSubmit: SubmitHandler<FormProps> = async (data) => {
    setIsLoading(true);
    try {
      const response = await OLF.post(ApiLinks.register, {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      const user: UserEntityType = {
        authUser: {
          id: response.id,
          username: response.username,
          account_verified: response.account_valid,
          email: response.email,
          token: response.token,
          created_at: response.created_at,
          roles: response.roles,
        },
        fullUser: null,
        theme: Themes.dark,
        workspaceData: null,
      };

      UserDispatch({ type: "setUser", value: user });
      localStorage.setItem("jwt_token", user.authUser?.token ?? "");
      toast.success("Registration successful! Welcome aboard!");
      router.push("/hub");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Registration failed",
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTemplate allowUnauthenticated>
      {isLoading && <LoadingModal />}

      <div className="min-h-screen flex theme-dark bg-[#0a0f1e]">
        {/* ── left branding ── */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-14 bg-[#0f172a] overflow-hidden border-r border-[#334155]">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ev-yellow/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-ev-yellow/20 flex items-center justify-center">
              <Zap className="w-8 h-8 text-ev-yellow" />
            </div>

            <div>
              <h1 className="text-4xl font-bold text-slate-100 mb-3 leading-tight">
                Start smarter with{" "}
                <span className="text-ev-yellow">Electro Vision</span>
              </h1>
              <p className="text-slate-400 leading-relaxed">
                Join thousands of electrical professionals who manage their
                projects and teams in one powerful platform.
              </p>
            </div>

            <ul className="flex flex-col gap-3 w-full text-left">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-slate-400 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── right form ── */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* mobile logo */}
            <div className="lg:hidden flex items-center gap-3 justify-center mb-10">
              <div className="w-10 h-10 rounded-xl bg-ev-yellow/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-ev-yellow" />
              </div>
              <span className="text-slate-100 font-bold text-xl">Electro Vision</span>
            </div>

            <div className="bg-[#1e293b] border border-[#334155] rounded-3xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-100 mb-1">Create Account</h2>
                <p className="text-slate-400 text-sm">Set up your Electro Vision account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-400">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      {...register("username", {
                        required: "Username is required",
                        validate: (val) =>
                          Regex.username.test(val) || "Username must be correct",
                      })}
                      type="text"
                      placeholder="yourname"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 pl-10 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-400">{errors.username.message}</p>
                  )}
                </div>

                {/* email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-400">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      {...register("email", {
                        required: "Email is required",
                        validate: (val) =>
                          Regex.emailRegistration.test(val) || "Enter a valid email",
                      })}
                      type="text"
                      placeholder="you@example.com"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 pl-10 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: AuthConst.minPasswordLength,
                          message: `Minimum ${AuthConst.minPasswordLength} characters`,
                        },
                        validate: (val) => {
                          if (!Regex.password.test(val))
                            return "Must contain letters, numbers, and special characters";
                          if (val.toLowerCase() === val)
                            return "Must have at least one uppercase letter";
                          if (!/\d/.test(val))
                            return "Must have at least one number";
                          if (!/[!@#$%^&*(),.?":{}|<>[\]\\\/`~'=_+\-]/.test(val))
                            return "Must have at least one special character";
                          return true;
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      {...register("repPassword", {
                        required: "Please confirm your password",
                        validate: (val) =>
                          getValues("password") === val || "Passwords must match",
                      })}
                      type={showRepPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 placeholder:text-slate-600 text-sm px-4 py-3 pl-10 pr-10 focus:outline-none focus:border-ev-yellow focus:ring-2 focus:ring-ev-yellow/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showRepPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.repPassword && (
                    <p className="text-xs text-red-400">{errors.repPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-ev-yellow text-[#0a0f1e] font-semibold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-slate-400 text-sm mt-6">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-ev-yellow hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
