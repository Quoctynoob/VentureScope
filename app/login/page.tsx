"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginFormData } from '@/types';
import { FaApple, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/auth";
import Link from "next/link";


export default function LoginPage() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch("email") ?? "";
  const passwordValue = watch("password") ?? "";

  async function onSubmit(data: LoginFormData) {
    setAuthError(null);
    try {
      const nextStep = await loginUser(data.email, data.password);
      if (nextStep.signInStep === "DONE") {
        router.push("/");
      }
    } catch (err: any) {
      if (err.name === "NotAuthorizedException") {
        setAuthError("Incorrect email or password.");
      } else if (err.name === "UserNotFoundException") {
        setAuthError("No account found with this email.");
      } else if (err.name === "UserNotConfirmedException") {
        setAuthError("Please verify your email before logging in.");
      } else {
        setAuthError(err.message ?? "Something went wrong.");
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left half */}
      <div className="hidden lg:block w-1/2 bg-black" >
      </div>

      {/* Right half */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-black tracking-tight">Welcome to lito.ai</h1>
            <p className="mt-1 text-center text-xs text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-black font-medium underline">
                Sign up
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-black text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="lito@example.com"
                {...register("email")}
                className="border-gray-300 focus:border-black focus:ring-black"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div
              className={`space-y-1.5 transition-[opacity,transform] duration-400 ease-out -mx-0.75 px-0.75 pb-0.75 ${
                step === "password"
                  ? "opacity-100 translate-y-0 mt-3 max-h-40"
                  : "opacity-0 -translate-y-1 mt-0 max-h-0 overflow-hidden pointer-events-none"
              }`}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-black text-sm font-medium">
                  Password
                </Label>
                <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="border-gray-300 focus:border-black focus:ring-black"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <p className="mt-2 text-xs text-red-500 text-center">{authError}</p>
            )}

            {step === "email" ? (
              <Button
                type="button"
                disabled={!emailValue.trim()}
                onClick={() => setStep("password")}
                className="mt-3 w-full bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !passwordValue.trim()}
                className="mt-3 w-full bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? "Logging in…" : "Login"}
              </Button>
            )}
          </form>

          {/* Separator */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-300 text-black hover:bg-gray-50 transition-colors"
            >
              <FaApple className="mr-1 h-4 w-4" />
              Login with Apple
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-300 text-black hover:bg-gray-50 transition-colors"
            >
              <FaGoogle className="mr-1 h-4 w-4" />
              Login with Google
            </Button>
          </div>

          {/* Terms */}
          <p className="mt-5 text-center text-xs text-gray-400">
            By clicking continue, you agree to
            <br />
            our{" "}
            <a href="#" className="text-black underline hover:text-gray-700">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-black underline hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}