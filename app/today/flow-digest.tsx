import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function FlowDigest({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("space_entries")
    .select("id, payload")
    .eq("user_id", userId)
    .eq("space_key", "flow")
    .eq("entry_type", "focus")
    .order("created_at", { ascending: true })
    .limit(3);

  const items = (data ?? []) as { id: string; payload: { title: string; tone?: string } }[];

  return (
    <div className="bg-white border border-clay/20 rounded-soft shadow-soft p-6 mt-6">
      <h3 className="font-display text-xl mb-3">What you're holding</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink/60">
          Nothing held yet. <Link href="/spaces/flow" className="text-terra">Choose up to 5 in Stay in Flow →</Link>
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((x) => (
            <div key={x.id} className="flex items-center justify-between text-sm">
              <span>{x.payload.title}</span>
              <Link href="/spaces/flow" className="text-[10px] uppercase tracking-wide text-terra">
                Open
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
