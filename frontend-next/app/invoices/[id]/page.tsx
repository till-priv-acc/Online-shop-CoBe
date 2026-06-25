'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import {
    LinearProgress,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

import { api } from '@/lib/api';

import NavbarLong from '@/components/navbar/NavbarLong';
import HeaderPicture from '@/components/UIElements/HeaderPicture';
import BoxContent from '@/components/UIElements/BoxContent';

import { InvoiceCompleteDTO } from '@/constants/invoiceConstants';
import { UserRole } from '@/constants/userConstants';

export default function OneInvoicePage() {
  const router = useRouter();
  const params = useParams();

  const invoiceID = params.id as string;

  const [invoice, setInvoice] =
    useState<InvoiceCompleteDTO | null>(null);

  const [userRole, setUserRole] =
    useState<UserRole | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const check = await api.get('/users/check-session');

        if (!check.data.loggedIn) {
          router.push('/authSites/login');
          return;
        }

        setUserRole(check.data.role);

        const res = await api.get<InvoiceCompleteDTO>(
          `/invoices/Myinvoice/${invoiceID}`,
        );

        setInvoice(res.data);
        if(invoice !== null) {
            const totalQuantity = invoice.invoiceItems.reduce(
            (sum, item) => sum + (item.quantity ?? 0),
            0
            );
        }
        
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceID) {
      loadInvoice();
    }
  }, [invoiceID, router]);

  if (loading) {
    return (
      <CircularProgress
        sx={{ mt: 4, display: 'block', mx: 'auto' }}
      />
    );
  }

  if (error) {
    return (
      <BoxContent>
        <Typography
          variant="h6"
          color="error"
          sx={{ textAlign: 'center', mt: 4 }}
        >
          Fehler beim Laden der Rechnung
        </Typography>
      </BoxContent>
    );
  }

  if (!invoice || !userRole) {
    return null;
  }

  const goToDetail = (productId: string | null) => {
    if (productId) {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <HeaderPicture headerPic="/images/shoppingcart.png" />

      <NavbarLong
        userRole={userRole}
        currentPath={`/invoices/${invoiceID}`}
      />

      <BoxContent>
        <Box
          sx={{
            width: '70%',
            p: 3,
            borderRadius: 3,
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#fff',
            alignItems: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3, width: '100%' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Rechnung
            </Typography>
          </Box>

          {invoice.invoiceItems.map((item) => {
            const imageSrc = item.productPicture
              ? `/product-images/${item.productPicture}`
              : '/images/placeholder.png';

            return (
              <Card
                key={item.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src={imageSrc}
                  alt={item.productName ?? 'product image'}
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement>,
                  ) => {
                    e.currentTarget.src =
                      '/images/placeholder.png';
                  }}
                  sx={{
                    width: 80,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />

                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {item.productName}
                  </Typography>

                  <Typography color="text.secondary">
                    Verkäufer:{' '}
                    {item.seller ?? 'Unknown'}
                  </Typography>

                  <Typography color="text.secondary">
                    Preis: €
                    {item.productPrice?.toFixed(2)}
                  </Typography>

                  <Typography color="text.secondary">
                    Menge: {item.quantity}
                    </Typography>

                    <Box sx={{ mt: 1, width: '100%' }}>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min((item.quantity / 10) * 100, 100)}
                        sx={{ height: 6, borderRadius: 5 }}
                    />
                    </Box>
                </CardContent>

                <CardActions>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      goToDetail(item.productId ?? null)
                    }
                  >
                    <SearchIcon />
                  </IconButton>
                </CardActions>
              </Card>
            );
          })}

          {invoice.invoiceItems.length === 0 && (
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', mt: 2 }}
            >
              Keine Produkte vorhanden
            </Typography>
          )}

          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              backgroundColor: '#f5f5f5',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h6">
              Gesamtsumme
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#052d65',
              }}
            >
              €
              {invoice.totalPrice}
            </Typography>
          </Box>
        </Box>
      </BoxContent>
    </Box>
  );
}