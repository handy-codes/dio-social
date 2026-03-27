"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Person, Search, Chat, Notifications } from "@mui/icons-material";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";



export default function Topbar() {
  // Search value stays in the URL (`?q=`) so the feed can filter server-side.
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
    <header className='h-[65px] bg-[#1877F2] font-semibold sticky top-0 z-50'>
      <nav className="flex justify-between h-full w-full px-4 sm:p-6 items-center text-white">
        <Link href="/">
          <h1 className='sm:block text-2xl'>DIO</h1>
        </Link>
        <div className="min-w-0 flex-1 max-w-xl mx-2 sm:mx-4 max-[640px]:hidden">
          <form onSubmit={submitSearch} className="h-[40px] rounded-full flex bg-white px-4 items-center">
            <Search className="text-black mr-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for friends, posts and videos"
              className="h-full px-2 w-full focus:outline-none text-black bg-transparent"
            />
          </form>
        </div>
        <div className="flex gap-4 items-center shrink-0">
          <Link href="/">
            <h2>HOME</h2>
          </Link>
          <Link href="/profile">
            <h2>PROFILE</h2>
          </Link>
          <div className="hidden sm:flex gap-2 sm:gap-4 items-center text-white">
            <div className="relative cursor-pointer">
              <Person sx={{ fontSize: 30 }} />
              <span className="text-xs flex items-center justify-center absolute bg-[red] w-[15px] rounded-full -top-[5px] -right-[5px]">
                2
              </span>
            </div>
            <div className="relative cursor-pointer">
              <Chat />
              <span className="text-xs flex items-center justify-center absolute bg-[red] w-[15px] rounded-full -top-[5px] -right-[5px]">
                5
              </span>
            </div>
            <div className="relative cursor-pointer">
              <Notifications />
              <span className="text-xs flex items-center justify-center absolute bg-[red] w-[15px] rounded-full -top-[5px] -right-[5px]">
                4
              </span>
            </div>
          </div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="text-sm bg-white text-[#1877F2] px-3 py-1 rounded-md font-semibold"
              >
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>
        </div>
      </nav>
    </header>
  )
}
