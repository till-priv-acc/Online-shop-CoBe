'use client';

import { Box, IconButton, Typography, Button } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Props = {
  productId: string;
  maxQuantity?: number;
  onError?: (message: string) => void;
  onSuccess?: () => void;
};

export default function AddToCart({
  productId,
  maxQuantity,
  onError,
  onSuccess
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const increase = () => {
    setQuantity((q) => {
      if (maxQuantity && q >= maxQuantity) return q;
      return q + 1;
    });
  };

  const decrease = () => {
    setQuantity((q) => (q > 1 ? q - 1 : q));
  };

  const handleSubmit = async () => {
    try {
        await api.post("/invoices/addItemToCart", {
        productId,
        quantity,
        });

        // onSuccess Callback (z.B. Toast in Parent)
        await onSuccess?.();

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigation direkt danach
        router.push("/product");

    } catch (err: any) {
        const message = err?.response?.data?.message || "Fehler beim Hinzufügen";
        onError?.(message);
    }
    };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
    {/* Icons für Menge */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={decrease}>
        <Remove />
        </IconButton>

        <Typography>{quantity}</Typography>

        <IconButton onClick={increase}>
        <Add />
        </IconButton>
    </Box>

    {/* Button darunter */}
    <Button variant="contained" onClick={handleSubmit}>
        In den Warenkorb
    </Button>
    </Box>
    );
}