"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
};

export default function Header() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  /* 🔐 LOAD USER FROM COOKIE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setProfile(null);
          return;
        }

        const data = await res.json();

        // 🔒 Optional role guard
        if (data.role !== "teacher") {
          router.replace("/");
          return;
        }

        setProfile(data);
      } catch {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [router]);

  /* 🔍 SEARCH */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    router.push(`/teacher/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  /* 🚪 LOGOUT */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
    router.refresh();
  };

  /* 🧠 CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <p className="text-xs text-gray-500 hidden md:block">
              Manage your classes, quizzes, and students
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* SEARCH */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes, students..."
                className="pl-10 pr-4 py-2.5 w-48 lg:w-64 bg-gray-50 rounded-xl border 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </form>

            {/* NOTIFICATIONS */}
            <button
              className="relative p-2.5 rounded-xl hover:bg-gray-50"
            >
              <Bell className="w-7 h-7 text-gray-600" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                 text-red-600 text-xs font-bold rounded-full
                  flex items-center justify-center">
                  99+
                </span>
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="flex items-center gap-2"
              >
                {profile?.profileImage ? (
                  <Image
                    src={profile.profileImage}
                    alt={profile.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                    flex items-center justify-center text-white font-bold text-lg
                    border-2 border-white shadow-md">
                    {profile?.name?.[0]?.toUpperCase() || "T"}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {openDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold text-sm truncate">
                      {profile?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
