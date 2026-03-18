"use client";

import { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

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

  return (
    <Box
  display="flex"
  justifyContent="center"
  alignItems="center"
  minHeight="100vh"
  sx={{ background: "#f5f5f5" }}
>
  <Box
    component="form"
    onSubmit={handleSubmit}
    sx={{
      width: 420,
      p: 4,
      borderRadius: 3,
      background: "#fff",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    }}
  >
    <Typography variant="h4" mb={3} textAlign="center">
      Login
    </Typography>

    <TextField
      label="Email"
      type="email"
      fullWidth
      margin="normal"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <TextField
      label="Passwort"
      type="password"
      fullWidth
      margin="normal"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    {error && (
      <Typography color="error" variant="body2" mt={1}>
        {error}
      </Typography>
    )}

    <Button
      type="submit"
      variant="contained"
      fullWidth
      sx={{
        mt: 3,
        py: 1.2,
        borderRadius: 2,
        fontWeight: 600,
      }}
    >
      Einloggen
    </Button>

    <Typography variant="body2" mt={3} textAlign="center">
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
  </Box>
</Box>
  );
}