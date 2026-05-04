"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STORE_OPTIONS = ["101", "464", "65"];

export default function Home() {
  const router = useRouter();
  const [store, setStore] = useState("101");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-20 px-6 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-zinc-900 mb-4">
            Select your store
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Choose the store number and open the schedule page to use only that store's employees.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store number
          </label>
          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {STORE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={() => router.push(`/schedule?store=${store}`)}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Open Schedule for store {store}
          </button>
        </div>
      </main>
    </div>
  );
}
