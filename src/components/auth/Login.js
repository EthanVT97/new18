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
  styled
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) throw error;

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      if (userData?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
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
              label={t('username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              sx={{
                mb: 3,
                '& label': { color: 'primary.light' },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
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
              }}
            >
              {t('login')}
            </Button>
          </Box>
        </GlowingPaper>
      </Container>
    </Box>
  );
};

export default Login;
