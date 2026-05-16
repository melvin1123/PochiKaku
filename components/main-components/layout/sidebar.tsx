"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Pusher from "pusher-js";
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
  FaHeart,
  FaComment,
} from "react-icons/fa";

function formatTimeAgo(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

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

type Notification = {
  id: string;
  type: "LIKE" | "POST_REPLY" | "COMMENT_REPLY" | "FOLLOW" | string;
  actorName: string;
  actorAvatar?: string;
  createdAt: string;
  postId?: string;
};

const navItems = [
  { href: "/homepage", label: "Home", icon: FaHome },
  { href: "/gallery", label: "Gallery", icon: FaImages },
  { href: "/events", label: "Events", icon: FaCalendarAlt },
  { href: "/profile", label: "Profile", icon: FaUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<SidebarEvent[]>([]);
  const [showTopbar, setShowTopbar] = useState<boolean>(true);

  // Notification Core State
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // On-Demand Modal State for Notification Clicks
  const [modalPost, setModalPost] = useState<any | null>(null);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSidebarData();

    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < lastScrollY) {
            setShowTopbar(true);
          } else if (currentScrollY > 60 && currentScrollY > lastScrollY) {
            setShowTopbar(false);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind("new-notification", (data: Notification) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [data, ...prev].slice(0, 10));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

  const fetchSidebarData = async (): Promise<void> => {
    try {
      const res = await fetch("/api/sidebar", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error();

      setUser(data.user);
      setEvents(data.events || []);

      if (typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
      }
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch {
      console.error("Sidebar fetch failed");
      setEvents([]);
    }
  };

  // --- NEW: The updated toggle function ---
  const toggleNotifications = async () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);

    // If we are opening the dropdown and there are unread notifications
    if (opening && unreadCount > 0) {
      setUnreadCount(0); // Instantly clear the red dot for the user

      try {
        // Ping your database to actually save that these were read
        // Note: Make sure this endpoint matches your actual backend route!
        await fetch("/api/notifications/read", {
          method: "POST", // or PATCH/PUT depending on your backend
          credentials: "include",
        });
      } catch (error) {
        console.error("Failed to mark notifications as read in database", error);
      }
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    setIsNotifOpen(false);

    if (notif.postId) {
      setIsModalLoading(true);
      try {
        const res = await fetch(`/api/posts/${notif.postId}`);
        if (res.ok) {
          const postData = await res.json();
          setModalPost(postData);
        } else {
          console.error("Failed to load notification post target");
        }
      } catch (err) {
        console.error("Error retrieving post data:", err);
      } finally {
        setIsModalLoading(false);
      }
    } else {
      router.push(`/profile/${notif.actorName}`);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const profileHref = user ? `/profile/${user.id}` : "/profile";

  return (
    <>
      {isModalLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3e2c23] border-t-transparent" />
        </div>
      )}

      {/* Mobile top bar */}
      <div
        className={`sticky top-0 z-40 flex items-center justify-between border-b border-[#e8dfd3] bg-[#f7f4f0] px-4 py-3 lg:hidden transition-transform duration-300 ${
          showTopbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dh8rpbwxq/image/upload/v1778747090/pochi_yb8yaz.png"
            alt="PochiKaku Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <h1 className="text-lg font-bold text-[#3e2c23]">PochiKaku</h1>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-[#3e2c23] transition hover:bg-[#ece4d9]"
        >
          <FaBars />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col bg-[#f7f4f0] shadow-xl transition-transform duration-300 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply texture-paper" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/dh8rpbwxq/image/upload/v1778747090/pochi_yb8yaz.png"
                alt="PochiKaku Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="text-xl font-bold text-[#3e2c23]">PochiKaku</h1>
            </div>

            <button
              className="rounded-lg p-2 text-[#3e2c23] transition hover:bg-[#ece4d9] lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="relative z-20 flex items-center gap-3 px-5 pb-4 pt-1">
            <Link
              href={profileHref}
              className="relative h-10 w-10 flex-shrink-0 transition-opacity hover:opacity-75"
            >
              <Image
                src={
                  user?.avatarUrl ||
                  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg"
                }
                alt="avatar"
                fill
                className="rounded-full object-cover"
              />
            </Link>

            <div className="flex flex-col">
              <Link href={profileHref} className="w-fit font-semibold text-[#3e2c23]">
                {user?.username || "Artist"}
              </Link>
              <p className="text-xs text-[#7a6757]">Welcome back</p>
            </div>

            <div className="relative ml-auto" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="relative rounded-lg p-2 hover:bg-[#ece4d9] text-[#3e2c23] transition-colors"
              >
                <FaBell className="text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#f7f4f0]"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[260px] rounded-xl bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#e8dfd3] bg-[#f7f4f0] px-4 py-3">
                    <span className="text-sm font-semibold text-[#3e2c23]">
                      Notifications
                    </span>
                    <Link
                      href="/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs font-medium text-[#8b6b4f] hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#7a6757]">
                        No new notifications right now.
                      </div>
                    ) : (
                      notifications.map((notif, idx) => {
                        return (
                          <button
                            key={notif.id || idx}
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full text-left flex items-start gap-3 border-b border-[#f7f4f0] p-3 last:border-0 hover:bg-[#fcfbf9] transition-colors"
                          >
                            <div className="relative h-9 w-9 flex-shrink-0">
                              <Image
                                src={
                                  notif.actorAvatar ||
                                  "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg"
                                }
                                alt={notif.actorName}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>

                            <div className="flex-1 flex flex-col gap-0.5">
                              <p className="text-xs text-[#5a4636] leading-snug">
                                <span className="font-semibold text-[#3e2c23]">
                                  {notif.actorName}
                                </span>{" "}
                                {notif.type === "POST_REPLY" && "commented on your artwork."}
                                {notif.type === "COMMENT_REPLY" && "replied to your comment."}
                                {notif.type === "LIKE" && "liked your artwork."}
                                {notif.type === "FOLLOW" && "started following you."}
                                {!["POST_REPLY", "COMMENT_REPLY", "LIKE", "FOLLOW"].includes(notif.type) &&
                                  "interacted with your profile."}
                              </p>
                              <span className="text-[10px] font-medium text-[#8b6b4f]">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <nav className="pb-3 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

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

            <div className="pb-3">
              <div className="rounded-2xl bg-[#3e2c23] p-4 text-white">
                <div className="flex gap-3">
                  <div className="bg-white/15 p-2 rounded-xl h-fit">
                    <FaCompass />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Keep creating</p>
                    <p className="text-xs mt-1 text-white/80 leading-normal">
                      Explore new artworks, events, and artists.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex justify-between mb-3 items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#3e2c23]">Ongoing Events</h3>
                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      Live
                    </span>
                  </div>
                  <Link href="/events" className="text-xs text-[#8b6b4f] hover:underline">
                    View all
                  </Link>
                </div>

                {events.length === 0 ? (
                  <div className="text-sm text-[#6b5a4d] py-2">
                    There are no current ongoing events.
                  </div>
                ) : (
                  <div className="sidebar-scroll max-h-[240px] space-y-2 overflow-y-auto pr-1">
                    {events.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block bg-[#f7f4f0] p-3 rounded-xl hover:bg-[#efe8de] transition-colors"
                      >
                        <p className="text-sm font-medium text-[#3e2c23] line-clamp-1">
                          {event.title}
                        </p>
                        <p className="text-xs text-[#7a6757] mt-0.5">{event.dateLabel}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-[#efe8de] py-3 text-sm font-medium text-[#5a4636] rounded-xl hover:bg-[#e8dfd3] transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {modalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={() => setModalPost(null)}
        >
          <div
            className="relative flex h-[85vh] w-[90vw] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl lg:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalPost(null)}
              className="absolute right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
            >
              <FaTimes size={20} />
            </button>

            <div className="relative flex flex-1 items-center justify-center bg-black">
              <Image
                src={modalPost.image}
                alt={modalPost.title || "Artwork Detail"}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="flex h-full w-full flex-col border-l border-[#e8dfd3] bg-white lg:w-[400px]">
              <div className="flex items-center gap-3 border-b border-[#e8dfd3] p-4">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-[#e8dfd3]">
                  <Image
                    src={modalPost.avatar || "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776317747/avatar_jtbppo.jpg"}
                    alt={modalPost.artist || "Artist"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#3e2c23]">
                    {modalPost.artist}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-[#9a8878]">
                    {modalPost.time || "Just now"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <h2 className="text-base font-bold text-[#3e2c23]">
                  {modalPost.title}
                </h2>
                {modalPost.description && (
                  <p className="mt-2 text-sm leading-relaxed text-[#5a4636]">
                    {modalPost.description}
                  </p>
                )}

                <div className="mt-6 flex items-center gap-6 border-t border-[#f7f4f0] pt-4 text-sm font-bold text-[#3e2c23]">
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" size={16} />
                    <span>{modalPost.likes ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComment size={16} />
                    <span>{modalPost.commentCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}