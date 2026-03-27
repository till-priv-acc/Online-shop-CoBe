'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddShoppingCartOutlined } from '@mui/icons-material';
import {api} from '@/lib/api'; // dein Axios/Api Instance
import { useRouter } from 'next/navigation';
import { UserRole } from '@/constants/userConstants';
import { AllProducts } from '@/constants/productConstants';
import NavbarLong from '@/components/navbar/NavbarLong';
import BoxContent from '@/components/UIElements/BoxContent';
import HeaderPicture from '@/components/UIElements/HeaderPicture';
import ToastMesssage from '@/components/UIElements/ToastMessage';

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<AllProducts[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  const showToast = (message: string, severity: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => setToastOpen(false);

  useEffect(() => {
    const init = async () => {
      try {
        const check = await api.get("/users/check-session");

        if (!check.data.loggedIn) {
          router.push("/authSites/login");
          return;
        }
        // UserRole direkt aus check-session
        setUserRole(check.data.role);

        const res = await api.get<AllProducts[]>("products/allProducts");
        setProducts(res.data);

        res.data.forEach((p) =>
          console.log("Bildname:", p.pictures ?? "Kein Bild")
        );
      } catch (err) {
        if (typeof err === "object" && err !== null && "response" in err) {
          const error = err as { response?: { status?: number } };

          if (error.response?.status === 401) {
            router.push("/authSites/login");
            return;
          }
        }
        console.error("Fehler beim Laden der Produkte", err);
      }
    };

    init();
  }, []);

  const addToCart = async (id: string, name: string) => {
    try {
      const res = await api.post("/invoices/addItemToCart", {
        productId: id,
        quantity: 1,
      });

      // Direkt die message nutzen
      showToast(res.data.message); // z.B. "Item added successfully to Invoice"
    } catch (err: any) {
      console.error("Fehler beim Hinzufügen zum Warenkorb", err);
      showToast("Fehler beim Hinzufügen zum Warenkorb");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
    {/* Header */}

    <HeaderPicture headerPic="/images/product-page.png" />

    {userRole && <NavbarLong userRole={userRole} currentPath="/product" />}

      {/* 100%-Container zentriert */}
      <BoxContent>
        {products.map((product) => {
          const imagePath = product.pictures
            ? `/product-images/${product.pictures}`
            : "/images/placeholder.png";

          return (
            <Card
              key={product.id}
              sx={{
                width: 250,
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={imagePath}
                alt={product.name}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />

              {/* Lupen-Button oben rechts */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                }}
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <SearchIcon />
              </IconButton>
              {/* Add to Cart Button direkt darunter */}
              <IconButton
                sx={{
                  position: "absolute",
                  top: 48, // Abstand unterhalb des Lupen-Buttons
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                }}
                onClick={() => addToCart(product.id, product.name)}
              >
                <AddShoppingCartOutlined />
              </IconButton>

              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Verkäufer: {product.createFrom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Kategorie: {product.category}
                </Typography>
                <Typography variant="body1">Preis: €{product.price}</Typography>
                <Typography
                  variant="body2"
                  color={product.isAvailible ? "green" : "red"}
                >
                  {product.isAvailible ? "Verfügbar" : "Nicht verfügbar"}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </BoxContent>
      <ToastMesssage
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={handleToastClose}
      />
    </Box>

  );
};

export default ProductsPage;