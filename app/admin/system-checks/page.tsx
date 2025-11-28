import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import { fetchAdminJson } from "@/lib/utils/server-fetch";
import type { SystemHealthSummary } from "@/lib/services/admin-metrics";

interface SystemHealthApiResponse {
  success: boolean;
  data: SystemHealthSummary;
}

export default async function SystemChecksPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal");
  }

  const { data } = await fetchAdminJson<SystemHealthApiResponse>("/api/admin/system-health");

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">System Checks</h2>
        <p className="text-sm text-gray-600">
          Quick view of database, cache, queues, agents, and automation health.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Quick Health
            </h3>
            <span className="text-xs font-mono text-gray-500">{data.quick?.status ?? "unknown"}</span>
          </div>
          {data.quick?.error ? (
            <div className="rounded bg-red-50 p-2 text-xs text-red-700">{data.quick.error}</div>
          ) : (
            <ul className="space-y-2 text-sm text-gray-800">
              {["database", "cache", "queues"].map((key) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key}</span>
                  <span
                    className={`font-mono ${
                      data.quick?.[key as "database" | "cache" | "queues"]
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {data.quick?.[key as "database" | "cache" | "queues"] ? "OK" : "ISSUE"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Full Suite Summary
            </h3>
            <span className="text-xs text-gray-500">
              {data.full?.durationMs ? `${Math.round(data.full.durationMs / 1000)}s` : ""}
            </span>
          </div>
          {!data.full ? (
            <div className="rounded bg-amber-50 p-2 text-xs text-amber-700">
              Full test suite not available.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-800">
              <div>
                <div className="text-xs uppercase text-gray-500">Passed</div>
                <div className="text-lg font-semibold text-emerald-600">{data.full.passed ?? 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Warnings</div>
                <div className="text-lg font-semibold text-amber-600">{data.full.warnings ?? 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500">Failed</div>
                <div className="text-lg font-semibold text-red-600">{data.full.failed ?? 0}</div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Summary</p>
                <p className="text-sm">{data.full.summary ?? "n/a"}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.sections.map((section) => (
          <section key={section.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                {section.label}
              </h3>
              <span
                className={`text-xs font-semibold ${
                  section.status === "PASS"
                    ? "text-emerald-600"
                    : section.status === "WARN"
                    ? "text-amber-600"
                    : section.status === "FAIL"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {section.status}
              </span>
            </div>
            {section.tests.length === 0 ? (
              <p className="text-xs text-gray-500">No tests available yet.</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-auto pr-1 text-xs text-gray-800">
                {section.tests.map((test) => (
                  <li
                    key={test.name}
                    className="flex items-center justify-between rounded bg-gray-50 px-2 py-1"
                  >
                    <span className="truncate text-[11px]">{test.name}</span>
                    <span
                      className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        test.status === "PASS"
                          ? "bg-emerald-100 text-emerald-700"
                          : test.status === "WARN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {test.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
