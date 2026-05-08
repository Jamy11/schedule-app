"use client";

import { useRouter } from "next/navigation";
import { STORE_OPTIONS } from "@/constants/schedule";

interface StoreSelectorProps {
  store: string;
  onStoreChange: (store: string) => void;
}

export default function StoreSelector({ store, onStoreChange }: StoreSelectorProps) {
  const router = useRouter();

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStore = e.target.value;
    onStoreChange(nextStore);
    router.push(`/schedule?store=${nextStore}`);
  };

  return (
    <div className="store-selector-container rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <label className="block text-sm font-medium text-gray-900 mb-2" htmlFor="store-select">
        Store
      </label>
      <select
        id="store-select"
        value={store}
        onChange={handleStoreChange}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {STORE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}