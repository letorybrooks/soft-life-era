import { createClient } from "@/lib/supabase/client";

export type FocusItem = { id: string; title: string; tone: string; when: string; why: string };
export type ActiveItem = { id: string; title: string; energy: string; note: string };
export type WaitingItem = { id: string; title: string; who: string; follow: string; type: string };
export type CompletedItem = { id: string; title: string; date: string; lesson: string; celebrate: string };
export type GratitudeItem = { id: string; title: string; tag: string; text: string; date: string };

export type FlowData = {
  focus: FocusItem[];
  active: ActiveItem[];
  waiting: WaitingItem[];
  completed: CompletedItem[];
  gratitude: GratitudeItem[];
};

export async function getFlowData(userId: string): Promise<FlowData> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("space_entries")
    .select("id, entry_type, payload, created_at")
    .eq("user_id", userId)
    .eq("space_key", "flow")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const result: FlowData = { focus: [], active: [], waiting: [], completed: [], gratitude: [] };
  for (const row of data ?? []) {
    const item = { id: row.id, ...row.payload };
    const lane = row.entry_type as keyof FlowData;
    if (lane in result) (result[lane] as unknown[]).push(item);
  }
  result.completed.reverse();
  result.gratitude.reverse();
  return result;
}

async function insertEntry(userId: string, entryType: string, payload: object) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("space_entries")
    .insert({ user_id: userId, space_key: "flow", entry_type: entryType, payload })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function updateEntry(id: string, payload: object) {
  const supabase = createClient();
  const { error } = await supabase.from("space_entries").update({ payload }).eq("id", id);
  if (error) throw error;
}

async function moveEntry(id: string, newType: string, newPayload: object, userId: string) {
  const supabase = createClient();
  const { error: delErr } = await supabase.from("space_entries").delete().eq("id", id);
  if (delErr) throw delErr;
  return insertEntry(userId, newType, newPayload);
}

export async function deleteEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("space_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function addFocus(userId: string, item: Omit<FocusItem, "id">, currentCount: number) {
  if (currentCount >= 5) throw new Error("Sacred Focus is intentionally capped at five. Release or complete something before adding another.");
  return insertEntry(userId, "focus", item);
}
export async function updateFocus(id: string, item: Omit<FocusItem, "id">) {
  return updateEntry(id, item);
}
export async function moveFocusToActive(userId: string, focusId: string, item: FocusItem, currentActiveCount: number) {
  if (currentActiveCount >= 2) throw new Error("In Flow holds a maximum of two active items.");
  const { title, why } = item;
  return moveEntry(focusId, "active", { title, energy: "Steady energy", note: why || "" }, userId);
}

export async function addActive(userId: string, item: Omit<ActiveItem, "id">, currentCount: number) {
  if (currentCount >= 2) throw new Error("In Flow is intentionally limited to two active items.");
  return insertEntry(userId, "active", item);
}
export async function updateActive(id: string, item: Omit<ActiveItem, "id">) {
  return updateEntry(id, item);
}
export async function activeToWaiting(userId: string, activeId: string, item: ActiveItem) {
  return moveEntry(activeId, "waiting", { title: item.title, who: "", follow: "", type: "Response" }, userId);
}
export async function activeToComplete(userId: string, activeId: string, item: ActiveItem) {
  return moveEntry(
    activeId,
    "completed",
    { title: item.title, date: new Date().toISOString().slice(0, 10), lesson: "", celebrate: "" },
    userId
  );
}

export async function addWaiting(userId: string, item: Omit<WaitingItem, "id">) {
  return insertEntry(userId, "waiting", item);
}
export async function updateWaiting(id: string, item: Omit<WaitingItem, "id">) {
  return updateEntry(id, item);
}
export async function waitingToActive(userId: string, waitingId: string, item: WaitingItem, currentActiveCount: number) {
  if (currentActiveCount >= 2) throw new Error("In Flow already has two active items.");
  return moveEntry(
    waitingId,
    "active",
    { title: item.title, energy: "Steady energy", note: item.who ? `Returned from ${item.who}` : "" },
    userId
  );
}
export async function waitingToComplete(userId: string, waitingId: string, item: WaitingItem) {
  return moveEntry(
    waitingId,
    "completed",
    { title: item.title, date: new Date().toISOString().slice(0, 10), lesson: "", celebrate: "" },
    userId
  );
}

export async function addCompleted(userId: string, item: Omit<CompletedItem, "id">) {
  return insertEntry(userId, "completed", item);
}
export async function updateCompleted(id: string, item: Omit<CompletedItem, "id">) {
  return updateEntry(id, item);
}

export async function addGratitude(userId: string, item: Omit<GratitudeItem, "id">) {
  return insertEntry(userId, "gratitude", item);
}
export async function updateGratitude(id: string, item: Omit<GratitudeItem, "id">) {
  return updateEntry(id, item);
}

export async function getFocusDigest(userId: string, limit = 3): Promise<FocusItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("space_entries")
    .select("id, payload")
    .eq("user_id", userId)
    .eq("space_key", "flow")
    .eq("entry_type", "focus")
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, ...row.payload }) as FocusItem);
}
