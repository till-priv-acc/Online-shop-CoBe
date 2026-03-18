"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface ProductDeleteModalProps {
  productID: string;
  productName: string;
  productPics: string[];
}

export default function ProductDelete({ productID, productName, productPics }: ProductDeleteModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
    await api.delete(`/products/product/${productID}`);

    if (productPics.length > 0) {
    await fetch("/api/delete-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: productPics }),
    });
    }

    setSuccess("Produkt wurde erfolgreich gelöscht!");
    setOpen(false);
    router.push("/product");

  } catch (err: any) {
    setError(err.response?.data?.message || "Update fehlgeschlagen");
  } finally {
    setLoading(false);
  }
  };


  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: "error.main",
          color: "white",
          borderRadius: "10px",
          padding: "8px",
          boxShadow: 2,
          transition: "all 0.2s ease",

          "&:hover": {
            backgroundColor: "error.dark",
            transform: "scale(1.05)",
            boxShadow: 4,
          },
        }}
      >
        <Delete />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Produkt Löschen</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Typography>
            Möchten Sie wirklich das Produkt "{productName}" löschen?
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Abbrechen
          </Button>
          <Button variant="contained" color="error" onClick={handleSubmit} disabled={loading}>
            Löschen
            </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}