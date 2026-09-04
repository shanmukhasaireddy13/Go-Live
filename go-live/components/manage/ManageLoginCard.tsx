"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons";
import { Lock, Loader2 } from "lucide-react";

interface ManageLoginCardProps {
  isAuthenticating: boolean;
  onLogin: () => void;
}

export function ManageLoginCard({ isAuthenticating, onLogin }: ManageLoginCardProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 my-12">
      <Card className="border-(--color-rule) bg-(--color-card) max-w-sm w-full p-8 text-center space-y-5 rounded-xl shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-(--color-card-subtle) border border-(--color-rule) flex items-center justify-center mx-auto text-(--color-ink) shadow-xs">
          <Lock className="w-5 h-5 text-(--color-signal)" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-(--color-ink)">Dashboard Authentication</CardTitle>
          <CardDescription className="text-xs text-(--color-muted)">
            Sign in with your GitHub account to access and manage your Anycast subdomain.
          </CardDescription>
        </div>
        <Button
          disabled={isAuthenticating}
          onClick={onLogin}
          className="w-full bg-(--color-ink) text-(--color-paper) hover:opacity-90 font-bold text-xs h-9 cursor-pointer shadow-xs"
        >
          {isAuthenticating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <GithubIcon className="w-4 h-4 fill-current mr-2" />
          )}
          <span>Sign In with GitHub</span>
        </Button>
      </Card>
    </div>
  );
}
