"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import HomePage from "./components/Home";

export default function Home() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          setUser(null); // not logged in
          return;
        }
        const data = await res.json();
        setUser(data); // logged in
      } catch {
        setUser(null); // error, treat as not logged in
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Header />
      <HomePage />
    </div>
  );
}
