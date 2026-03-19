"use client";

import { Box } from "@mui/material";

interface HeaderPictureProps {
  headerPic: string; // optional, Standardhöhe
}

export default function HeaderPicture({ headerPic }: HeaderPictureProps) {
  return (
    <Box
        sx={{
          width: "100%",
          height: 270,
          borderRadius: 0,
          backgroundImage: `url("${headerPic}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          mb: 6,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
    />
  );
}