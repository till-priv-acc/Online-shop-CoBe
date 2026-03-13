'use client';

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";
import PasswordChangeButtonModal from "@/components/PasswordChangeModal";
import UpdateUserDataModal from "@/components/UpdateUserDataModal";
import AdminUserTable from "@/components/AdminUserTable";
import { Box, Typography, Divider, CircularProgress } from "@mui/material";
import { api } from "../../lib/api";
import { UserAcc } from "@/constants";

interface Invoice {
  id: string;
  number: string;
  amount: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [invoices] = useState<Invoice[]>([
    { id: "1", number: "INV-001", amount: "150€" },
    { id: "2", number: "INV-002", amount: "250€" },
    { id: "3", number: "INV-003", amount: "99€" },
  ]);

  const { data: user, mutate } = useSWR<UserAcc>("/users/me", async () => {
    const check = await api.get("/users/check-session");
    if (!check.data.loggedIn) {
      router.push("/login");
      return null;
    }
    const res = await api.get("/users/me");
    return res.data;
  });

  const headerImage = error ? "/images/pb-error.png" : "/images/pb-success.png";

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          height: 220,
          borderRadius: 0,
          backgroundImage: `url("${headerImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mb: 6,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      />

      {error && (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom color="error">
            Fehler
          </Typography>
          <Typography>{error}</Typography>
          <LogoutButton />
        </Box>
      )}

      {!user && !error && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
          <CircularProgress />
        </Box>
      )}

      {user && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {/* Haupt-Container: 70% der RootLayout-Breite */}
          <Box
            sx={{
              width: "70%",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* Linke und rechte Box */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 6,
                width: "100%",
              }}
            >
              {/* Linke Box */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 4,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #f9f9f9, #e8e8e8)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  minWidth: 300,
                }}
              >
                <Box
                  component="img"
                  src={`/images/${user.type}-profile.png`}
                  alt="Profilbild"
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    mb: 4,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                  }}
                />

                {/* Allgemeine Infos */}
                <Box sx={{ width: "100%", mb: 4, background: "#fff", p: 3, borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <Typography variant="h6" mb={2} sx={{ borderBottom: "1px solid #eee", pb: 1 }}>
                    Allgemeine Infos
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.firstname} {user.name}</Typography>

                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.email}</Typography>

                    <Typography variant="body2" color="text.secondary">UserID:</Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ wordBreak: "break-all", color: "#119a21" }}>
                      {user.id}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">Rolle:</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.type}</Typography>
                  </Box>
                </Box>

                {/* Adresse */}
                <Box sx={{ width: "100%", mb: 4, background: "#fff", p: 3, borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <Typography variant="h6" mb={2} sx={{ borderBottom: "1px solid #eee", pb: 1 }}>Adresse</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Typography variant="body1" fontWeight={600}>{user.street} {user.hNumber}</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.pCode} {user.town}</Typography>
                    <Typography variant="body1" fontWeight={600}>{user.country}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  <LogoutButton />
                  <PasswordChangeButtonModal />
                  <UpdateUserDataModal initialData={user!} onSuccess={() => mutate()} />
                </Box>
              </Box>

              {/* Rechte Box */}
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
                  width: "100%", // sorgt dafür, dass Rechte Box immer volle Breite des Containers einnimmt
                }}
              >
                <Typography variant="h6">Rechnungen</Typography>
                <Divider sx={{ mb: 2 }} />

                {invoices.map((inv) => (
                  <Box
                    key={inv.id}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid #ddd",
                      background: "#fafafa",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}><strong>Rechnungsnr:</strong> {inv.number}</Typography>
                    <Typography variant="body1" color="primary"><strong>Betrag:</strong> {inv.amount}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* AdminUserTable: volle Breite wie die oberste Flex-Row */}
            {user.type === "ADMIN" && (
              <Box sx={{ mt: 4, width: "100%" }}>
                <AdminUserTable />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}