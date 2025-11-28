"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  listReviewJobs,
  getReviewJob,
  approveReviewJob,
  rejectReviewJob,
  type AgentsReviewJob,
} from "@/lib/agents-client";
import { TONE_PRESETS, type TonePresetId } from "@/content/tone-presets";

type ContentType =
  | "BLOG"
  | "AD"
  | "REVIEW_REPLY"
  | "CUSTOMER_REPLY"
  | "DOCUMENT_SUMMARY";

interface CreateContentFormState {
  instructions: string;
  contentType: ContentType;
  targetCity: string;
  serviceType: string;
  tone: string;
}

const DEFAULT_FORM: CreateContentFormState = {
  instructions: "",
  contentType: "BLOG",
  targetCity: "",
  serviceType: "",
  tone: "friendly, professional, and reassuring",
};

type ContentAdminStats = {
  pendingReviewCount: number;
  syncedBlogCount: number;
  publishedTodayCount: number;
  totalViews?: number;
  totalLeads?: number;
};

type AgentsStatus = {
  reachable: boolean;
  error?: string;
};

type ContentJobRecord = {
  id: string;
  type: string;
  status: string;
  title?: string | null;
  instructions?: string | null;
  agentJobId?: string | null;
  createdAt: string;
  views?: number;
  leadsCaptured?: number;
};

interface ContentAdminPageProps {
  stats: ContentAdminStats;
  agentsStatus: AgentsStatus;
  jobs: ContentJobRecord[];
}

