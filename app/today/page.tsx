import { createClient } from "@/lib/supabase/server";
import FeelingPicker from "./feeling-picker";
import FlowDigest from "./flow-digest";

export default async function TodayPage() {
  const supabase = await createClient();

  // Middleware already guarantees a session exists on this route, so
  // this is a real fetch, not an auth check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayDate = new Date().toISOString().slice(0, 10);

  const [{ data: profile }, { data: checkin }] = await Promise.all([
    supabase.from("profiles").select("active_spaces, plan").eq("id", user!.id).single(),
    supabase
      .from("daily_checkins")
      .select("feeling")
      .eq("user_id", user!.id)
      .eq("checkin_date", todayDate)
      .maybeSingle(),
  ]);

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-clay mb-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-display text-5xl mb-10">Good morning.</h1>

        <div className="bg-white border border-clay/20 rounded-soft shadow-soft p-8">
          <FeelingPicker
            userId={user!.id}
            todayDate={todayDate}
            initialFeeling={checkin?.feeling ?? null}
          />
        </div>

        <FlowDigest userId={user!.id} />

        <p className="text-xs text-ink/50 mt-8">
          {profile?.active_spaces?.length
            ? `In focus: ${profile.active_spaces.join(", ")}`
            : "No Spaces chosen yet — every Space is still open to you."}
        </p>
      </div>
    </main>
  );
}
