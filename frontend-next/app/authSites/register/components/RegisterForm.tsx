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
import BoxForm from "@/components/UIElements/BoxForm";

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
      router.push("/authSites/login");
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
    <BoxForm component="form" onSubmit={handleSubmit} sx={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {/* Überschrift über die volle Breite */}
      <Typography variant="h4" sx={{ gridColumn: "1 / -1", textAlign: "center", mb: 3 }}>
        Registrierung
      </Typography>

      {/* Vorname + Nachname nebeneinander */}
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

      {/* Email */}
      <TextField
        label="Email"
        name="email"
        type="email"
        fullWidth
        value={formData.email}
        onChange={handleChange}
        required
        sx={{ gridColumn: "1 / -1" }}
      />

      {/* Passwort */}
      <TextField
        label="Passwort"
        name="password"
        type="password"
        fullWidth
        value={formData.password}
        onChange={handleChange}
        required
        sx={{ gridColumn: "1 / -1" }}
      />

      {/* Straße + Hausnummer nebeneinander */}
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

      {/* PLZ + Ort nebeneinander */}
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

      {/* Land */}
      <TextField
        select
        label="Land"
        name="country"
        fullWidth
        value={formData.country}
        onChange={handleChange}
        required
        sx={{ gridColumn: "1 / -1" }}
      >
        {countries.map((country) => (
          <MenuItem key={country} value={country}>
            {country}
          </MenuItem>
        ))}
      </TextField>

      {/* User Art */}
      <TextField
        select
        label="User Art"
        name="type"
        fullWidth
        value={formData.type}
        onChange={handleChange}
        required
        sx={{ gridColumn: "1 / -1" }}
      >
        {userTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      {/* Fehleranzeige */}
      {error && (
        <Typography color="error" variant="body2" sx={{ gridColumn: "1 / -1", mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Submit Button */}
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
        Registrieren
      </Button>
    </BoxForm>
  </Box>
  );
}