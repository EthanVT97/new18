import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FF66',
      light: '#33FF99',
      dark: '#00CC52',
      contrastText: '#001F1F',
    },
    secondary: {
      main: '#FFC300',
      light: '#FFD966',
      dark: '#CC9C00',
      contrastText: '#001F1F',
    },
    background: {
      default: '#001F1F',
      paper: '#003333',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    accent: {
      blue: '#001A33',
      blueLight: '#003366',
      orange: '#FF6A00',
      orangeLight: '#FF944D',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 0 10px rgba(0, 255, 102, 0.3)',
          '&:hover': {
            boxShadow: '0 0 15px rgba(0, 255, 102, 0.5)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00FF66 30%, #33FF99 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #33FF99 30%, #00FF66 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #FFC300 30%, #FFD966 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FFD966 30%, #FFC300 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to bottom right, #003333, #001F1F)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 255, 102, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0, 255, 102, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 255, 102, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 102, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00FF66',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(to right, #001F1F, #003333)',
          boxShadow: '0 4px 20px rgba(0, 255, 102, 0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 102, 0.1)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      background: 'linear-gradient(45deg, #00FF66, #33FF99)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    h2: {
      background: 'linear-gradient(45deg, #00FF66, #33FF99)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    h3: {
      color: '#00FF66',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
});
