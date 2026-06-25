"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Box, CircularProgress, Typography } from "@mui/material";

import { api } from "@/lib/api";

import NavbarLong from "@/components/navbar/NavbarLong";
import HeaderPicture from "@/components/UIElements/HeaderPicture";
import BoxContent from "@/components/UIElements/BoxContent";
import AllInvoicesModal from "../components/AllInvoicesModal";

import { UserRole } from "@/constants/userConstants";

export default function ShoppingCartPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [UserID, setUserId] = useState<string | null>(null);

  useEffect(() => {
  const checkSession = async () => {
    try {
      const check = await api.get<{
        loggedIn: boolean;
        userId: string;
        role: UserRole;
      }>("/users/check-session");

      if (!check.data.loggedIn) {
        router.push("/authSites/login");
        return;
      }
      console.log("RAW SESSION DATA:", check.data);
      setUserId(check.data.userId);
      setUserRole(check.data.role);
    } catch (error) {
      router.push("/authSites/login");
    } finally {
      setLoading(false);
    }
  };

  checkSession();
}, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
  <Box sx={{ width: "100%" }}>
      <>
        <HeaderPicture headerPic="/images/invoices.png" />
        {userRole && (<NavbarLong userRole={userRole} currentPath="/userpage/myinvoices"/>)}

        <BoxContent>
            {UserID && (
          <Box
                sx={{
                width: "100%",
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                }}
            >
            <Box sx={{ textAlign: "center", mb: 3, width: "100%" }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Meine Rechnungen
                </Typography>
            </Box>

            <AllInvoicesModal userId={UserID} />
          </Box>
          )}
        </BoxContent>
      </>
  </Box>
);
}