"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ReviewEntry = {
  id: string;
  scenario: string;
  riskLevel: string;
  createdAt: string;
  message: {
    id: string;
    bookingId: string | null;
    subject: string | null;
    body: string;
    recipientEmail: string | null;
    messageType: string;
  };
};

interface ReviewQueueCardProps {
  reviews: ReviewEntry[];
}

export function ReviewQueueCard({ reviews }: ReviewQueueCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAction = (id: string, action: "approve" | "reject") => {
    startTransition(async () => {
      await fetch(`/api/admin/operations/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review queue</CardTitle>
        <CardDescription>High-touch messages awaiting approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">No messages need approval right now.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{review.scenario.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(review.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant="outline">{review.riskLevel}</Badge>
            </div>
            <p className="text-sm font-medium">{review.message.subject ?? "Message preview"}</p>
            <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-3">
              {review.message.body}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(review.id, "approve")}
                disabled={isPending}
              >
                Approve & send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(review.id, "reject")}
                disabled={isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

