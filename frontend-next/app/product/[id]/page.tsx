'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, IconButton, Divider, Chip } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { api } from '@/lib/api';
import { ProductDBDTO } from '@/constants';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [currentIndex, setCurrentIndex] = useState(0);

  const fetcher = async (): Promise<{ product: ProductDBDTO; userRole: string } | null> => {
    const check = await api.get('/users/check-session');
    if (!check.data.loggedIn) {
      router.push('/login');
      return null;
    }
    const userRole: string = check.data.role || '';
    const res = await api.get<ProductDBDTO>(`/products/product/${id}`);
    return { product: res.data, userRole };
  };

  const { data, error, isLoading } = useSWR(id ? `/products/product/${id}` : null, fetcher);

  if (isLoading) return <p>Lade Produkt...</p>;
  if (error) return <p>Fehler beim Laden des Produkts</p>;
  if (!data) return null;

  const { product, userRole } = data;
  const imagePreviews = product.pictures?.map(pic => `/product-images/${pic.fileName}`) || [];

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      {/* Header-Bild 100% */}
      <Box
        sx={{
          width: '100%',
          height: 220,
          backgroundImage: `url("/images/product-detail.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mb: 4,
        }}
      />

      {/* Produkt-Box */}
      <Box
        sx={{
          width: '70%',
          margin: '0 auto',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: '#fff',
        }}
      >
        {/* Slider */}
        {imagePreviews.length > 0 && (
          <Box
            sx={{
              width: '100%',
              position: 'relative',
              height: 300,
              borderRadius: 2,
              overflow: 'hidden',
              mb: 2,
            }}
          >
            <img
              src={imagePreviews[currentIndex]}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.png';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
              }}
            />

            <IconButton
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              onClick={() => setCurrentIndex(prev => Math.min(prev + 1, imagePreviews.length - 1))}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        )}

        {/* Produktinfos */}
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {product.name}
        </Typography>

        <Typography variant="h5" sx={{ color: '#b12704', fontWeight: 600 }}>
          €{product.price}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={product.category} color="primary" size="small" />
          <Chip label={product.material} size="small" />
          <Chip label={product.color} size="small" />
          <Chip label={product.isAvailible ? 'Verfügbar' : 'Nicht verfügbar'} color={product.isAvailible ? 'success' : 'default'} size="small" />
        </Box>

        <Divider />

        <Typography variant="body1" sx={{ mb: 1 }}>
          {product.description}
        </Typography>

        {userRole && userRole !== 'USER' && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2">Stückzahl: {product.crowd}</Typography>
            <Typography variant="body2">Mindest Stückzahl: {product.minCrowd}</Typography>
          </Box>
        )}

        <Divider />

        <Typography variant="body2" color="text.secondary">
          Verkauft von: {product.createFrom}
        </Typography>
      </Box>
    </Box>
  );
}



