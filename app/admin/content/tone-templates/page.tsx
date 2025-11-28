import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";
import { TONE_PRESETS } from "@/content/tone-presets";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ToneTemplatesPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;

  if (!session?.user || role !== Role.ADMIN) {
    redirect("/portal");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tone & Templates</h1>
          <p className="text-sm text-muted-foreground">
            Shared tone presets used by the Content & AI tools. Each preset is wired into the
            agents payload metadata so you can keep messaging consistent across blogs, emails, and
            replies.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TONE_PRESETS.map((preset) => (
          <Card key={preset.id}>
            <CardHeader>
              <CardTitle>{preset.label}</CardTitle>
              <CardDescription className="text-xs font-mono break-all">
                tonePresetId: <span>{preset.id}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{preset.description}</p>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Example prompt</p>
                <p className="text-xs rounded-md bg-gray-50 border border-gray-200 p-2">
                  {preset.examplePrompt}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


