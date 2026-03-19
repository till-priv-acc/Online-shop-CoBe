'use client';

import LoginForm from "./components/LoginForm";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const fetcher = async () => {
      const check = await api.get("/users/check-session");
      if (check.data.loggedIn) {
        router.push("/userpage");
      }
    };

    fetcher();
  }, [router]);

  return <LoginForm />;
}