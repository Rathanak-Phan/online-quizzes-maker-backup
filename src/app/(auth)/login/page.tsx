"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react"; // Icons

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Save token in cookie
        document.cookie = `token=${data.token}; path=/`;

        // Redirect based on role
        if (data.role.toLowerCase() === "admin") router.push("/admin");
        else if (data.role.toLowerCase() === "teacher") router.push("/teacher");
        else if (data.role.toLowerCase() === "user") router.push("/");
        else router.push("/"), router.refresh();
      } else {
        // Handle pending teacher or other errors
        if (
          res.status === 403 &&
          data.message.toLowerCase().includes("awaiting")
        ) {
          setMessage("Your teacher account is pending admin approval.");
        } else {
          setMessage(data.message || "Login failed");
        }
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white shadow-xl rounded-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="rounded-xl"
                  priority
                />
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-4">QuizMaster</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Ready to test your knowledge?
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 mb-6">
            <div className="py-2 font-semibold bg-blue-600 text-white rounded-l-lg text-center">
              Sign In
            </div>
            <Link
              href="/register"
              className="py-2 font-semibold bg-gray-200 rounded-r-lg text-gray-700 text-center"
            >
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-center font-medium py-3 rounded-lg ${
                  message.includes("successful")
                    ? "bg-green-100 text-green-600"
                    : message.includes("pending")
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
