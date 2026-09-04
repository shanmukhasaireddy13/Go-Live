"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DNSNodeCheck, SubdomainRecord } from "@/lib/types";
import { DomainService } from "@/lib/domain-service";
import { Globe, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PropagationModalProps {
  domain: SubdomainRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropagationModal: React.FC<PropagationModalProps> = ({
  domain,
  isOpen,
  onClose
}) => {
  const [nodes, setNodes] = useState<DNSNodeCheck[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const checkNodes = () => {
    if (!domain) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const results = DomainService.getGlobalDnsChecks(domain);
      setNodes(results);
      setIsRefreshing(false);
      toast.success("Global Anycast nodes checked!");
    }, 400);
  };

  useEffect(() => {
    if (isOpen && domain) {
      checkNodes();
    }
  }, [isOpen, domain]);

  if (!domain) return null;

  const isReleased = Boolean(domain.isDeleted || domain.status === "RELEASED" || !domain.target);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-xl bg-(--color-card) border-(--color-rule) text-(--color-ink) p-5 sm:p-6 rounded-lg shadow-xl font-sans">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-sm sm:text-base font-bold text-(--color-ink) flex items-center gap-2">
              <Globe className="w-4 h-4 text-(--color-signal)" />
              <span>DNS Health &bull; <span className="font-mono">{domain.fullDomain}</span></span>
            </DialogTitle>
            <Button
              variant="outline"
              size="xs"
              onClick={checkNodes}
              disabled={isRefreshing}
              className="border-(--color-rule) bg-(--color-card) text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-(--color-signal)" : ""}`} />
              <span>Re-check</span>
            </Button>
          </div>
          <DialogDescription className="text-xs text-(--color-muted)">
            {isReleased
              ? "All Anycast DNS records purged. Domain is released and edge routing is offline."
              : <>Live resolution across Anycast edge locations for target <strong className="text-(--color-ink)">{domain.target}</strong></>}
          </DialogDescription>
        </DialogHeader>

        {/* Global Nodes List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto my-2 pr-1">
          {nodes.map((node) => (
            <div
              key={node.nodeId}
              className="p-3 rounded-md bg-(--color-card-subtle) border border-(--color-rule) flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{node.flag}</span>
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-(--color-ink)">
                    <span>{node.city}</span>
                    <span className="text-(--color-muted) text-[11px]">({node.country})</span>
                  </div>
                  <span className="text-[11px] text-(--color-muted) font-mono block truncate max-w-[160px] sm:max-w-none">
                    Target: {isReleased ? "None (DNS Purged)" : node.responseValue}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={isReleased ? "text-amber-500 font-mono font-bold text-xs block" : "text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs block"}>
                    {isReleased ? "Offline" : `${node.latencyMs}ms`}
                  </span>
                  <span className="text-[10px] text-(--color-muted)">
                    {isReleased ? "DNS Purged" : "Anycast PoP"}
                  </span>
                </div>
                {isReleased ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end border-t border-(--color-rule)">
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
