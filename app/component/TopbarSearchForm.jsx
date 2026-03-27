"use client";

import { useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Read+submit `?q=` for feed search. Lives in its own file so the parent
 * Topbar can wrap us in <Suspense> (required by Next.js for useSearchParams).
 */
export default function TopbarSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const submitSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    const params = new URLSearchParams();
    if (term) params.set("q", term);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <form
      onSubmit={submitSearch}
      className="h-[40px] rounded-full flex bg-white px-4 items-center"
    >
      <Search className="text-black mr-2" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for friends, posts and videos"
        className="h-full px-2 w-full focus:outline-none text-black bg-transparent"
      />
    </form>
  );
}
