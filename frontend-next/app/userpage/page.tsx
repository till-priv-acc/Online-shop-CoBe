// /app/userpage/page.tsx
import LogoutButton from "../../components/LogoutButton"; // Client Component
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box } from "@mui/material";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("userId");

  if (!tokenCookie) {
    redirect("/login");
  }

  const userId = tokenCookie.value;

  return (
    <Box sx={{ padding: 4 }}>
      <h1>Profil</h1>
      <p>Nur für eingeloggte Benutzer sichtbar</p>
      <p>Deine UserID: {userId}</p>
      <LogoutButton />
    </Box>
  );
}