"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  MenuItem
} from "@mui/material";
import { allCountries } from "@/constants/userConstants";

interface UpdateUserDataModalProps {
  initialData: {
    name: string;
    firstname: string;
    hNumber: string;
    street: string;
    town: string;
    pCode: string;
    country: string;
  };
  onSuccess?: () => void;
}

export default function UpdateUserDataModal({ initialData, onSuccess }: UpdateUserDataModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [firstname, setFirstname] = useState(initialData.firstname);
  const [street, setStreet] = useState(initialData.street);
  const [town, setTown] = useState(initialData.town);
  const [pCode, setPCode] = useState(initialData.pCode);
  const [hNumber, setHNumber] = useState(initialData.hNumber);
  const [country, setCountry] = useState(initialData.country);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wenn sich initialData ändert, Felder aktualisieren
  useEffect(() => {
    setName(initialData.name);
    setFirstname(initialData.firstname);
    setHNumber(initialData.hNumber);
    setStreet(initialData.street);
    setTown(initialData.town);
    setPCode(initialData.pCode);
    setCountry(initialData.country);
  }, [initialData]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
    await api.patch("/users/updateUserData", {
      name,
      firstname,
      hNumber,
      street,
      town,
      pCode,
      country,
    });

    // Optional: direkt Userdaten refetchen
    if (onSuccess) await onSuccess();

    setSuccess("Daten wurden erfolgreich aktualisiert!");
    setOpen(false);

  } catch (err: any) {
    setError(err.response?.data?.message || "Update fehlgeschlagen");
  } finally {
    setLoading(false);
  }
  };

  const countries = allCountries;

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Daten ändern
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Daten ändern</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Vorname" fullWidth value={firstname} onChange={(e) => setFirstname(e.target.value)} />
            <TextField label="Hausnummer" fullWidth value={hNumber} onChange={(e) => setHNumber(e.target.value)} />
            <TextField label="Straße" fullWidth value={street} onChange={(e) => setStreet(e.target.value)} />
            <TextField label="Stadt" fullWidth value={town} onChange={(e) => setTown(e.target.value)} />
            <TextField label="PLZ" fullWidth value={pCode} onChange={(e) => setPCode(e.target.value)} />
            <TextField
                select
                label="Land"
                fullWidth
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                >
                {countries.map((c) => (
                    <MenuItem key={c} value={c}>
                    {c}
                    </MenuItem>
                ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}