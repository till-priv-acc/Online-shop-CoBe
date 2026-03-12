'use client';

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import {api} from '@/lib/api'; // dein Axios/Api Instance

interface AllProducts {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailible: boolean;
  createFrom: string;
  pictures?: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<AllProducts[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get<AllProducts[]>('products/allProducts'); // wie /users/me
        setProducts(res.data);
        res.data.forEach(p => console.log('Bildname:', p.pictures ?? 'Kein Bild'));
      } catch (err) {
        console.error('Fehler beim Laden der Produkte', err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={2}
      padding={2}
      justifyContent="flex-start"
    >
      {products.map((product) => {
        const imagePath = product.pictures
          ? `/product-images/${product.pictures}`
          : '/images/placeholder.png';

        return (
          <Card
            key={product.id}
            sx={{ width: 250, display: 'flex', flexDirection: 'column' }}
          >
            <CardMedia
              component="img"
              height="140"
              image={imagePath}
              alt={product.name}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.png';
              }}
            />
            <CardContent>
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Kategorie: {product.category}
              </Typography>
              <Typography variant="body1">Preis: €{product.price}</Typography>
              <Typography
                variant="body2"
                color={product.isAvailible ? 'green' : 'red'}
              >
                {product.isAvailible ? 'Verfügbar' : 'Nicht verfügbar'}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default ProductsPage;