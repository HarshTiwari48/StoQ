"use client";

import Link from "next/link";
import { Search, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="w-full rounded-xl bg-white/80 backdrop-blur-xl shadow-md border border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Left - Brand */}
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-2xl font-bold tracking-tight text-slate-800"
        >
          StoQ
        </Link>

        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link
            href="/dashboard"
            className="hover:text-blue-600 transition"
          >
            News
          </Link>

          <Link
            href="/portfolio"
            className="hover:text-blue-600 transition"
          >
            Portfolio
          </Link>

          <Link
            href="/insights"
            className="hover:text-blue-600 transition"
          >
            Insights
          </Link>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden lg:flex items-center relative w-[340px]">
        <Search
          size={18}
          className="absolute left-3 text-slate-400"
        />

        <Input
          placeholder="Search stocks, sectors, news..."
          className="pl-10 rounded-lg bg-slate-50 border-slate-200"
        />
      </div>

      {/* Right - User */}
      <div className="flex items-center gap-3">
        <Link href="/login">
  <Button
    variant="outline"
    className="rounded-lg border-slate-200"
  >
    Login
  </Button>
</Link>

        <div className="flex items-center gap-3">
  {user ? (
    <button className="rounded-full overflow-hidden border border-slate-200 hover:shadow-md transition">
      <img
        src={user.image}
        alt={user.name}
        className="w-10 h-10 object-cover"
      />
    </button>
  ) : (
    <>
      <Link href="/login">
        <Button
          variant="outline"
          className="rounded-lg border-slate-200"
        >
          Login
        </Button>
      </Link>

      <button className="rounded-full p-2 hover:bg-slate-100 transition">
        <UserCircle2
          size={28}
          className="text-slate-600"
        />
      </button>
    </>
  )}
</div>
      </div>
    </nav>
  );
}