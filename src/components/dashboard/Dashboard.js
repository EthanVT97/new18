import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  Button,
  styled,
  CircularProgress
} from '@mui/material';
import {
  Message as MessageIcon,
  Group as GroupIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

const GlowingPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px rgba(0, 255, 102, 0.15)`,
  border: '1px solid rgba(0, 255, 102, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: `0 8px 32px rgba(0, 255, 102, 0.25)`,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 255, 102, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 255, 102, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 32px rgba(0, 255, 102, 0.2)',
  },
}));

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #001F1F 0%, #003333 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#00FF66' }} />
      </Box>
    );
  }

  const stats = [
    { title: t('totalMessages'), count: '1,234', icon: <MessageIcon /> },
    { title: t('activeUsers'), count: '56', icon: <GroupIcon /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #001F1F 0%, #003333 100%)',
        py: 4,
      }}
    >
      <Container>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00FF66, #33FF99)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('dashboard')}
            </Typography>
            {user && (
              <Typography
                variant="subtitle1"
                sx={{ color: '#00FF66', mt: 1 }}
              >
                {user.email}
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton
              sx={{ color: '#00FF66', mr: 1 }}
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              sx={{ color: '#00FF66' }}
              onClick={handleLogout}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: '50%', 
                      background: 'rgba(0, 255, 102, 0.1)',
                      mr: 2
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#00FF66' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: '#fff' }}>
                    {stat.count}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}

          <Grid item xs={12}>
            <GlowingPaper>
              <Typography variant="h6" sx={{ mb: 2, color: '#00FF66' }}>
                {t('quickActions')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MessageIcon />}
                    onClick={() => navigate('/chat')}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(45deg, #00FF66 30%, #33FF99 90%)',
                      color: '#001F1F',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #33FF99 30%, #00FF66 90%)',
                      },
                    }}
                  >
                    {t('startChat')}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GroupIcon />}
                    onClick={() => navigate('/users')}
                    sx={{
                      py: 1.5,
                      borderColor: '#00FF66',
                      color: '#00FF66',
                      '&:hover': {
                        borderColor: '#33FF99',
                        background: 'rgba(0, 255, 102, 0.1)',
                      },
                    }}
                  >
                    {t('viewUsers')}
                  </Button>
                </Grid>
              </Grid>
            </GlowingPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
