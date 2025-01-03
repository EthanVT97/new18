import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  styled,
  Alert,
  Snackbar
} from '@mui/material';
import { supabase } from '../../config/supabase';

const GlowingPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0 8px 32px rgba(0, 255, 102, 0.15)`,
  border: '1px solid rgba(0, 255, 102, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: `0 8px 32px rgba(0, 255, 102, 0.25)`,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 255, 102, 0.5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const Logo = styled('img')({
  width: '150px',
  height: 'auto',
  marginBottom: '2rem',
  filter: 'drop-shadow(0 0 10px rgba(0, 255, 102, 0.3))',
});

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data?.user) {
        throw new Error('No user data returned');
      }

      // Store the session
      if (data.session) {
        localStorage.setItem('supabase.auth.token', data.session.access_token);
      }

      // Always navigate to dashboard after successful login
      navigate('/login/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message === 'Invalid login credentials'
        ? t('error.invalid_credentials')
        : error.message || t('error.unknown_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #001F1F 0%, #003333 100%)',
        py: 8,
      }}
    >
      <Container component="main" maxWidth="xs">
        <GlowingPaper elevation={24}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Logo src={process.env.PUBLIC_URL + '/18klogo.jpg'} alt="18K Logo" />
            <Typography
              component="h1"
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00FF66, #33FF99)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('login')}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel sx={{ color: 'primary.light' }}>{t('language')}</InputLabel>
            <StyledSelect
              value={language}
              onChange={handleLanguageChange}
              label={t('language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="my">မြန်မာ</MenuItem>
              <MenuItem value="th">ไทย</MenuItem>
            </StyledSelect>
          </FormControl>
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                '& label': { color: 'primary.light' },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{
                mb: 3,
                '& label': { color: 'primary.light' },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #00FF66 30%, #33FF99 90%)',
                color: '#001F1F',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #33FF99 30%, #00FF66 90%)',
                  boxShadow: '0 0 20px rgba(0, 255, 102, 0.5)',
                },
                '&:disabled': {
                  background: 'rgba(0, 255, 102, 0.3)',
                  color: 'rgba(0, 31, 31, 0.7)',
                },
              }}
            >
              {loading ? t('logging_in') : t('login')}
            </Button>
          </Box>
        </GlowingPaper>
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError('')} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Login;
