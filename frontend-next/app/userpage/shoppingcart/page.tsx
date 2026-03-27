'use client';

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { Add, Remove, Delete} from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import { api } from "@/lib/api";
import NavbarLong from "@/components/navbar/NavbarLong";
import HeaderPicture from "@/components/UIElements/HeaderPicture";
import BoxContent from "@/components/UIElements/BoxContent";
import { InvoiceCompleteDTO } from "@/constants/invoiceConstants";
import { UserRole } from "@/constants/userConstants";

export default function MyShoppingcartPage() {
  const router = useRouter();

  // Toast-Zustände
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };
  const handleToastClose = () => setToastOpen(false);

  // SWR Fetcher für Session + Shoppingcart
  const fetcher = async (): Promise<{
    invoice: InvoiceCompleteDTO;
    userRole: UserRole;
    userId: string;
  } | null> => {
    const check = await api.get('/users/check-session');
    if (!check.data.loggedIn) {
      router.push('/authSites/login');
      return null;
    }

    const userId: string = check.data.userId || '';
    const userRole: UserRole = check.data.role;

    const res = await api.get<InvoiceCompleteDTO>(`/invoices/shoppingcart/${userId}`);
    return { invoice: res.data, userRole, userId };
  };

  const { data, error, isLoading, mutate } = useSWR('/shoppingcart', fetcher);

  if (isLoading) return <CircularProgress sx={{ mt: 4, display: "block", mx: "auto" }} />;
  if (error) return (
    <BoxContent>
      <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 4 }}>
        Fehler beim Laden des Warenkorbs
      </Typography>
    </BoxContent>
  );
  if (!data) return null;

  const { invoice, userRole, userId } = data;

  // Warenkorb-Logik
  const updateQuantity = async (itemProductId: string | null, newQuantity: number, invoiceId: string, cartId: string) => {
    try {
      if (!itemProductId) {
        await api.delete(`/invoices/cartItem/${cartId}`);
        showToast("Item entfernt, nicht mehr im Sortiment");
        mutate();
      } else {
        await api.patch('/invoices/updateItemQuantity', {
          invoiceId: invoiceId,
          productId: itemProductId,
          quantity: newQuantity,
        });
        showToast("Menge aktualisiert");
        mutate();
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Menge", err);
      showToast("Fehler beim Ändern der Menge");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/invoices/cartItem/${itemId}`);
      showToast("Item entfernt");
      mutate();
    } catch (err) {
      console.error("Fehler beim Entfernen des Items", err);
      showToast("Fehler beim Entfernen des Items");
    }
  };

  const goToDetail = async (productId: string | null, itemId: string) => {
    try {
      if(productId) {
        router.push(`/product/${productId}`)
      } else {
        await api.delete(`/invoices/cartItem/${itemId}`);
        showToast("Item entfernt");
        mutate();
      }
    } catch (err) {
      console.error("Fehler beim weiterleiten zum Produkt", err);
      showToast("Fehler beim weiterleiten zum Produkt");
    }
  };

  const purchaseInvoice = async () => {
    if (!invoice) return;
    try {
      await api.patch(`/invoices/buyShoppingcart/${invoice.id}`);
      showToast("Waren gekauft");
      router.push("/product");
    } catch (err) {
      console.error("Fehler beim Kauf", err);
      showToast("Fehler beim Kauf");
    }
  };

  return (
  <Box sx={{ width: '100%' }}>
    {/* Header-Bild 100% */}
    <HeaderPicture headerPic="/images/shoppingcart.png" />

    {/* NavbarLong */}
    {userRole && <NavbarLong userRole={userRole} currentPath="/userpage/shoppingcart" />}

    {/* Hauptinhalt */}
    <BoxContent>

      {/* Artikel-Box */}
      <Box
        sx={{
          width: '70%',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: '#fff',
          alignItems: 'center',
        }}
      >

      <Box sx={{ textAlign: "center", mb: 3, width: "100%" }}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Mein Warenkorb
        </Typography>
      </Box>
        {invoice && invoice.invoiceItems.map((item) => {
          const imageSrc: string = item.productPicture
            ? `/product-images/${item.productPicture}`
            : `/images/placeholder.png`;

          const altText: string = item.productName ?? "product image";

          return (
            <Card
              key={item.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                p: 2,
                borderRadius: 2,
                boxShadow: 2,
                gap: 2
              }}
            >
              {/* 🔥 Bild */}
              <Box
                component="img"
                src={imageSrc}
                alt={altText}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = '/images/placeholder.png';
                }}
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 2
                }}
              />

              {/* 🔹 Content */}
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">{item.productName}</Typography>
                <Typography color="text.secondary">
                  Verkäufer: {item.seller ?? "Unknown"}
                </Typography>
                <Typography color="text.secondary">
                  Preis: €{item.productPrice?.toFixed(2)}
                </Typography>
              </CardContent>

              {/* 🔹 Actions */}
              <CardActions>
                <IconButton onClick={() =>
                  updateQuantity(item.productId ?? null, item.quantity - 1, invoice.id, item.id)
                }>
                  <Remove />
                </IconButton>

                <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>

                <IconButton onClick={() =>
                  updateQuantity(item.productId ?? null, item.quantity + 1, invoice.id, item.id)
                }>
                  <Add />
                </IconButton>

                <IconButton color="error" onClick={() => removeItem(item.id)}>
                  <Delete />
                </IconButton>
                <IconButton color="primary" onClick={() => goToDetail(item.productId ?? null, item.id)}>
                  <SearchIcon />
                </IconButton>
              </CardActions>
            </Card>
          );
        })}

        {invoice && invoice.invoiceItems.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            Dein Warenkorb ist leer
          </Typography>
        )}

        {/* Gesamtsumme & Kaufen-Box */}
        {invoice && invoice.invoiceItems.length > 0 && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#f5f5f5',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h6">Gesamtsumme</Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#052d65' }}>
              ${invoice.invoiceItems.reduce((sum, item) => sum + (item.productPrice ?? 0) * item.quantity, 0).toFixed(2)}
            </Typography>
            <Button variant="contained" color="primary" onClick={purchaseInvoice} fullWidth>
              Waren kaufen
            </Button>
          </Box>
        )}
      </Box>
    </BoxContent>

    {/* Toast */}
    <Snackbar
      open={toastOpen}
      autoHideDuration={3000}
      onClose={handleToastClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleToastClose} severity="success" sx={{ width: "100%" }}>
        {toastMessage}
      </Alert>
    </Snackbar>
  </Box>
);
}