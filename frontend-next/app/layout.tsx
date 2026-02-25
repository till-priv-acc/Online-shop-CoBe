"use client"; // alles darunter ist client

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}