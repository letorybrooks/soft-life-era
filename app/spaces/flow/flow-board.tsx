"use client";

import { useState } from "react";
import type { FlowData, FocusItem, ActiveItem, WaitingItem } from "@/lib/spaces/flow";
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

      <CompletedLane items={data.completed} />

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
  return (
    <section>
      <h2 className="font-display text-2xl mb-1">This Week&apos;s Sacred Focus</h2>
      <p className="text-xs text-clay mb-4">{items.length}/5 · What's weighing on your mind that deserves real attention this week?</p>
      <div className="grid gap-3">
        {items.map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            {x.tone && <p className="text-xs text-clay">{x.tone}</p>}
            <div className="mt-2">
              <TinyBtn onClick={() => onMoveToActive(x)}>Move to In Flow</TinyBtn>
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      {items.length < 5 && (
        <div className="flex gap-2 mt-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Finish the Henderson proposal"
            className="flex-1 border-b border-clay bg-transparent py-2 text-sm outline-none focus:border-terra"
          />
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd({ title: title.trim(), tone: "", when: "", why: "" });
              setTitle("");
            }}
            className="text-sm bg-terra text-white rounded-full px-4"
          >
            Add
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
  return (
    <section>
      <h2 className="font-display text-2xl mb-1">In Flow</h2>
      <p className="text-xs text-clay mb-4">{items.length}/2 · Pull something here only once you're actually working on it today — not planning to, doing it</p>
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
        <div className="flex gap-2 mt-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Drafting the proposal right now"
            className="flex-1 border-b border-clay bg-transparent py-2 text-sm outline-none focus:border-terra"
          />
          <button
            onClick={() => {
              if (!title.trim()) return;
              onAdd({ title: title.trim(), energy: "Steady energy", note: "" });
              setTitle("");
            }}
            className="text-sm bg-terra text-white rounded-full px-4"
          >
            Add
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
  return (
    <section>
      <h2 className="font-display text-2xl mb-1">Waiting On</h2>
      <p className="text-xs text-clay mb-4">Something you can't move forward until someone else responds, approves, or delivers</p>
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-sm text-ink/60">Nothing is sitting in the holding zone.</p>}
        {items.map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            {x.who && <p className="text-xs text-clay">Waiting on {x.who}</p>}
            <div className="mt-2">
              <TinyBtn onClick={() => onToActive(x)}>Back In Flow</TinyBtn>
              <TinyBtn onClick={() => onToComplete(x)}>Resolved ✓</TinyBtn>
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Waiting on the contractor's quote"
          className="flex-1 border-b border-clay bg-transparent py-2 text-sm outline-none focus:border-terra"
        />
        <button
          onClick={() => {
            if (!title.trim()) return;
            onAdd({ title: title.trim(), who: "", follow: "", type: "Response" });
            setTitle("");
          }}
          className="text-sm bg-terra text-white rounded-full px-4"
        >
          Add
        </button>
      </div>
    </section>
  );
}

function CompletedLane({ items }: { items: { id: string; title: string; date: string; lesson: string }[] }) {
  return (
    <section>
      <h2 className="font-display text-2xl mb-1">Completed &amp; Integrated</h2>
      <p className="text-xs text-clay mb-4">Things land here automatically once finished — a record to look back on, not more to do</p>
      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="text-sm text-ink/60">Your completed work will become a visible record here.</p>
        )}
        {items.slice(0, 12).map((x) => (
          <Card key={x.id}>
            <b>{x.title}</b>
            <p className="text-xs text-clay">{x.date}</p>
            {x.lesson && <p className="text-sm mt-1">{x.lesson}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}

function GratitudeLane({
  items,
  onAdd,
  onDelete,
}: {
  items: { id: string; title: string; tag: string; text: string; date: string }[];
  onAdd: (item: { title: string; tag: string; text: string; date: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <section>
      <h2 className="font-display text-2xl mb-1">Moments That Moved Me</h2>
      <p className="text-xs text-clay mb-4">Not a task at all — just capture something good, whenever it happens</p>
      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="text-sm text-ink/60">Your first moment lives here.</p>
        )}
        {items.map((x) => (
          <Card key={x.id}>
            {x.title && <b>{x.title}</b>}
            <p className="text-sm mt-1">{x.text}</p>
            <div className="mt-2">
              <TinyBtn onClick={() => onDelete(x.id)}>Delete</TinyBtn>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., My daughter said something that made me cry-laugh"
          className="flex-1 border-b border-clay bg-transparent py-2 text-sm outline-none focus:border-terra"
        />
        <button
          onClick={() => {
            if (!text.trim()) return;
            onAdd({ title: "", tag: "", text: text.trim(), date: new Date().toISOString().slice(0, 10) });
            setText("");
          }}
          className="text-sm bg-terra text-white rounded-full px-4"
        >
          Add
        </button>
      </div>
    </section>
  );
}
