"use client";

import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { 
  Box, Typography, Divider, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, 
  IconButton, TextField, MenuItem, Snackbar, Alert 
} from "@mui/material";
import { AdminPanelSettings, Person, ArrowUpward, ArrowDownward, Store } from "@mui/icons-material";
import { UserAcc } from "@/constants";

// Mapping: type → Icon-Komponente
const roleIcons = {
  USER: Person,
  ADMIN: AdminPanelSettings,
  SELLER: Store,
};

export default function AdminUserTable() {
  const { data: users, mutate, isLoading } = useSWR<UserAcc[]>("/users/allUsers", async () => {
    const res = await api.get("/users/allUsers");
    return res.data;
  });

  const availableCountries = Array.from(
    new Set(users?.map(u => u.country).filter(Boolean))
  ).sort();

  const [countryFilter, setCountryFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"id" | "lastname" | "country">("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");

  const handleRoleChange = async (userId: string, newType: 'USER' | 'ADMIN' | 'SELLER') => {
  try {
    await api.patch("/users/updateUserRole", { userId, type: newType });
    // lokal mutieren, damit die Tabelle direkt aktualisiert wird
    mutate(users => users?.map(u => u.id === userId ? { ...u, type: newType } : u), false);
    setAlertMessage("Rolle erfolgreich geändert!");
    setAlertSeverity("success");
    setAlertOpen(true);
  } catch (err: any) {
    console.error("Fehler beim Ändern der Rolle", err);
    setAlertMessage(err.response?.data?.message || "Fehler beim Ändern der Rolle");
    setAlertSeverity("error");
    setAlertOpen(true);
  }
};

  if (isLoading) return (
    <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <CircularProgress />
    </Box>
  );

  // -------------------
  // Filter & Sortierung
  // -------------------
  let displayedUsers = users ?? [];

  if (countryFilter) displayedUsers = displayedUsers.filter(u => u.country === countryFilter);
  if (roleFilter) displayedUsers = displayedUsers.filter(u => u.type === roleFilter.toUpperCase());

  displayedUsers = [...displayedUsers].sort((a, b) => {
    let valA: string = "";
    let valB: string = "";

    switch (sortBy) {
      case "lastname":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "country":
        valA = a.country.toLowerCase();
        valB = b.country.toLowerCase();
        break;
      case "id":
        valA = a.id;
        valB = b.id;
        break;
      default:
        return 0;
    }

    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, p: 4, borderRadius: 3, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width:"100%" }}>
      <Typography variant="h6">Alle User</Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Filter */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          select
          label="Land filtern"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Alle</MenuItem>
          {availableCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>

        <TextField
          select
          label="Rolle filtern"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Alle</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="User">User</MenuItem>
        </TextField>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell
            sx={{ cursor: "pointer" }}
            onClick={() => {
                setSortBy("id");
                setSortAsc(sortBy === "id" ? !sortAsc : true); // toggeln wie bei Name/Land
            }}
            >
            User-ID
            <ArrowUpward fontSize="small" color={sortBy === "id" && sortAsc ? "primary" : "disabled"} />
            <ArrowDownward fontSize="small" color={sortBy === "id" && !sortAsc ? "primary" : "disabled"} />
            </TableCell>

            <TableCell>Rolle</TableCell>

            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => { setSortBy("lastname"); setSortAsc(sortBy === "lastname" ? !sortAsc : true); }}
            >
              Name
              <ArrowUpward fontSize="small" color={sortBy === "lastname" && sortAsc ? "primary" : "disabled"} />
              <ArrowDownward fontSize="small" color={sortBy === "lastname" && !sortAsc ? "primary" : "disabled"} />
            </TableCell>

            <TableCell>Email</TableCell>
            <TableCell>Adresse</TableCell>

            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => { setSortBy("country"); setSortAsc(sortBy === "country" ? !sortAsc : true); }}
            >
              Land
              <ArrowUpward fontSize="small" color={sortBy === "country" && sortAsc ? "primary" : "disabled"} />
              <ArrowDownward fontSize="small" color={sortBy === "country" && !sortAsc ? "primary" : "disabled"} />
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {displayedUsers.map(u => (
            <TableRow key={u.id} hover sx={{ borderBottom: "1px solid #eee" }}>
              <TableCell>{u.id}</TableCell>
              <TableCell>
                {(['USER', 'ADMIN', 'SELLER'] as const).map((role) => {
                  const IconComp = roleIcons[role];
                  const isActive = u.type === role;

                  return (
                    <IconButton
                      key={role}
                      onClick={() => handleRoleChange(u.id, role)}
                      sx={{
                        color: isActive ? 'success.main' : 'action.active', // grün, wenn aktiv
                      }}
                    >
                      <IconComp />
                    </IconButton>
                  );
                })}
              </TableCell>
              <TableCell>{u.name}, {u.firstname}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{`${u.street} ${u.hNumber}, ${u.pCode} ${u.town}`}</TableCell>
              <TableCell>{u.country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={alertSeverity} onClose={() => setAlertOpen(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}