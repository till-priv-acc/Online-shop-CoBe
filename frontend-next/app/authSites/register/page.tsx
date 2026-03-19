'use client';

import RegisterForm from "./components/RegisterForm";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const fetcher = async (): Promise<void> => {
      const check = await api.get('/users/check-session');
      if (check.data.loggedIn) {
        router.push('/userpage');
      }
    };

  fetcher();

  return <RegisterForm />;
}