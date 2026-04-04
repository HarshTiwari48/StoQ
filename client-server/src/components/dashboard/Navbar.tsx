"use client";

import Link from "next/link";
import { Search, UserCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";


type NavbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export default function Navbar({
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="w-full rounded-xl bg-white/80 backdrop-blur-xl shadow-md border border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Left - Brand */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2">
  <Image
    src="/logoonly-removebg-preview.png"
    alt="StoQ Icon"
    width={32}
    height={32}
    className="w-8 h-8 object-contain"
  />
  <Image
    src="/symbolonly.png"
    alt="StoQ"
    width={80}
    height={32}
    className="h-8 w-auto object-contain"
  />
</Link>
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-blue-600 transition">News</Link>
          <Link href="/portfolio" className="hover:text-blue-600 transition">Portfolio</Link>
          <Link href="/demo" className="hover:text-blue-600 transition">Analyze News</Link>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden lg:flex items-center relative w-[340px]">
        <Search size={18} className="absolute left-3 text-slate-400" />
        <Input
  value={searchQuery}
  onChange={(e) =>
    onSearchChange(e.target.value)
  }
  placeholder="Search stocks, sectors, news..."
  className="pl-10 rounded-lg bg-slate-50 border-slate-200"
/>
      </div>

      {/* Right - User */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User"}
                width={40}
                height={40}
                className="rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserCircle2 size={28} className="text-slate-600" />
            )}
            <span className="text-sm text-slate-600 hidden md:block">{user.name}</span>
            <Button
              variant="outline"
              className="rounded-lg border-slate-200"
              onClick={() => signOut({ callbackUrl: "/dashboard" })}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button variant="outline" className="rounded-lg border-slate-200">
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}