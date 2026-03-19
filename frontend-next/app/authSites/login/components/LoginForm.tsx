"use client";

import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import BoxForm from "@/components/UIElements/BoxForm";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
        await api.post("/users/login", { email, password });
        router.push("/userpage"); // Weiterleitung nach Login
    } catch (err: any) {
        setError(err.response?.data?.message || "Login fehlgeschlagen");
    }
  };

  return(

  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    sx={{ background: "#f5f5f5" }}
  >
    <BoxForm component="form" onSubmit={handleSubmit} sx={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {/* Überschrift */}
      <Typography variant="h4" sx={{ gridColumn: "1 / -1", textAlign: "center", mb: 3 }}>
        Login
      </Typography>

      {/* Email */}
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ gridColumn: "1 / -1" }}
      />

      {/* Passwort */}
      <TextField
        label="Passwort"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        sx={{ gridColumn: "1 / -1" }}
      />

      {/* Fehleranzeige */}
      {error && (
        <Typography color="error" variant="body2" sx={{ gridColumn: "1 / -1", mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          gridColumn: "1 / -1",
          mt: 3,
          py: 1.2,
          borderRadius: 2,
          fontWeight: 600,
        }}
      >
        Einloggen
      </Button>

      {/* Registrierung Link */}
      <Typography variant="body2" sx={{ gridColumn: "1 / -1", mt: 3, textAlign: "center" }}>
        Noch kein Konto?{" "}
        <Link
          href="/authSites/register"
          style={{
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Jetzt registrieren
        </Link>
      </Typography>
    </BoxForm>
  </Box>
  );
}