"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { allCountries, userTypesCreate } from "@/constants/userConstants";

interface RegisterFormData {
  name: string;
  firstname: string;
  street: string;
  hNumber: string;
  pCode: string;
  town: string;
  country: string;
  email: string;
  password: string;
  type: string; // explizit drin
}

const userTypes = userTypesCreate

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    firstname: "",
    street: "",
    hNumber: "",
    pCode: "",
    town: "",
    country: "",
    email: "",
    password: "",
    type: "USER", // <-- Standardmäßig false
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/users/create", formData);
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registrierung fehlgeschlagen"
      );
    }
  };

  const countries = allCountries;

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
          width: 500,
          p: 4,
          borderRadius: 3,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h4" mb={3} textAlign="center">
          Registrierung
        </Typography>

        <Box display="flex" gap={2}>
          <TextField
            label="Vorname"
            name="firstname"
            fullWidth
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <TextField
            label="Nachname"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Box>

        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <TextField
          label="Passwort"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Box display="flex" gap={2} mt={2}>
          <TextField
            label="Straße"
            name="street"
            fullWidth
            value={formData.street}
            onChange={handleChange}
            required
          />
          <TextField
            label="Nr."
            name="hNumber"
            sx={{ width: 100 }}
            value={formData.hNumber}
            onChange={handleChange}
            required
          />
        </Box>

        <Box display="flex" gap={2} mt={2}>
          <TextField
            label="PLZ"
            name="pCode"
            sx={{ width: 120 }}
            value={formData.pCode}
            onChange={handleChange}
            required
          />
          <TextField
            label="Ort"
            name="town"
            fullWidth
            value={formData.town}
            onChange={handleChange}
            required
          />
        </Box>

        <TextField
          select
          label="Land"
          name="country"
          fullWidth
          margin="normal"
          value={formData.country}
          onChange={handleChange}
          required
        >
          {countries.map((country) => (
            <MenuItem key={country} value={country}>
              {country}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="User Art"
          name="type"
          fullWidth
          margin="normal"
          value={formData.type}
          onChange={handleChange}
          required
        >
          {userTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

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
          Registrieren
        </Button>
      </Box>
    </Box>
  );
}