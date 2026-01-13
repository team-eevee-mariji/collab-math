// src/views/LandingPage.tsx
import { useMemo, useState, type FormEvent } from "react";
import ActionButton from "../components/ActionButton";
import NameInput from "../components/NameInput";

export type LandingMode = "CREATE" | "JOIN";

type LandingPageProps = {
  onSubmit: (args: { name: string; mode: LandingMode }) => void;
  initialName?: string;
};

export default function LandingPage({
  onSubmit,
  initialName = "",
}: LandingPageProps) {
  const [name, setName] = useState(initialName);

  const trimmed = useMemo(() => name.trim(), [name]);
  const canSubmit = trimmed.length >= 2;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ name: trimmed, mode: "CREATE" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border-4 border-slate-800 bg-white shadow-xl p-6">
        {/* Header */}
        <header className="flex items-center justify-center gap-2 mb-6">
          <span className="text-xl">🎨</span>
          <span className="text-xl">📐</span>
          <h1 className="text-base font-semibold text-slate-900">
            Math Collab Game v1
          </h1>
          <span className="text-xl">✖️</span>
          <span className="text-xl">🎮</span>
        </header>

        {/* Main Content - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 mb-4">
          {/* Left Side - Game Preview */}
          <section className="rounded-2xl bg-gradient-to-b from-indigo-50 to-sky-50 p-6 relative">
            {/* Math Problem */}
            <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm mb-6">
              <p className="text-center text-lg font-semibold text-slate-900">
                15 × 4 = ?
              </p>
            </div>

            {/* Players */}
            <div className="flex items-center justify-center gap-6">
              <div className="w-14 h-14 rounded-full bg-pink-200 flex items-center justify-center">
                <span className="text-2xl">👧</span>
              </div>

              <div className="h-0.5 w-10 bg-teal-400 rounded-full" />

              <div className="w-14 h-14 rounded-full bg-sky-200 flex items-center justify-center">
                <span className="text-2xl">👦</span>
              </div>
            </div>
          </section>

          {/* Right Side - Join/Create */}
          <section className="rounded-2xl bg-white border-2 border-slate-800 p-5">
            <h2 className="text-center text-sm font-semibold text-slate-900 mb-3">
              Group <span className="text-purple-600">Multiplayer</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <NameInput
                value={name}
                onChange={setName}
                placeholder="Name"
                className="w-full rounded-lg bg-white px-3 py-2 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              />

              <ActionButton
                type="submit"
                disabled={!canSubmit}
                label="Find a Match"
                className="w-full rounded-lg bg-white py-2 font-semibold text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-sm"
              />

              {!canSubmit && (
                <p className="text-center text-xs text-slate-500">
                  Enter at least 2 characters
                </p>
              )}
            </form>
          </section>
        </div>

        {/* Tagline */}
        <p className="text-center text-sm font-medium text-slate-700">
          Solve Math. Together. In Real Time.
        </p>
      </div>
    </div>
  );
}
