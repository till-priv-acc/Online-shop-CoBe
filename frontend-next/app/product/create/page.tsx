import ProductUpload from "@/components/ProductUpload";
import { Box } from "@mui/material";

export default function ProductPage() {
  return(
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
        margin: "0 auto",     // <- zentriert den Inhalt
        display: "flex",
        justifyContent: "center"
      }}
    >
      <ProductUpload />
    </Box>
  </Box>
); 
}