import Link from "next/link";

export default function Sidebar() {
  const navLinks = [
    { title: "Home", href: "/homepage" },
    { title: "Gallery", href: "/gallery" },
    { title: "Events", href: "/events" },
    { title: "Settings", href: "/settings" }, // placeholder
  ];

  return (
    <aside className="w-64 sticky top-0 bg-[#3e2c23] text-[#f5efe6] flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">PochiKaku</h1>
      <nav className="flex flex-col space-y-4">
        {navLinks.map(({ title, href }) => (
          <Link
            key={title}
            href={href}
            className="hover:text-[#e8dfd3]"
          >
            {title}
          </Link>
        ))}
        <Link
          href="/auth"
          className="hover:text-[#e8dfd3] mt-auto"
        >
          Logout
        </Link>
      </nav>
    </aside>
  );
}