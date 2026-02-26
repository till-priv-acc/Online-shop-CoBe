"use client";

import { useState } from "react";
import { api } from "../lib/api";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack
} from "@mui/material";

export default function UpdateUserDataModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [street, setStreet] = useState("");
  const [town, setTown] = useState("");
  const [pCode, setPCode] = useState("");
  const [hNumber, setHNumber] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
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

    // Reset + schließen
    setName("");
    setFirstname("");
    setHNumber("");
    setStreet("");
    setTown("");
    setPCode("");
    setCountry("");
    setOpen(false);

  } catch (err: any) {
    setError(err.response?.data?.message || "Update fehlgeschlagen");
  } finally {
    setLoading(false);
  }
  };

  return (
    <>
      {/* Button zum Öffnen */}
      <Button variant="contained" onClick={() => setOpen(true)}>
        Daten ändern
      </Button>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Daten ändern</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Vorname"
              fullWidth
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <TextField
              label="Hausnummer"
              fullWidth
              value={hNumber}
              onChange={(e) => setHNumber(e.target.value)}
            />
            <TextField
              label="Straße"
              fullWidth
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            <TextField
              label="Stadt"
              fullWidth
              value={town}
              onChange={(e) => setTown(e.target.value)}
            />
            <TextField
              label="PLZ"
              fullWidth
              value={pCode}
              onChange={(e) => setPCode(e.target.value)}
            />
            <TextField
              label="Land"
              fullWidth
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
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