export function ContentAdminPage({ stats, agentsStatus, jobs: initialContentJobs }: ContentAdminPageProps) {
  const [activeTab, setActiveTab] = useState<"create" | "review">("create");

  // Create tab state
  const [form, setForm] = useState<CreateContentFormState>(DEFAULT_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreatedJobId, setLastCreatedJobId] = useState<string | null>(null);

  // Review tab state
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AgentsReviewJob[]>([]);
  const [contentJobs, setContentJobs] = useState<ContentJobRecord[]>(initialContentJobs);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<AgentsReviewJob | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [tonePresetId, setTonePresetId] = useState<TonePresetId | "">("");

  const selectedJobIsBlog = useMemo(
    () => selectedJob?.type === "BLOG" && !!selectedJob?.result,
    [selectedJob]
  );

  // ───────────────────────────── Helpers ─────────────────────────────

  async function refreshContentJobs() {
    try {
      const res = await fetch("/api/admin/content/jobs");
      const json = await res.json();
      if (json.success) {
        setContentJobs(json.jobs);
      }
    } catch (error) {
      console.error("Failed to refresh content jobs", error);
    }
  }

  async function handleJobStatusChange(
    jobId: string,
    status?: string,
    metrics?: { views?: number; leadsCaptured?: number },
  ) {
    setUpdatingJobId(jobId);
    try {
      const res = await fetch(`/api/admin/content/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          views: metrics?.views,
          leadsCaptured: metrics?.leadsCaptured,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to update job");
      }
      await refreshContentJobs();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingJobId(null);
    }
  }

  function handleMetricsPrompt(job: ContentJobRecord) {
    const currentViews = job.views ?? 0;
    const currentLeads = job.leadsCaptured ?? 0;
    const views = Number(window.prompt("Total views for this piece?", String(currentViews)));
    if (Number.isNaN(views)) return;
    const leads = Number(window.prompt("Leads attributed?", String(currentLeads)));
    if (Number.isNaN(leads)) return;
    void handleJobStatusChange(job.id, undefined, { views, leadsCaptured: leads });
  }

  async function handleCreateContent(e: React.FormEvent) {
    e.preventDefault();
    if (!form.instructions.trim()) {
      setCreateError("Please enter instructions or a topic.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setLastCreatedJobId(null);

    try {
      const payload = {
        instructions: form.instructions.trim(),
        contentType: form.contentType,
        targetCity: form.targetCity.trim() || undefined,
        serviceType: form.serviceType.trim() || undefined,
        tonePreset: tonePresetId || undefined,
        title: form.instructions.slice(0, 80),
      };

      const res = await fetch("/api/admin/content/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create content job");
      }

      setLastCreatedJobId(data.jobId);
      setActiveTab("review");
      void refreshQueue();
      void refreshContentJobs();
    } catch (err: any) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create content job"
      );
    } finally {
      setCreating(false);
    }
  }

  async function refreshQueue() {
    setLoadingQueue(true);
    setQueueError(null);
    try {
      const res = await listReviewJobs({
        status: "PENDING_REVIEW",
        contentType: "BLOG",
        limit: 50,
      });
      if (!res.ok) {
        throw new Error(res.error || "Failed to load review queue");
      }
      setJobs(res.jobs);
    } catch (err: any) {
      setQueueError(
        err instanceof Error ? err.message : "Failed to load review queue"
      );
    } finally {
      setLoadingQueue(false);
    }
  }

  async function loadJob(id: string) {
    setSelectedJobId(id);
    setSelectedJob(null);
    setLoadingJob(true);
    setRejectionNote("");
    try {
      const res = await getReviewJob(id);
      if (!res.ok) {
        throw new Error(res.error || "Failed to load job");
      }
      setSelectedJob(res.job);
    } catch (err: any) {
      setQueueError(
        err instanceof Error ? err.message : "Failed to load job details"
      );
    } finally {
      setLoadingJob(false);
    }
  }

  async function handleApprove() {
    if (!selectedJobId) return;
    setUpdatingStatus(true);
    try {
      const res = await approveReviewJob(selectedJobId);
      if (!res.ok) {
        throw new Error(res.error || "Failed to approve job");
      }
      setSelectedJob(res.job);
      await refreshQueue();
    } catch (err: any) {
      setQueueError(
        err instanceof Error ? err.message : "Failed to approve job"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleReject() {
    if (!selectedJobId) return;
    setUpdatingStatus(true);
    try {
      const res = await rejectReviewJob(selectedJobId, rejectionNote.trim());
      if (!res.ok) {
        throw new Error(res.error || "Failed to reject job");
      }
      setSelectedJob(res.job);
      await refreshQueue();
    } catch (err: any) {
      setQueueError(
        err instanceof Error ? err.message : "Failed to reject job"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  useEffect(() => {
    if (activeTab === "review" && !loadingQueue && jobs.length === 0) {
      void refreshQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ───────────────────────────── Render helpers ──────────────────────

  function renderStatusBadge(job: AgentsReviewJob) {
    const status = job.status;
    if (status === "PENDING_REVIEW") {
      return <Badge variant="outline" className="border-amber-500 text-amber-700">Pending</Badge>;
    }
    if (status === "APPROVED") {
      return <Badge className="bg-emerald-600">Approved</Badge>;
    }
    if (status === "REJECTED") {
      return <Badge className="bg-red-600">Rejected</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  }

  function renderBlogPreview(job: AgentsReviewJob) {
    const result = job.result as any;
    if (!result) return null;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{result.title}</h3>
          {result.summary && (
            <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
          )}
          {result.slug && (
            <p className="text-xs text-gray-400 mt-1">Slug: {result.slug}</p>
          )}
        </div>
        <div className="border rounded-md p-3 bg-white max-h-[420px] overflow-auto">
          <div className="prose max-w-none">
            <ReactMarkdown>
              {String(result.body || "")}
            </ReactMarkdown>
          </div>
        </div>
        {result.metaDescription && (
          <div className="text-xs text-gray-500">
            <span className="font-semibold">Meta description:</span>{" "}
            {result.metaDescription}
          </div>
        )}
      </div>
    );
  }

  // ───────────────────────────── JSX ─────────────────────────────────

  const statCards = [
    {
      title: "Pending Reviews",
      value: stats.pendingReviewCount,
      description: "Jobs awaiting approval in the agents queue",
    },
    {
      title: "Synced Blogs",
      value: stats.syncedBlogCount,
      description: "Markdown files stored under content/blogs",
    },
    {
      title: "Published Today",
      value: stats.publishedTodayCount,
      description: "Agent-generated posts published since midnight",
    },
    {
      title: "Agents Queue",
      value: agentsStatus.reachable ? "Online" : "Offline",
      description: agentsStatus.reachable
        ? "Review API reachable"
        : "Run pnpm agents:health",
      statusColor: agentsStatus.reachable ? "text-emerald-600" : "text-red-600",
    },
  ];

  if (typeof stats.totalViews === "number") {
    statCards.push({
      title: "Total Views",
      value: stats.totalViews,
      description: "Attributed to AI-generated content",
    });
  }

  if (typeof stats.totalLeads === "number") {
    statCards.push({
      title: "Leads from Content",
      value: stats.totalLeads,
      description: "Captured via AI content touchpoints",
    });
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Content & AI Review</h1>
          <p className="text-sm text-gray-600">
            Create AI-generated content and review/approve drafts before they
            go live. Blogs first, more content types later.
          </p>
        </div>
      </div>

      {!agentsStatus.reachable && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Agents review queue unreachable</p>
          <p className="mt-1 text-xs">
            {agentsStatus.error || "The agents service returned an error."} Check the PM2 stack and run
            <code className="mx-1 rounded bg-white px-1 py-0.5 text-[11px] text-amber-900">
              pnpm agents:health
            </code>
            to verify connectivity.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${card.statusColor ?? ""}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent content jobs</CardTitle>
          <CardDescription>AI jobs triggered from this page and their current status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {contentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Agent Job</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.title || job.instructions?.slice(0, 40) || "Untitled job"}
                      </TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {job.agentJobId ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>Views: {job.views ?? 0}</div>
                        <div>Leads: {job.leadsCaptured ?? 0}</div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingJobId === job.id}
                          onClick={() => handleMetricsPrompt(job)}
                        >
                          Update metrics
                        </Button>
                        {job.status === "PENDING_REVIEW" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={updatingJobId === job.id}
                            onClick={() => handleJobStatusChange(job.id, "APPROVED")}
                          >
                            Approve
                          </Button>
                        )}
                        {job.status === "APPROVED" && (
                          <Button
                            size="sm"
                            disabled={updatingJobId === job.id}
                            onClick={() => handleJobStatusChange(job.id, "PUBLISHED")}
                          >
                            Publish
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "create" | "review")}
      >
        <TabsList>
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="review">Review Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create new content job</CardTitle>
              <CardDescription>
                Describe what you want and let the agents pipeline generate a draft.
                All jobs go into the owner review queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {createError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateContent} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="content-type">Content type</Label>
                    <Select
                      value={form.contentType}
                      onValueChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          contentType: v as ContentType,
                        }))
                      }
                    >
                      <SelectTrigger id="content-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BLOG">Blog post</SelectItem>
                        <SelectItem value="AD">Ad creative</SelectItem>
                        <SelectItem value="REVIEW_REPLY">Review reply</SelectItem>
                        <SelectItem value="CUSTOMER_REPLY">
                          Customer reply
                        </SelectItem>
                        <SelectItem value="DOCUMENT_SUMMARY">
                          Document summary
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="target-city">Target city (optional)</Label>
                      <Input
                        id="target-city"
                        placeholder="e.g. Houston, TX"
                        value={form.targetCity}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            targetCity: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="service-type">Service type (optional)</Label>
                      <Input
                        id="service-type"
                        placeholder="Mobile notary, loan signing..."
                        value={form.serviceType}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            serviceType: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-1">
                      <Label htmlFor="tone">Tone (optional)</Label>
                      <Select
                        // Use a non-empty sentinel value for "none" to avoid Select.Item empty value errors
                        value={tonePresetId || "none"}
                        onValueChange={(value) => {
                          const isNone = value === "none";
                          const preset = TONE_PRESETS.find((p) => p.id === value);
                          setTonePresetId(isNone ? "" : (value as TonePresetId));
                          setForm((prev) => ({
                            ...prev,
                            tone: preset ? preset.examplePrompt : prev.tone,
                          }));
                        }}
                      >
                        <SelectTrigger id="tone-preset">
                          <SelectValue placeholder="Choose a preset tone (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Custom / none</SelectItem>
                          {TONE_PRESETS.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="tone"
                        placeholder="friendly, professional..."
                        value={form.tone}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            tone: e.target.value,
                          }))
                        }
                      />
                      <p className="text-[11px] text-gray-500">
                        Use a preset for consistency, then tweak the wording here if needed.{" "}
                        <Link href="/admin/content/tone-templates" className="underline">
                          View tone guidelines
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">What do you want to create?</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Example: Write a 1,200–1,500 word SEO blog about mobile notary services for hospital patients in Houston. Focus on reducing stress for families, include 3-4 H2s, and end with a clear CTA."
                    rows={6}
                    value={form.instructions}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Jobs are routed through the agents pipeline and stored in the
                    owner review queue as <code>BLOG</code> jobs when applicable.
                  </div>
                  <Button type="submit" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating job...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Create content job
                      </>
                    )}
                  </Button>
                </div>

                {lastCreatedJobId && (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      Job created with ID <code>{lastCreatedJobId}</code>. Check
                      the Review Queue tab to approve once the draft is ready.
                    </span>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Owner review queue</h2>
              <p className="text-xs text-gray-600">
                Pending BLOG drafts waiting for manual approval. Approving a job
                triggers existing webhooks to the Next.js site.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshQueue()}
              disabled={loadingQueue}
            >
              {loadingQueue ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          {queueError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
              {queueError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Pending BLOG jobs</CardTitle>
                <CardDescription className="text-xs">
                  Select a job to see full details and approve/reject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[460px] overflow-auto">
                {loadingQueue && jobs.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading queue...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="py-6 text-xs text-gray-500 text-center">
                    No pending BLOG jobs in the review queue.
                  </div>
                ) : (
                  jobs.map((job) => {
                    const isSelected = job.id === selectedJobId;
                    const created = new Date(job.createdAt).toLocaleString();
                    const result = job.result as any;
                    const payload = job.payload as any;
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => loadJob(job.id)}
                        className={`w-full text-left rounded-md border px-2 py-2 text-xs transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">
                            {result?.title || job.id}
                          </span>
                          {renderStatusBadge(job)}
                        </div>
                        <div className="mt-1 text-[11px] text-gray-500 truncate">
                          {result?.summary || payload?.rawText || "No summary"}
                        </div>
                        <div className="mt-1 text-[10px] text-gray-400">
                          Created: {created}
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Job details</CardTitle>
                <CardDescription className="text-xs">
                  Review the generated draft, then approve or reject with notes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedJob && !loadingJob ? (
                  <div className="py-16 text-xs text-gray-500 text-center">
                    Select a job from the left to see details.
                  </div>
                ) : loadingJob ? (
                  <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading job details...
                  </div>
                ) : selectedJob ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {selectedJob.type} • {selectedJob.id}
                          </span>
                          {renderStatusBadge(selectedJob)}
                        </div>
                        {selectedJob.reviewerNotes && (
                          <p className="text-[11px] text-gray-500">
                            Reviewer notes: {selectedJob.reviewerNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedJobIsBlog ? (
                      renderBlogPreview(selectedJob)
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 text-xs">
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-700">
                            Payload
                          </div>
                          <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2">
                            {JSON.stringify(selectedJob.payload, null, 2)}
                          </pre>
                        </div>
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-700">
                            Result
                          </div>
                          <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2">
                            {JSON.stringify(selectedJob.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="rejection-note" className="text-xs">
                        Rejection notes (optional)
                      </Label>
                      <Textarea
                        id="rejection-note"
                        rows={3}
                        placeholder="Explain why this draft is being rejected or what needs to change."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11px] text-gray-500">
                        Approving a BLOG will emit the existing{" "}
                        <code>blog.approved</code> webhook to the Next.js app.
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            updatingStatus ||
                            selectedJob.status === "APPROVED"
                          }
                          onClick={handleReject}
                        >
                          {updatingStatus ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            updatingStatus ||
                            selectedJob.status === "APPROVED"
                          }
                          onClick={handleApprove}
                        >
                          {updatingStatus ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


