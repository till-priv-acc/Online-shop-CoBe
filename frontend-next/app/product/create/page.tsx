"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import {api} from "@/lib/api";
import ProductUpload from "@/components/productmanagement/ProductUpload";

export default function ProductPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSeller = async () => {
      try {
        await api.get("/users/check-seller");
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "response" in err) {
          const error = err as { response?: { status?: number } };

          if (error.response?.status === 403) {
            router.push("/userpage");
            return;
          }
        }

        console.error("Seller Check fehlgeschlagen", err);
      }
    };

    checkSeller();
  }, [router]);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header-Bild, volle Breite */}
      <Box
        sx={{
          width: "100%",
          height: 220,
          borderRadius: 0,
          backgroundImage: `url("/images/product-create.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mb: 6,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      />

      {/* Container für ProductUpload, zentriert */}
      <Box
        sx={{
          width: "70%",
          margin: "0 auto",
        }}
      >
        <ProductUpload />
      </Box>
    </Box>
  );
}