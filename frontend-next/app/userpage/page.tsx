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

  // Bild abhängig von Fehler oder normalem Zustand auswählen
  const headerImage = error
  ? "/images/pb-error.png"
  : "/images/pb-success.png";

  return (
    <Box>
      {/* Header-Bild über die gesamte Breite */}
      <Box
        sx={{
            width: "100%",          // volle Breite des Containers
            maxWidth: 1600,          // maximale Breite des Bildes
            margin: "0 auto",       // zentriert horizontal
            height: 250,
            backgroundImage: `url("${headerImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 0,        // optional: abgerundete Ecken
        }}
      />

      {/* Content-Container */}
      <Box sx={{ padding: 4, maxWidth: 400, margin: "0 auto" }}>
        {error ? (
          <>
            <h1>Fehler</h1>
            <p>{error}</p>
            <LogoutButton />
          </>
        ) : !user ? (
          <h1>Lädt...</h1>
        ) : (
          <>
            <h1>
              Hallo {user.name} <EmojiPeopleIcon sx={{ verticalAlign: 'middle', ml: 2, fontSize: 40 }} />
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
          </>
        )}
      </Box>
    </Box>
  );
}