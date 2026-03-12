"use client";

import { useState } from "react";
import { Box, Divider, TextField, Button, MenuItem, FormControl, InputLabel, Typography, Select, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../lib/api";
import { v4 as uuidv4 } from "uuid";

const materials = ["Holz", "Metall", "Kunststoff"];
const colors = ["Rot", "Blau", "Grün", "Schwarz", "Weiß"];
const categories = ["Dekoration", "Möbel", "Spielzeug"];

export default function ProductUpload() {

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    crowd: 0,
    minCrowd: 0,
    price: 0,
    deliverable: 0,
    deliverableAbroad: 0,
    material: "",
    color: "",
    category: ""
  });

  const handleChange = (event: any) => {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

   // Bilder im Frontend auswählen
const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  // Neue Dateinamen generieren: UUID + Datum + Originalendung
  const renamedFiles = files.map(file => {
    const ext = file.name.split('.').pop(); // z.B. "png"
    const newName = `${uuidv4()}-${Date.now()}.${ext}`;
    return new File([file], newName, { type: file.type });
  });

  // State aktualisieren
  setImages(prev => [...prev, ...renamedFiles]);

  // Vorschauen generieren
  const previews = renamedFiles.map(file => URL.createObjectURL(file));
  setImagePreviews(prev => [...prev, ...previews]);
};

  // Bild löschen
  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };
  // Submit – nur Dateinamen ans Backend
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    // Bilder zuerst in Next.js API hochladen
    const formDataObj = new FormData();
    images.forEach((file) => formDataObj.append("files", file));

    const uploadRes = await fetch("/api/save-images", {
      method: "POST",
      body: formDataObj
    });

    if (!uploadRes.ok) throw new Error("Bilder konnten nicht gespeichert werden");

    const uploadData = await uploadRes.json();
    const savedFiles: string[] = uploadData.savedFiles;

    // Backend-Call an NestJS
    const payload = { ...formData, images: savedFiles };
    await api.post("/products/createproduct", payload);

    // Reset UI bei Erfolg
    setImages([]);
    setImagePreviews([]);
    setCurrentIndex(0);
    alert("Produkt und Bilder erfolgreich gespeichert!");

  } catch (err: any) {
    console.error(err);

    // Rollback: Wenn Backend fehlschlägt, Bilder wieder löschen
    if (images.length > 0) {
      try {
        await fetch("/api/delete-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: images.map(f => f.name) })
        });
      } catch (delErr) {
        console.error("Fehler beim Löschen der Bilder nach Backend-Fehler:", delErr);
      }
    }

    setError(err.response?.data?.message || err.message || "Fehler beim Speichern");
  }
};

  return (
    <Box
  component="form"
  onSubmit={handleSubmit}
  sx={{
    width: "100%",
    maxWidth: "1600px",
    mx: "auto",
    p: 2,
    display: "grid",
    gap: 2,
    gridTemplateColumns: "repeat(2, 1fr)", // 2 Spalten für nebeneinander-Felder
  }}
>
  {/* ---------------- Name ---------------- */}
  <TextField label="Name" name="name" fullWidth onChange={handleChange} sx={{ gridColumn: "1 / -1" }} />

  {/* ---------------- Beschreibung (Textarea) ---------------- */}
  <TextField
    label="Beschreibung"
    name="description"
    multiline
    rows={4}
    fullWidth
    sx={{ gridColumn: "1 / -1" }}
    onChange={handleChange}
  />

  {/* ---------------- Crowd-Bereich (2x2) ---------------- */}
  <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Crowd Angaben</Divider>
  <TextField label="Crowd" name="crowd" type="number" fullWidth onChange={handleChange} />
  <TextField label="Min Crowd" name="minCrowd" type="number" fullWidth onChange={handleChange} />
  <TextField label="Deliverable" name="deliverable" type="number" fullWidth onChange={handleChange} />
  <TextField label="Deliverable Abroad" name="deliverableAbroad" type="number" fullWidth onChange={handleChange} />

  {/* ---------------- Material / Color / Category ---------------- */}
  <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Eigenschaften</Divider>
  <FormControl fullWidth>
    <InputLabel>Material</InputLabel>
    <Select name="material" onChange={handleChange}>
      {materials.map((m) => (
        <MenuItem key={m} value={m}>{m}</MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl fullWidth>
    <InputLabel>Color</InputLabel>
    <Select name="color" onChange={handleChange}>
      {colors.map((c) => (
        <MenuItem key={c} value={c}>{c}</MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl fullWidth>
    <InputLabel>Category</InputLabel>
    <Select name="category" onChange={handleChange}>
      {categories.map((cat) => (
        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
      ))}
    </Select>
  </FormControl>

  {/* ---------------- Preis ---------------- */}
  <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Preis</Divider>
  <TextField
    label="Preis"
    name="price"
    type="number"
    fullWidth
    sx={{ gridColumn: "1 / -1" }}
    onChange={handleChange}
    slotProps={{ htmlInput: { step: "0.01", inputMode: "decimal" } }}
  />

  {/* ---------------- Bilder Upload ---------------- */}
  <Divider sx={{ gridColumn: "1 / -1", mt: 2, mb: 1 }}>Bilder</Divider>
  <Box sx={{ gridColumn: "1 / -1" }}>
    <Button variant="contained" component="label" fullWidth>
      Bilder auswählen
      <input hidden type="file" multiple onChange={handleImageSelect} />
    </Button>
  </Box>

  {/* Slider / Vorschau – volle Breite */}
  {imagePreviews.length > 0 && (
    <Box sx={{ gridColumn: "1 / -1", position: "relative", height: "200px", border: "1px solid #ccc", borderRadius: 2 }}>
      <img
        src={imagePreviews[currentIndex]}
        style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", display: "block", margin: "auto" }}
      />
      <IconButton
        onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
        sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton
        onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, imagePreviews.length - 1))}
        sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
      <IconButton
        onClick={() => handleDeleteImage(currentIndex)}
        sx={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  )}

  {/* Fehleranzeige */}
  {error && (
    <Typography color="error" variant="body2" sx={{ gridColumn: "1 / -1" }}>
      {error}
    </Typography>
  )}

  {/* Submit Button */}
  <Box sx={{ gridColumn: "1 / -1" }}>
    <Button type="submit" variant="contained" fullWidth>
      Produkt erstellen
    </Button>
  </Box>
</Box>
  );
}