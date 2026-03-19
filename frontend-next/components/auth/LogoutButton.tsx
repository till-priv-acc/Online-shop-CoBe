// /components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { api } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      router.push("/authSites/login");
    } catch (err) {
      console.error("Logout fehlgeschlagen", err);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}