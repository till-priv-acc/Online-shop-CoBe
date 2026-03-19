"use client";

import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, useTheme } from "@mui/material";
import { AccountCircle, Inventory2, Add } from "@mui/icons-material";
import { useState } from "react";
import Link from "next/link";
import LogoutButton from "../auth/LogoutButton";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

type UserRole = "USER" | "SELLER" | "ADMIN";

interface NavbarProps { 
  userRole: UserRole;
  currentPath: string; // aktuelle Route
}

export default function NavbarLong({ userRole, currentPath }: NavbarProps) {
  const theme = useTheme();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [productMenuAnchor, setProductMenuAnchor] = useState<null | HTMLElement>(null);

  // Toggle User Menu
  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(userMenuAnchor ? null : event.currentTarget);
  };
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  // Toggle Product Menu
  const handleProductMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setProductMenuAnchor(productMenuAnchor ? null : event.currentTarget);
  };
  const handleProductMenuClose = () => setProductMenuAnchor(null);

  // Gemeinsame Styles für MenuItems
  const menuItemStyles = (isActive?: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    fontSize: "1.4rem",
    px: 2,
    py: 1,
    mb: 1,
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    "&:last-child": { mb: 0, borderBottom: "none" },
    backgroundColor: isActive ? "#000" : "transparent", // schwarz wenn aktiv
    color: isActive ? "#fff" : "#000", // Schriftfarbe weiß bei aktiv
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: "#fff",
    },
    transition: "all 0.2s ease",
  });

  const buttonStyles = {
    fontSize: "1.3rem",
    textTransform: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 1,
  };

  const iconStyles = {
    fontSize: "2rem",
    verticalAlign: "middle",
  };

  return (
    <AppBar position="static" sx={{ width: "100%", mb: 4, backgroundColor: theme.palette.primary.main }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" component={Link} href="/" sx={{ textDecoration: "none", color: "inherit" }}>
          MyShop
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* User Menu */}
          <Box>
            <Button onClick={handleUserMenuClick} sx={buttonStyles}>
              <AccountCircle sx={iconStyles} />
              User
            </Button>
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#fff",
                  borderRadius: 0,
                  boxShadow: theme.shadows[4],
                  mt: 0.5,
                  py: 0,
                },
              }}
            >
              <MenuItem component={Link} href="/userpage" onClick={handleUserMenuClose} sx={menuItemStyles(currentPath === "/userpage")}>
                <AccountCircle fontSize="medium" />
                Meine Daten
              </MenuItem>
              <MenuItem
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                  "&:last-child": { borderBottom: "none" },
                  px: 2, py: 1,
                }}
              >
                <LogoutButton />
              </MenuItem>
            </Menu>
          </Box>

          {/* Product Menu */}
          <Box>
            <Button onClick={handleProductMenuClick} sx={buttonStyles}>
              <Inventory2 sx={iconStyles} />
              Produkte
            </Button>
            <Menu
              anchorEl={productMenuAnchor}
              open={Boolean(productMenuAnchor)}
              onClose={handleProductMenuClose}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: "#fff",
                  borderRadius: 0,
                  boxShadow: theme.shadows[4],
                  mt: 0.5,
                  py: 0,
                },
              }}
            >
              <MenuItem component={Link} href="/product" onClick={handleProductMenuClose} sx={menuItemStyles(currentPath === "/product")}>
                <FormatListBulletedIcon fontSize="medium" />
                Alle Produkte
              </MenuItem>
              {userRole === "SELLER" && (
                <MenuItem component={Link} href="/product/create" onClick={handleProductMenuClose} sx={menuItemStyles(currentPath === "/product/create")}>
                  <Add fontSize="medium" />
                  Create
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}