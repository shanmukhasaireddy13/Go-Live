"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { ArrowRight, Loader2 } from "lucide-react";

interface ClaimStep1AuthProps {
  isAuthenticating: boolean;
  onLogin: () => void;
}

export function ClaimStep1Auth({ isAuthenticating, onLogin }: ClaimStep1AuthProps) {
  const router = useRouter();

  return (
    <Card className="border-(--color-rule) bg-(--color-card) rounded-xl shadow-lg overflow-hidden">
      <CardHeader className="p-6 sm:p-7 space-y-3">
        <div className="w-10 h-10 rounded-full bg-(--color-card-subtle) border border-(--color-rule) flex items-center justify-center text-(--color-ink)">
          <GithubIcon className="w-5 h-5 fill-current" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg font-extrabold text-(--color-ink)">
            Developer Verification
          </CardTitle>
          <CardDescription className="text-xs text-(--color-muted) leading-relaxed">
            Connect your GitHub account to claim 1 free production subdomain slot.
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="bg-(--color-card-subtle) border-t border-(--color-rule) p-6 sm:p-7 flex flex-col gap-3">
        <Button
          disabled={isAuthenticating}
          onClick={onLogin}
          className="w-full bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold py-3 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isAuthenticating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to GitHub...</span>
            </>
          ) : (
            <>
              <GithubIcon className="w-4 h-4 fill-current" />
              <span>Continue with GitHub</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-(--color-muted) leading-relaxed">
          By continuing, you agree to our{" "}
          <button
            onClick={() => router.push("/terms")}
            className="underline hover:text-(--color-ink) cursor-pointer"
          >
            Terms
          </button>{" "}
          and{" "}
          <button
            onClick={() => router.push("/privacy")}
            className="underline hover:text-(--color-ink) cursor-pointer"
          >
            Privacy Policy
          </button>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
