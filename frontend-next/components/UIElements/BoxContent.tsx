"use client";

import { Box } from "@mui/material";

export default function BoxContent({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        justifyContent: "center",
      }}
    >
      {children}
    </Box>
  );
}