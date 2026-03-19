"use client";

import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface ImageSliderProps {
  images: string[];
  height?: number; // optional, Standardhöhe
}

export default function ImageSlider({ images, height = 450 }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        height,
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <img
        src={images[currentIndex]}
        onError={(e: any) => {
          e.target.onerror = null;
          e.target.src = "/images/placeholder.png";
        }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />

      <IconButton
        onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
        sx={{
          position: "absolute",
          left: "15%",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255,255,255,0.7)",
          zIndex: 1,
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <IconButton
        onClick={() => setCurrentIndex(prev => Math.min(prev + 1, images.length - 1))}
        sx={{
          position: "absolute",
          right: "15%",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255,255,255,0.7)",
          zIndex: 1,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}