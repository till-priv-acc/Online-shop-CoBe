"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline, createTheme, Box } from "@mui/material";

const theme = createTheme();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <Box
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            minHeight="100vh"
            sx={{ background: "#f5f5f5", padding: 4 }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "1600px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "center"
              }}
            >
              {children}
            </Box>
          </Box>

        </ThemeProvider>
      </body>
    </html>
  );
}