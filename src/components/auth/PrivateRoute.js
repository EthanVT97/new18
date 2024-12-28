import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      setAuthenticated(!!session);
    } catch (error) {
      console.error('Auth error:', error.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #001F1F 0%, #003333 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#00FF66' }} />
      </Box>
    );
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
