"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Trash2, Loader2 } from "lucide-react";
import { SubdomainRecord } from "@/lib/types";

interface DeleteDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  domain: SubdomainRecord | null;
  isLoading: boolean;
}

export function DeleteDomainModal({
  isOpen,
  onClose,
  onConfirm,
  domain,
  isLoading,
}: DeleteDomainModalProps) {
  if (!domain) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md bg-(--color-card) border-(--color-rule) p-6 space-y-4">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-(--color-ink) tracking-tight">
            Release Subdomain
          </DialogTitle>
          <DialogDescription className="text-xs text-(--color-muted) leading-relaxed">
            Are you sure you want to release{" "}
            <span className="font-mono font-bold text-(--color-ink) bg-(--color-card-subtle) px-1.5 py-0.5 rounded border border-(--color-rule)">
              {domain.fullDomain}
            </span>
            ? This action cannot be immediately reversed.
          </DialogDescription>
        </DialogHeader>

        {/* 2-Hour Cooldown Warning Banner */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4 shrink-0" />
            <span>2-Hour Registration Cooldown</span>
          </div>
          <p className="text-xs text-(--color-muted) leading-relaxed">
            To protect Cloudflare Anycast edge DNS against rate limits, once you release this domain, your account will enter a <strong>2-hour cooldown</strong> before you can register a new or replacement subdomain.
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="border-(--color-rule) bg-(--color-card) text-(--color-ink) text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Releasing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Confirm &amp; Release</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
