"use client";

import { useState } from "react";
import type { FlowData, FocusItem, ActiveItem, WaitingItem, CompletedItem, GratitudeItem } from "@/lib/spaces/flow";
import * as flow from "@/lib/spaces/flow";

export default function FlowBoard({ userId, initial }: { userId: string; initial: FlowData }) {
  const [data, setData] = useState<FlowData>(initial);

  function withError(fn: () => Promise<void>) {
    fn().catch((err) => alert(err.message));
  }

  return (
    <div className="space-y-12">
      <FocusLane
        items={data.focus}
        onAdd={(item) =>
          withError(async () => {
            const id = await flow.addFocus(userId, item, data.focus.length);
            setData((d) => ({ ...d, focus: [...d.focus, { ...item, id }] }));
          })
        }
        onDelete={(id) =>
          withError(async () => {
            await flow.deleteEntry(id);
            setData((d) => ({ ...d, focus: d.focus.filter((x) => x.id !== id) }));
          })
        }
        onMoveToActive={(item) =>
          withError(async () => {
            const newId = await flow.moveFocusToActive(userId, item.id, item, data.active.length);
            setData((d) => ({
              focus: d.focus.filter((x) => x.id !== item.id),
              active: [...d.active, { id: newId, title: item.title, energy: "Steady energy", note: item.why || "" }],
              waiting: d.waiting,
              completed: d.completed,
              gratitude: d.gratitude,
            }));
          })
        }
      />

      <ActiveLane
        items={data.active}
        onAdd={(item) =>
          withError(async () => {
            const id = await flow.addActive(userId, item, data.active.length);
            setData((d) => ({ ...d, active: [...d.active, { ...item, id }] }));
          })
        }
        onDelete={(id) =>
          withError(async () => {
            await flow.deleteEntry(id);
            setData((d) => ({ ...d, active: d.active.filter((x) => x.id !== id) }));
          })
        }
        onToWaiting={(item) =>
          withError(async () => {
            const newId = await flow.activeToWaiting(userId, item.id, item);
            setData((d) => ({
              ...d,
              active: d.active.filter((x) => x.id !== item.id),
              waiting: [...d.waiting, { id: newId, title: item.title, who: "", follow: "", type: "Response" }],
            }));
          })
        }
        onToComplete={(item) =>
          withError(async () => {
            const newId = await flow.activeToComplete(userId, item.id, item);
            setData((d) => ({
              ...d,
              active: d.active.filter((x) => x.id !== item.id),
              completed: [
                { id: newId, title: item.title, date: new Date().toISOString().slice(0, 10), lesson: "", celebrate: "" },
                ...d.completed,
              ],
            }));
          })
        }
      />

      <WaitingLane
        items={data.waiting}
        onAdd={(item) =>
          withError(async () => {
            const id = await flow.addWaiting(userId, item);
            setData((d) => ({ ...d, waiting: [...d.waiting, { ...item, id }] }));
          })
        }
        onDelete={(id) =>
          withError(async () => {
            await flow.deleteEntry(id);
            setData((d) => ({ ...d, waiting: d.waiting.filter((x) => x.id !== id) }));
          })
        }
        onToActive={(item) =>
          withError(async () => {
            const newId = await flow.waitingToActive(userId, item.id, item, data.active.length);
            setData((d) => ({
              ...d,
              waiting: d.waiting.filter((x) => x.id !== item.id),
              active: [
                ...d.active,
                { id: newId, title: item.title, energy: "Steady energy", note: item.who ? `Returned from ${item.who}` : "" },
              ],
            }));
          })
        }
        onToComplete={(item) =>
          withError(async () => {
            const newId = await flow.waitingToComplete(userId, item.id, item);
            setData((d) => ({
              ...d,
              waiting: d.waiting.filter((x) => x.id !== item.id),
              completed: [
                { id: newId, title: item.title, date: new Date().toISOString().slice(0, 10), lesson: "", celebrate: "" },
                ...d.completed,
              ],
            }));
          })
        }
      />

      <CompletedLane
        items={data.completed}
        onAdd={(item) =>
          withError(async () => {
            const id = await flow.addCompleted(userId, item);
            setData((d) => ({ ...d, completed: [{ ...item, id }, ...d.completed] }));
          })
        }
      />

      <GratitudeLane
        items={data.gratitude}
        onAdd={(item) =>
          withError(async () => {
            const id = await flow.addGratitude(userId, item);
            setData((d) => ({ ...d, gratitude: [{ ...item, id }, ...d.gratitude] }));
          })
        }
        onDelete={(id) =>
          withError(async () => {
            await flow.deleteEntry(id);
            setData((d) => ({ ...d, gratitude: d.gratitude.filter((x) => x.id !== id) }));
          })
        }
      />
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border border-clay/20 rounded-soft shadow-soft p-6">{children}</div>;
}

function TinyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-[10px] uppercase tracking-wide text-terra mr-3">
      {children}
    </button>
  );
}

function LaneHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <div className="text-[10px] uppercase tracking-widest text-clay mb-1">{eyebrow}</div>
      <h2 className="font-display text-2xl mb-2">{title}</h2>
    </>
  );
}

const inputClass = "border-b border-clay bg-transparent py-2 text-sm outline-none focus:border-terra w-full";

function FocusLane({
  items,
  onAdd,
  onDelete,
  onMoveToActive,
}: {
  items: FocusItem[];
  onAdd: (item: Omit<FocusItem, "id">) => void;
  onDelete: (id: string) => void;
  onMoveToActive: (item: FocusItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("Grounded");
  const [when, setWhen] = useState("");
  const [why, setWhy] = useState("");
  return (
    <section>
      <LaneHeader eyebrow="01 · Weekly Compass" title="🎯 This Week's Sacred Focus" />
      <p className="text-sm text-ink/70 mb-1">
        Choose up to five high-impact actions that move your life, purpose and joy forward. Revisit them to reset
        your compass — not to pressure yourself.
      </p>
      <p className="text-xs text-clay mb-4">{items.length}/5</p>
      <div className="grid gap-3">
        {items.map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            <p className="text-xs text-clay">
              {x.tone}
              {x.when ? ` · ${x.when}` : ""}
            </p>
            {x.why && <p className="text-sm mt-1">{x.why}</p>}
            <div className="mt-2">
              <TinyBtn onClick={() => onMoveToActive(x)}>Move to In Flow</TinyBtn>
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      {items.length < 5 && (
        <div className="grid gap-2 mt-3 max-w-md">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Aligned action" className={inputClass} />
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass}>
            {["Grounded", "Ease", "Joy", "Courage", "Clarity", "Devotion"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Time block / day (optional)" className={inputClass} />
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why this matters" className={inputClass} />
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd({ title: title.trim(), tone, when, why });
              setTitle("");
              setWhen("");
              setWhy("");
            }}
            className="text-sm bg-terra text-white rounded-full px-4 py-2 justify-self-start"
          >
            Add Sacred Focus
          </button>
        </div>
      )}
    </section>
  );
}

function ActiveLane({
  items,
  onAdd,
  onDelete,
  onToWaiting,
  onToComplete,
}: {
  items: ActiveItem[];
  onAdd: (item: Omit<ActiveItem, "id">) => void;
  onDelete: (id: string) => void;
  onToWaiting: (item: ActiveItem) => void;
  onToComplete: (item: ActiveItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState("Steady energy");
  const [note, setNote] = useState("");
  return (
    <section>
      <LaneHeader eyebrow="02 · Energetic Now" title="In Flow" />
      <p className="text-sm text-ink/70 mb-4">Hold no more than two active things here. Presence over overload.</p>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-ink/60">Your energetic now is open.</p>}
        {items.map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            <p className="text-xs text-clay">{x.energy}</p>
            {x.note && <p className="text-sm mt-1">{x.note}</p>}
            <div className="mt-2">
              <TinyBtn onClick={() => onToComplete(x)}>Integrate ✓</TinyBtn>
              <TinyBtn onClick={() => onToWaiting(x)}>Move to Waiting On</TinyBtn>
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      {items.length < 2 && (
        <div className="grid gap-2 mt-3 max-w-md">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you actively holding?" className={inputClass} />
          <select value={energy} onChange={(e) => setEnergy(e.target.value)} className={inputClass}>
            {["Light energy", "Steady energy", "Deep focus", "Needs softness"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes, support, next tiny step..." className={inputClass} />
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd({ title: title.trim(), energy, note });
              setTitle("");
              setNote("");
            }}
            className="text-sm bg-terra text-white rounded-full px-4 py-2 justify-self-start"
          >
            Bring Into Flow
          </button>
        </div>
      )}
    </section>
  );
}

function WaitingLane({
  items,
  onAdd,
  onDelete,
  onToActive,
  onToComplete,
}: {
  items: WaitingItem[];
  onAdd: (item: Omit<WaitingItem, "id">) => void;
  onDelete: (id: string) => void;
  onToActive: (item: WaitingItem) => void;
  onToComplete: (item: WaitingItem) => void;
}) {
  const [title, setTitle] = useState("");
  const [who, setWho] = useState("");
  const [follow, setFollow] = useState("");
  const [type, setType] = useState("Response");
  return (
    <section>
      <LaneHeader eyebrow="03 · Holding Zone" title="Waiting On" />
      <p className="text-sm text-ink/70 mb-4">
        For responses, payments, approvals, deliveries and other things that are not in your control right now.
      </p>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-ink/60">Nothing is sitting in the holding zone.</p>}
        {items.map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            <p className="text-xs text-clay">
              {x.type}
              {x.who ? ` · ${x.who}` : ""}
              {x.follow ? ` · follow up ${x.follow}` : ""}
            </p>
            <div className="mt-2">
              <TinyBtn onClick={() => onToActive(x)}>Back In Flow</TinyBtn>
              <TinyBtn onClick={() => onToComplete(x)}>Resolved ✓</TinyBtn>
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-2 mt-3 max-w-md">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you waiting on?" className={inputClass} />
        <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Person / company / source" className={inputClass} />
        <input type="date" value={follow} onChange={(e) => setFollow(e.target.value)} className={inputClass} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          {["Response", "Payment", "Approval", "Delivery", "Submission", "Other"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!title.trim()) return;
            onAdd({ title: title.trim(), who, follow, type });
            setTitle("");
            setWho("");
            setFollow("");
          }}
          className="text-sm bg-terra text-white rounded-full px-4 py-2 justify-self-start"
        >
          Place in Holding Zone
        </button>
      </div>
    </section>
  );
}

function CompletedLane({
  items,
  onAdd,
}: {
  items: CompletedItem[];
  onAdd: (item: Omit<CompletedItem, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lesson, setLesson] = useState("");
  const [celebrate, setCelebrate] = useState("");
  return (
    <section>
      <LaneHeader eyebrow="04 · Celebration Station" title="🎊 Completed & Integrated" />
      <p className="text-sm text-ink/70 mb-1">
        Closing the loop means more than checking something off. Capture what you completed, what it taught you,
        and how you want to celebrate or release it.
      </p>
      <p className="text-xs text-clay mb-4">
        <b>This space is for completed actions and projects.</b> Personal identity breakthroughs belong in Wins &amp;
        Wisdom on The Becoming Board.
      </p>
      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="text-sm text-ink/60">Your completed work will become a visible record here.</p>
        )}
        {items.slice(0, 12).map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            <p className="text-xs text-clay">{x.date}</p>
            {x.lesson && <p className="text-sm mt-1">{x.lesson}</p>}
            {x.celebrate && <p className="text-xs text-terra mt-1">🎉 {x.celebrate}</p>}
          </Card>
        ))}
      </div>
      <div className="grid gap-2 mt-3 max-w-md">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you complete?" className={inputClass} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        <textarea
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
          placeholder="What did I learn? How did this feel in my body? What no longer needs to be carried?"
          className={inputClass}
        />
        <input value={celebrate} onChange={(e) => setCelebrate(e.target.value)} placeholder="How will you celebrate?" className={inputClass} />
        <button
          onClick={() => {
            if (!title.trim()) return;
            onAdd({ title: title.trim(), date, lesson, celebrate });
            setTitle("");
            setLesson("");
            setCelebrate("");
          }}
          className="text-sm bg-terra text-white rounded-full px-4 py-2 justify-self-start"
        >
          Celebrate &amp; Integrate
        </button>
      </div>
    </section>
  );
}

function GratitudeLane({
  items,
  onAdd,
  onDelete,
}: {
  items: GratitudeItem[];
  onAdd: (item: Omit<GratitudeItem, "id">) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("Gratitude");
  const [text, setText] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  return (
    <section>
      <LaneHeader eyebrow="05 · Gratitude Vault" title="🎉 Moments That Moved Me" />
      <p className="text-sm text-ink/70 mb-1">
        Your gratitude vault for meaningful moments, synchronicities, answered prayers, joy, connection and the
        little winks you want to remember.
      </p>
      <p className="text-xs text-clay mb-4">
        <b>This is memory + gratitude, not achievement tracking.</b> You do not have to accomplish anything for a
        moment to belong here.
      </p>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-ink/60">Your first moment lives here.</p>}
        {items.map((x) => (
          <Card key={x.id}>
            {x.title && <b>{x.title}</b>}
            <p className="text-xs text-clay">
              {x.tag}
              {x.date ? ` · ${x.date}` : ""}
            </p>
            <p className="text-sm mt-1">{x.text}</p>
            <div className="mt-2">
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-2 mt-3 max-w-md">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name this moment" className={inputClass} />
        <select value={tag} onChange={(e) => setTag(e.target.value)} className={inputClass}>
          {["Gratitude", "Joy", "Connection", "Synchronicity", "Answered Prayer", "Growth", "Unexpected Gift"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What moved you? What are you grateful for?" className={inputClass} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onAdd({ title: title.trim(), tag, text: text.trim(), date });
            setTitle("");
            setText("");
          }}
          className="text-sm bg-terra text-white rounded-full px-4 py-2 justify-self-start"
        >
          Save to Gratitude Vault
        </button>
      </div>
    </section>
  );
}
