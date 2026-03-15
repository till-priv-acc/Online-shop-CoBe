"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
  Divider,
  MenuItem,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { prodouctCategories, productColors, productMaterials } from "@/constants";

interface ProductUpdateModalProps {
  initialData: {
    name: string;
    description: string;
    crowd: number;
    minCrowd: number;
    price: number;
    deliverable: number;
    deliverableAbroad: number;
    material: string;
    color: string;
    category: string;
  };
  onSuccess?: () => void;
}

export default function ProductUpdate({ initialData, onSuccess }: ProductUpdateModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [crowd, setCrowd] = useState(initialData.crowd);
  const [minCrowd, setMinCrowd] = useState(initialData.minCrowd);
  const [price, setPrice] = useState(initialData.price);
  const [deliverable, setDelideliverable] = useState(initialData.deliverable);
  const [deliverableAbroad, setDeliverableAbroad] = useState(initialData.deliverableAbroad);
  const [material, setMaterial] = useState(initialData.material);
  const [color, setColor] = useState(initialData.color);
  const [category, setCategory] = useState(initialData.category);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wenn sich initialData ändert, Felder aktualisieren
  useEffect(() => {
    setName(initialData.name);
    setDescription(initialData.description);
    setCrowd(initialData.crowd);
    setMinCrowd(initialData.minCrowd);
    setPrice(initialData.price);
    setDelideliverable(initialData.deliverable);
    setDeliverableAbroad(initialData.deliverableAbroad);
    setMaterial(initialData.material);
    setColor(initialData.color);
    setCategory(initialData.category);
  }, [initialData]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
    await api.patch("/products/updateProductData", {
      name,
      description,
      crowd,
      minCrowd,
      price,
      deliverable,
      deliverableAbroad,
      material,
      color,
      category,
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

  const materials = productMaterials;
  const colors = productColors;
  const categories = prodouctCategories;


  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: "primary.main",
          color: "white",
          borderRadius: "10px",
          padding: "8px",
          boxShadow: 2,
          transition: "all 0.2s ease",

          "&:hover": {
            backgroundColor: "primary.dark",
            transform: "scale(1.05)",
            boxShadow: 4,
          },
        }}
      >
        <Edit />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Produktdaten ändern</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* ---------------- Name ---------------- */}
              <TextField label="Name" name="name" fullWidth onChange={(e) => setName(e.target.value)} sx={{ gridColumn: "1 / -1" }} />
            
              {/* ---------------- Beschreibung (Textarea) ---------------- */}
              <TextField
                label="Beschreibung"
                name="description"
                multiline
                rows={4}
                fullWidth
                sx={{ gridColumn: "1 / -1" }}
                onChange={(e) => setDescription(e.target.value)}
              />
            
              {/* ---------------- Crowd-Bereich (2x2) ---------------- */}
              <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Verfügbarkeit und Versand</Divider>
              <TextField label="Crowd" name="crowd" type="number" fullWidth onChange={(e) => setCrowd(Number(e.target.value))} />
              <TextField label="Min Crowd" name="minCrowd" type="number" fullWidth onChange={(e) => setMinCrowd(Number(e.target.value))} />
              <TextField label="Deliverable" name="deliverable" type="number" fullWidth onChange={(e) => setDelideliverable(Number(e.target.value))} />
              <TextField label="Deliverable Abroad" name="deliverableAbroad" type="number" fullWidth onChange={(e) => setDeliverableAbroad(Number(e.target.value))} />
            
              {/* ---------------- Material / Color / Category ---------------- */}
              <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Eigenschaften</Divider>
              <TextField
                  select
                  label="Land"
                  fullWidth
                  value={materials}
                  onChange={(e) => setMaterial(e.target.value)}
                  >
                  {materials.map((c) => (
                      <MenuItem key={c} value={c}>
                      {c}
                      </MenuItem>
                  ))}
              </TextField>
            
              <TextField
                  select
                  label="Land"
                  fullWidth
                  value={colors}
                  onChange={(e) => setColor(e.target.value)}
                  >
                  {colors.map((c) => (
                      <MenuItem key={c} value={c}>
                      {c}
                      </MenuItem>
                  ))}
              </TextField>
            
              <TextField
                  select
                  label="Land"
                  fullWidth
                  value={categories}
                  onChange={(e) => setCategory(e.target.value)}
                  >
                  {categories.map((c) => (
                      <MenuItem key={c} value={c}>
                      {c}
                      </MenuItem>
                  ))}
              </TextField>
            
              {/* ---------------- Preis ---------------- */}
              <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Preis</Divider>
              <TextField
                label="Preis"
                name="price"
                type="number"
                fullWidth
                sx={{ gridColumn: "1 / -1" }}
                onChange={(e) => setPrice(Number(e.target.value))}
                slotProps={{ htmlInput: { step: "0.01", inputMode: "decimal" } }}
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