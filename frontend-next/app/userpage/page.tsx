'use client';

import { useEffect, useState } from "react";
import LogoutButton from "../../components/LogoutButton";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import { Box } from "@mui/material";
import { api } from "../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchUser() {
      try {
        // 1️⃣ Check-Cookie / Session prüfen
        const check = await api.get("/users/check-cookie");
        if (!check.data.loggedIn) {
          window.location.href = "/login";
          return;
        }

        // 2️⃣ Userdaten holen
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Userdaten:", err);
        setError("Fehler beim holen deiner Daten, wenn dieser Fehler häufiger auftritt bitte an die IT wenden");
      }
    }

    fetchUser();
  }, []);

  if (error) {
    return (
      <Box sx={{ padding: 4 }}>
        <h1>Fehler</h1>
        <p>{error}</p>
        <LogoutButton />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ padding: 4 }}>
        <h1>Lädt...</h1>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 400, margin: "0 auto" }}>
      
    <h1>
    Hallo {user.name} <EmojiPeopleIcon sx={{ verticalAlign: 'middle', ml: 2 }} />
    </h1>

      {/* Admin / User Icon */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {user.isAdmin ? (
          <AdminPanelSettingsIcon color="error" sx={{ mr: 1 }} />
        ) : (
          <PersonIcon color="primary" sx={{ mr: 1 }} />
        )}
        <span>{user.isAdmin ? "ADMIN" : "USER"}</span>
      </Box>

      {/* User Details */}
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>UserID:</strong> {user.id}</p>

      {/* Logout */}
      <LogoutButton />
    </Box>
  );
}