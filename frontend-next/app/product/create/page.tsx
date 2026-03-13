"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {api} from "@/lib/api";
import ProductUpload from "@/components/ProductUpload";

export default function ProductPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSeller = async () => {
      try {
        await api.get("/users/check-seller");
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "response" in err) {
          const error = err as { response?: { status?: number } };

          if (error.response?.status === 401) {
            router.push("/userpage");
            return;
          }
        }

        console.error("Seller Check fehlgeschlagen", err);
      }
    };

    checkSeller();
  }, [router]);

  return <ProductUpload />;
}