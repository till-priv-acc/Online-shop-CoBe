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

export default function PasswordChangeButtonModal() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // neuer State
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null); // reset
    setLoading(true);

    try {
      await api.patch("/users/updatePassword", {
        currentPassword,
        newPassword,
      });

      // Passwort erfolgreich geändert
      setSuccess("Passwort wurde erfolgreich geändert!");

      // Reset Felder
      setCurrentPassword("");
      setNewPassword("");

      // Optional: Modal schließen nach kurzer Zeit
      setTimeout(() => setOpen(false), 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || "Passwort konnte nicht geändert werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button zum Öffnen */}
      <Button variant="contained" onClick={() => setOpen(true)}>
        Passwort ändern
      </Button>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Passwort ändern</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField
              label="Aktuelles Passwort"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <TextField
              label="Neues Passwort"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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