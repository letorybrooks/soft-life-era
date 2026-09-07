"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/today");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-clay/20 rounded-soft shadow-soft p-10"
      >
        <h1 className="font-display text-4xl mb-1">
          Soft Life <span className="font-script text-terra text-3xl">Era</span>
        </h1>
        <p className="text-sm text-ink/70 mb-8">Welcome back.</p>

        <label className="block text-xs uppercase tracking-wide text-clay mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-0 border-b border-clay bg-transparent py-2 mb-6 outline-none focus:border-terra"
        />

        <label className="block text-xs uppercase tracking-wide text-clay mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-0 border-b border-clay bg-transparent py-2 mb-6 outline-none focus:border-terra"
        />

        {error && <p className="text-xs text-terra mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terra text-white rounded-full py-3 text-sm disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>

        <p className="text-xs text-ink/60 mt-6 text-center">
          New here?{" "}
          <Link href="/signup" className="text-terra">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}
