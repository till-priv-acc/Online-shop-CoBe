"use client";

import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, IconButton } from "@mui/material";
import { AccountCircle, Inventory2, Add } from "@mui/icons-material";
import { useState } from "react";
import Link from "next/link";
import LogoutButton from "../auth/LogoutButton";

type UserRole = "USER" | "SELLER" | "ADMIN";

interface NavbarProps {
  userRole: UserRole;
}

export default function NavbarLong({ userRole }: NavbarProps) {
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [productMenuAnchor, setProductMenuAnchor] = useState<null | HTMLElement>(null);

  // Hover handlers für Userpage
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  // Hover handlers für Produkte
  const handleProductMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProductMenuAnchor(event.currentTarget);
  const handleProductMenuClose = () => setProductMenuAnchor(null);

  return (
    <AppBar position="static" sx={{ width: "100%", mb: 4}}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Titel */}
        <Typography variant="h6" component={Link} href="/" sx={{ textDecoration: "none", color: "inherit" }}>
          MyShop
        </Typography>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Userpage Menü */}
          <Box onMouseEnter={handleUserMenuOpen} onMouseLeave={handleUserMenuClose}>
            <Button
              color="inherit"
              startIcon={<AccountCircle />}
              component={Link}
              href="/userpage"
            >
              Userpage
            </Button>
            <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            slotProps={{
                list: {
                onMouseLeave: handleUserMenuClose
                }
            }}
            >
              <MenuItem onClick={handleUserMenuClose}>
                <LogoutButton />
              </MenuItem>
            </Menu>
          </Box>

          {/* Produkte Menü */}
            <Box onMouseEnter={handleProductMenuOpen} onMouseLeave={handleProductMenuClose}>
              <Button
                color="inherit"
                startIcon={<Inventory2 />}
                component={Link}
                href="/product"
              >
                Produkte
              </Button>
              {userRole === "SELLER" && (
              <Menu
                anchorEl={productMenuAnchor}
                open={Boolean(productMenuAnchor)}
                onClose={handleProductMenuClose}
                slotProps={{
                    list: {
                    onMouseLeave: handleProductMenuClose
                    }
                }}
                >
                <MenuItem
                component={Link}
                href="/product/create"
                onClick={handleProductMenuClose}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textDecoration: "none",
                    color: "inherit",
                }}
                >
                <Add fontSize="small" />
                Create
                </MenuItem>
              </Menu>
              )}
            </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}