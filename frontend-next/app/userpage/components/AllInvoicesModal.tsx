"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Invoice } from "@/constants/invoiceConstants";
import { useRouter } from 'next/navigation';

import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";

interface AllInvoicesModalProps {
  userId: string;
}

export default function AllInvoicesModal({
  userId,
}: AllInvoicesModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/invoices/allInvoicesUser/${userId}`);

        setInvoices(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Rechnungen konnten nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadInvoices();
    }
  }, [userId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 4,
        borderRadius: 3,
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: 300,
        width: "100%",
      }}
    >
      <Typography variant="h6">Rechnungen</Typography>

      <Divider sx={{ mb: 2 }} />

      {invoices.length === 0 && (
        <Typography color="text.secondary">
          Keine Rechnungen vorhanden.
        </Typography>
      )}

      {invoices.map((invoice) => (
        <Box
          key={invoice.id}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid #ddd",
            background: "#fafafa",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            transition: "0.2s",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push(`/invoices/${invoice.id}`)}
          >
            <strong>ID:</strong> {invoice.id}
          </Typography>

          <Typography variant="body1" color="primary">
            <strong>Betrag:</strong>{" "}
            {invoice.totalPrice != null
                ? `${invoice.totalPrice.toFixed(2)} €`
                : "Kein Betrag"}
            </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Gekauft am:</strong>{" "}
            {new Date(invoice.purchasedAt).toLocaleDateString("de-DE")}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}