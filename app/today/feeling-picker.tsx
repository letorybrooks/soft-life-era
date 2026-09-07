"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const FEELINGS = ["Ease", "Grounded", "Clear", "Joyful", "Nourished", "Focused"];

export default function FeelingPicker({
  userId,
  todayDate,
  initialFeeling,
}: {
  userId: string;
  todayDate: string;
  initialFeeling: string | null;
}) {
  const supabase = createClient();
  const [feeling, setFeeling] = useState(initialFeeling);
  const [saving, setSaving] = useState(false);

  async function choose(next: string) {
    setFeeling(next);
    setSaving(true);

    // One row per user per day — upsert on the (user_id, checkin_date)
    // unique constraint from schema.sql instead of insert-then-update.
    await supabase.from("daily_checkins").upsert(
      {
        user_id: userId,
        checkin_date: todayDate,
        feeling: next,
      },
      { onConflict: "user_id,checkin_date" }
    );

    setSaving(false);
  }

  return (
    <div>
      <h3 className="font-display text-2xl mb-4">How do you want today to feel?</h3>
      <div className="flex flex-wrap gap-2">
        {FEELINGS.map((f) => (
          <button
            key={f}
            onClick={() => choose(f)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              feeling === f
                ? "bg-terra text-white border-terra"
                : "border-clay text-ink hover:bg-blush"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {saving && <p className="text-xs text-clay mt-3">Saving…</p>}
      {!saving && feeling && (
        <p className="text-xs text-clay mt-3">Today is saved as {feeling}.</p>
      )}
    </div>
  );
}
