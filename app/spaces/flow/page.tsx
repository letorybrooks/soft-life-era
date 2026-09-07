import { createClient } from "@/lib/supabase/server";
import { getFlowData } from "@/lib/spaces/flow";
import FlowBoard from "./flow-board";
import Link from "next/link";

export default async function FlowPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("space_entries")
    .select("id, entry_type, payload, created_at")
    .eq("user_id", user!.id)
    .eq("space_key", "flow")
    .order("created_at", { ascending: true });

  const initial = { focus: [], active: [], waiting: [], completed: [], gratitude: [] } as Awaited<
    ReturnType<typeof getFlowData>
  >;
  for (const row of rows ?? []) {
    const item = { id: row.id, ...row.payload };
    const lane = row.entry_type as keyof typeof initial;
    if (lane in initial) (initial[lane] as unknown[]).push(item);
  }
  initial.completed.reverse();
  initial.gratitude.reverse();

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <Link href="/today" className="text-xs text-terra">
          ← Back to Today
        </Link>
        <h1 className="font-display text-5xl mt-4 mb-2">Stay in Flow</h1>
        <p className="text-sm text-ink/70 mb-10">
          Not a to-do list — a place to hold what actually matters right now, and let it move as it changes.
        </p>
        <FlowBoard userId={user!.id} initial={initial} />
      </div>
    </main>
  );
}
