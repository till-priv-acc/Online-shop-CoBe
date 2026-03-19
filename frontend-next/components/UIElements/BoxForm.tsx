"use client";

import { Box, BoxProps } from "@mui/material";

interface BoxFormProps extends BoxProps {
  children: React.ReactNode;
}

export default function BoxForm({ children, sx, ...rest }: BoxFormProps) {
  return (
    <Box
      sx={{
        width: "80%",
        maxWidth: "1600px",
        mx: "auto",
        p: 3,
        borderRadius: 3,
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        display: "grid",
        gap: 2,
        gridTemplateColumns: "repeat(2, 1fr)",
        ...sx, // erlaubt Overrides beim Einsatz
      }}
      {...rest} // erlaubt z.B. component="form", onSubmit usw.
    >
      {children}
    </Box>
  );
}