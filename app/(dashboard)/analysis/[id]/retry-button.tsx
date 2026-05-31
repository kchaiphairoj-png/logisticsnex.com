"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { retriggerExtract } from "@/lib/actions/documents";

export function RetryButton({
  documentId,
  status,
}: {
  documentId: string;
  status: "pending" | "processing" | "done" | "failed";
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const handle = async () => {
    setPending(true);
    await retriggerExtract(documentId);
    router.refresh();
    setPending(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handle}
      disabled={pending || status === "processing"}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      วิเคราะห์ใหม่
    </Button>
  );
}
