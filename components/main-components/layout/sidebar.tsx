"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaImages,
  FaUser,
  FaCalendarAlt,
  FaBell,
  FaCompass,
  FaSignOutAlt,
} from "react-icons/fa";

type SidebarEvent = {
  id: string;
  title: string;
  status: "Ongoing" | "Upcoming" | "Ended";
  dateLabel: string;
};

type User = {
  id: string;
  username: string;
  avatarUrl?: string;
};

const navItems = [
  { href: "/homepage", label: "Home", icon: FaHome },
  { href: "/gallery", label: "Gallery", icon: FaImages },
  { href: "/events", label: "Events", icon: FaCalendarAlt },
  { href: "/profile", label: "Profile", icon: FaUser },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<SidebarEvent[]>([]);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      const res = await fetch("/api/sidebar", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setUser(data.user);
      setEvents(data.events || []);
    } catch {
      console.error("Sidebar fetch failed");
      setEvents([]);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[#e8dfd3] bg-[#f7f4f0] px-4 py-3 lg:hidden">
        <h1 className="text-lg font-bold text-[#3e2c23]">PochiKaku</h1>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-[#3e2c23] transition hover:bg-[#ece4d9]"
        >
          <FaBars />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col overflow-hidden bg-[#f7f4f0] shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 🔥 Texture Overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply texture-paper" />

        {/* Content wrapper */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-xl font-bold text-[#3e2c23]">PochiKaku</h1>

            <button
              className="rounded-lg p-2 text-[#3e2c23] transition hover:bg-[#ece4d9] lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* User row */}
          <div className="flex items-center gap-3 px-5 pb-4 pt-1">
            <div className="relative h-10 w-10">
              <Image
                src={user?.avatarUrl || "/avatar.jpg"}
                alt="avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div>
              <p className="font-semibold text-[#3e2c23]">
                {user?.username || "Artist"}
              </p>
              <p className="text-xs text-[#7a6757]">Welcome back</p>
            </div>

            <button className="relative ml-auto rounded-lg p-2 hover:bg-[#ece4d9]">
              <FaBell />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>

          {/* Scrollable area */}
          <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {/* Nav */}
            <nav className="pb-3 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                      isActive
                        ? "bg-[#e8dfd3] text-[#3e2c23]"
                        : "text-[#5a4636] hover:bg-[#efe8de]"
                    }`}
                  >
                    <Icon />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Compass card */}
            <div className="pb-3">
              <div className="rounded-2xl bg-[#3e2c23] p-4 text-white">
                <div className="flex gap-3">
                  <div className="bg-white/15 p-2 rounded-xl">
                    <FaCompass />
                  </div>
                  <div>
                    <p className="font-semibold">Keep creating</p>
                    <p className="text-xs mt-1 text-white/80">
                      Explore new artworks, events, and artists.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Events */}
            <div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">
                      Ongoing Events
                    </h3>

                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>

                  <Link href="/events" className="text-xs text-[#8b6b4f]">
                    View all
                  </Link>
                </div>

                {events.length === 0 ? (
                  <div className="text-sm text-[#6b5a4d]">
                    There are no current ongoing events.
                  </div>
                ) : (
                  <div className="sidebar-scroll max-h-[240px] space-y-2 overflow-y-auto pr-1">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-[#f7f4f0] p-3 rounded-xl"
                      >
                        <p className="text-sm font-medium">
                          {event.title}
                        </p>
                        <p className="text-xs text-[#7a6757]">
                          {event.dateLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-[#efe8de] py-3 rounded-xl hover:bg-[#e8dfd3]"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}