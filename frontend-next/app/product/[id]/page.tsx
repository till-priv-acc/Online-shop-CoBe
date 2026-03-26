'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, Divider, Chip } from '@mui/material';
import { api } from '@/lib/api';
import { ProductDBDTO, productCategoryColors } from '@/constants/productConstants';
import ProductUpdate from "./components/ProductUpdate"
import ProductDelete from './components/ProductDelete';
import { UserRole } from '@/constants/userConstants';
import NavbarLong from '@/components/navbar/NavbarLong';
import BoxContent from '@/components/UIElements/BoxContent';
import ImageSlider from '@/components/UIElements/ImageSlider';
import HeaderPicture from '@/components/UIElements/HeaderPicture';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetcher = async (): Promise<{ product: ProductDBDTO; userid: string } | null> => {
    const check = await api.get('/users/check-session');
    if (!check.data.loggedIn) {
      router.push('/authSites/login');
      return null;
    }
    const userid: string = check.data.userId || '';
    setUserRole(check.data.role);
    const res = await api.get<ProductDBDTO>(`/products/product/${id}`);
    return { product: res.data, userid };
  };

  const { data, error, isLoading, mutate } = useSWR(id ? `/products/product/${id}` : null, fetcher);

  if (isLoading) return <p>Lade Produkt...</p>;
  if (error) return <p>Fehler beim Laden des Produkts</p>;
  if (!data) return null;

  const { product, userid } = data;
  const imagePreviews = product.pictures?.map(pic => `/product-images/${pic.fileName}`) || [];

  return (
  <Box sx={{ width: '100%'}}>
    {/* Header-Bild 100% */}
    <HeaderPicture headerPic="/images/product-detail.png" />

    {userRole && <NavbarLong userRole={userRole} currentPath="/product/[id]" />}

    {/* Produkt-Box */}
    <BoxContent>
      <ImageSlider images={imagePreviews} height={450} />

      {/* Zentrierte Basisdaten-Box */}
      <Box
        sx={{
          width: '100%',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          backgroundColor: '#fff',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Produktinfos */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {product.name}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ color: '#052d65', fontWeight: 600 }}>
          €{product.price}
        </Typography>
        <Divider sx={{width: "100%", mt: 2, mb: 1 }}>Basis Daten</Divider>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            mb: 1,
            justifyContent: 'center',
          }}
        >
          <Chip
            label={product.category}
            size="medium"
            sx={{
              fontSize: '1rem',
              backgroundColor: productCategoryColors[product.category] || '#ccc',
              color: '#fff',
              fontWeight: 500,
            }}
          />
          <Chip label={product.material} size="medium" sx={{ fontSize: '1rem' }} />
          <Chip label={product.color} size="medium" sx={{ fontSize: '1rem' }} />
          <Chip
            label={product.isAvailible ? 'Verfügbar' : 'Nicht verfügbar'}
            size="medium"
            sx={{
              fontSize: '1rem',
              backgroundColor: product.isAvailible ? 'green' : 'red',
              color: '#fff',
              fontWeight: 500,
            }}
          />
          <Chip label={`Inland in ${product.deliverable} Tagen`} size="medium" sx={{ fontSize: '1rem' }} />
          <Chip label={`Ausland in ${product.deliverableAbroad} Tagen`} size="medium" sx={{ fontSize: '1rem' }} />
        </Box>

        <Typography variant="body1" sx={{ mb: 1 }}>
          {product.description}
        </Typography>

        {/* Stückzahlen */}
        {userRole && userRole !== 'USER' && (
          <Box sx={{ width: '100%' }}>
            <Divider sx={{width: "100%", mt: 2, mb: 1 }}>Stückzahlen</Divider>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                mt: 3,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* Stückzahl */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Stückzahl:
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#fff',
                    backgroundColor: product.crowd >= product.minCrowd ? '#4caf50' : '#f44336',
                  }}
                >
                  {product.crowd}
                </Box>
              </Box>

              {/* Mindeststückzahl */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Mindeststückzahl:
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#555',
                    backgroundColor: '#e0e0e0',
                  }}
                >
                  {product.minCrowd}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Actions */}
        {userid && userid == product.createFromID && (
          <Box sx={{ width: "100%"}}>
            <Divider sx={{ width: "100%", mt: 2, mb: 1 }}>Actions</Divider>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <ProductUpdate initialData={product!} onSuccess={() => mutate()} />
              <ProductDelete 
                productID={product.id} 
                productName={product.name} 
                productPics={product.pictures?.map(f => f.fileName) || []}
              />
            </Box>
          </Box>
        )}

        <Divider sx={{width: "100%", mt: 2, mb: 1 }}>Verkauft von {product.createFrom}</Divider>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {product.createFromAdress}
        </Typography>
      </Box>
    </BoxContent>
  </Box>
);
}



