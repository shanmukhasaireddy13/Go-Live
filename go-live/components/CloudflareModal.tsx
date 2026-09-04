"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROOT_DOMAIN } from "@/lib/constants";
import { Cloud, ExternalLink, CheckCircle2, ShieldCheck, Lock } from "lucide-react";

interface CloudflareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudflareModal: React.FC<CloudflareModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg bg-(--color-card) border-(--color-rule) text-(--color-ink) p-5 sm:p-6 rounded-lg shadow-xl font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold text-(--color-ink) flex items-center gap-2">
              <Cloud className="w-4 h-4 text-(--color-signal)" />
              Cloudflare Anycast DNS Status
            </DialogTitle>
            <span className="border border-emerald-300 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <DialogDescription className="text-xs text-(--color-muted)">
            Real-time status of the automated Anycast DNS infrastructure powering <code className="font-mono">*.{ROOT_DOMAIN}</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-3 text-xs">
          <div className="p-3.5 rounded-md bg-(--color-card-subtle) border border-(--color-rule) space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Zone Apex:</span>
              <span className="font-mono font-bold text-(--color-ink)">{ROOT_DOMAIN}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Edge Network:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 300+ Anycast PoPs Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">SSL Termination:</span>
              <span className="font-bold text-(--color-ink) flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> Automatic Wildcard SSL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-(--color-muted)">Default Target:</span>
              <span className="font-mono text-(--color-ink)">cname.vercel-dns.com</span>
            </div>
          </div>

          <p className="text-[11px] text-(--color-muted) leading-relaxed">
            All DNS records for claimed subdomains are automatically provisioned and managed directly on Cloudflare Anycast edge servers via server-side API integration.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-(--color-rule)">
          <Button
            size="sm"
            onClick={onClose}
            className="bg-(--color-ink) text-(--color-paper) hover:opacity-90 text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
