"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import {api} from "@/lib/api";
import ProductUpload from "./components/ProductUpload";
import { UserRole } from "@/constants/userConstants";
import NavbarLong from "@/components/navbar/NavbarLong";
import HeaderPicture from "@/components/UIElements/HeaderPicture";

export default function ProductCreatePage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const router = useRouter();

  useEffect(() => {
    const checkSeller = async () => {
      try {
        const check = await api.get("/users/check-session");
        
        if (!check.data.loggedIn) {
          router.push("/authSites/login");
          return;
        }
        // UserRole direkt aus check-session
        setUserRole(check.data.role);
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "response" in err) {
          const error = err as { response?: { status?: number } };

          if (error.response?.status === 403) {
            router.push("/product");
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

      <HeaderPicture headerPic="/images/product-create.png" />

      {userRole && <NavbarLong userRole={userRole} currentPath="/product/create" />}

      {/* Container für ProductUpload, zentriert */}
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
        }}
      >
        <ProductUpload />
      </Box>
    </Box>
  );
}