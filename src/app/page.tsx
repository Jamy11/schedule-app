"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STORE_OPTIONS, DEFAULT_STORE } from "@/constants/schedule";

const FEATURES = [
  {
    title: "Auto-break scheduling",
    body: "One click assigns 15-min and 30-min breaks for every employee — no two people on break at the same time.",
  },
  {
    title: "Prints on one page",
    body: "Add as many rows as you need. The schedule auto-scales to fit a single letter page when printing.",
  },
  {
    title: "Management tables",
    body: "Track LOD, MGMT, Receiving, Bell and lunches alongside the day and evening shifts.",
  },
];

export default function Home() {
  const router = useRouter();
  const [store, setStore] = useState<string>(DEFAULT_STORE);

  const scrollToSelector = () => {
    document
      .getElementById("store-selector")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="flex-1 bg-gray-50">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
          Shift scheduling, simplified
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900">
          Daily schedule, <span className="text-blue-600">on one page.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-gray-600">
          Plan day and evening shifts, auto-assign breaks without conflicts, and
          print the whole schedule to a single sheet.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={scrollToSelector}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Open a schedule
          </button>
          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Learn more
          </button>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto w-full max-w-5xl px-6 pb-16 grid gap-4 sm:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-gray-900">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      {/* Store selector */}
      <section
        id="store-selector"
        className="mx-auto w-full max-w-xl px-6 pb-24"
      >
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            Pick a store
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Open the schedule for one of the configured stores. The page will
            load only that store&apos;s employees.
          </p>

          <label
            htmlFor="store-select"
            className="mt-6 block text-sm font-medium text-gray-700"
          >
            Store number
          </label>
          <select
            id="store-select"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {STORE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Store {option}
              </option>
            ))}
          </select>

          <button
            onClick={() => router.push(`/schedule?store=${store}`)}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Open schedule for store {store}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Shiftly
        </div>
      </footer>
    </main>
  );
}
