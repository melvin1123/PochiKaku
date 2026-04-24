"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validation/auth";

const floatingCards = [
  { id: 1, title: "Golden Hour", img: "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776907931/events/references/fljjylcsysvvaxnvvqtj.jpg" },
  { id: 2, title: "Forest Dream", img: "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776907670/event-submissions/wcry7zrnxaknrvj09xsx.jpg" },
  { id: 3, title: "Forgotten City", img: "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776233164/pochikomporo/posts/zmebgcmnobve7jfdhrc0.jpg" },
  { id: 4, title: "Warm Coffee", img: "https://res.cloudinary.com/dh8rpbwxq/image/upload/v1776232543/pochikomporo/posts/g0n9mosrr1u6uqcdqx4i.jpg" },
];

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <main className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-[#f5efe6] to-[#e8dfd3] text-[#3e2c23]">

          {/* Top-left branding */}
        <div className="absolute top-4 left-4 text-2xl font-bold ml-4 z-50">
            PochiKaku
        </div>

      {/* LEFT SIDE VISUAL */}
      <div className="hidden md:flex relative items-center justify-center overflow-hidden">
        {/* Background Image */}
        <Image
          src="/backgrounds/lp-bg-img3.jpg"
          alt="bg"
          fill
          className="object-cover opacity-20 blur-xl"
        />
        
        {/* Floating Cards */}
        {floatingCards.map((card, i) => (
        <motion.div
            key={card.id}
            className={`absolute bg-white p-3 rounded-2xl shadow w-40
            ${i === 0 ? "top-50 left-10" : ""}
            ${i === 1 ? "top-20 right-80" : ""}
            ${i === 2 ? "bottom-30 right-10" : ""}
            ${i === 3 ? "bottom-50 right-40" : ""}

            `}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: i * 0.3 }}
        >
            {/* IMAGE */}
            <div className="h-24 w-full rounded-xl mb-2 relative overflow-hidden">
            <Image
                src={card.img}
                alt={card.title}
                fill
                className="object-cover"
            />
            </div>

            {/* CARD TITLE */}
            <p className="text-sm font-medium text-[#3e2c23]">{card.title}</p>
        </motion.div>
        ))}

        {/* Text Overlay */}
        <div className="absolute bottom-16 left-12 max-w-sm text-[#3e2c23] drop-shadow-md">
          <h2 className="text-3xl font-bold leading-tight">
            Share your art
          </h2>
          <p className="text-base text-[#5a4636] mt-2">
            with people who truly get it.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/85 backdrop-blur-md p-8 rounded-2xl shadow-lg text-[#3e2c23]"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">
            {mode === "login" ? "Welcome Back" : "Join the Community"}
          </h2>
          <p className="text-center text-sm text-[#5a4636] mb-6">
            Share your art. Discover others.
          </p>

          {mode === "login" ? <LoginForm /> : <RegisterForm />}

          <div className="text-center mt-6 text-sm">
            {mode === "login" ? "No account?" : "Already have an account?"}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="ml-2 text-[#6b4f3b] font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Login"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter(); // ✅ FIXED (inside component)

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});

const handleSubmit = async () => {
  const result = loginSchema.safeParse(form);

  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }

  setErrors({});

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ general: data.error });
      return;
    }

    router.push("/homepage");
    router.refresh();

  } catch (err) {
    console.error(err);
    setErrors({ general: "Something went wrong" });
  }
};

  return (
    <div className="space-y-4">
      <div>
        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#6b4f3b] text-white py-3 rounded-xl hover:-translate-y-0.5 transition"
      >
        Login
      </button>
            {errors.general && (
        <p className="text-red-500 text-sm">{errors.general}</p>
      )}
    </div>
  );
}

function RegisterForm() {
  const [form, setForm] = useState({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
    setErrors({ confirmPassword: ["Passwords do not match"] });
    return;
  }
  const result = registerSchema.safeParse(form);

  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }

  setErrors({});

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ general: data.error });
      return;
    }

    console.log("Register success:", data);

    // ✅ redirect to login (or auto-login later)
    window.location.href = "/auth";

  } catch (err) {
    console.error(err);
    setErrors({ general: "Something went wrong" });
  }
};

  return (
    <div className="space-y-3 ">
      <div>
        <input
          placeholder="Artist Name"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username[0]}</p>}
      </div>

      <div>
        <input
          placeholder="Email"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 rounded-xl bg-[#f5efe6] text-[#3e2c23] placeholder:text-[#8a7666] focus:ring-2 focus:ring-[#6b4f3b] outline-none"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">
            {errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <p className="text-xs text-[#6b5a4d]">
        Password must include uppercase and a number.
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-[#6b4f3b] text-white py-3 rounded-xl hover:-translate-y-0.5 transition"
      >
        Register
      </button>
      {errors.general && (
        <p className="text-red-500 text-sm">{errors.general}</p>
      )}
    </div>
  );
}