"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-full border bg-neutral-50 px-4 transition
        ${
          focused
            ? "w-[280px] border-neutral-900 bg-white shadow-sm"
            : "w-[230px] border-neutral-200 hover:border-neutral-300"
        }
      `}
    >
      <Search size={17} className="text-neutral-500" />

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search drivers, teams..."
        className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
      />

      {value && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setValue("")}
          className="text-neutral-400 transition hover:text-neutral-900"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}