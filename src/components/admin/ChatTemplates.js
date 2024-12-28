import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';

const ChatTemplates = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchTemplates();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Check if user is admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      if (!userData?.is_admin) {
        navigate('/login/dashboard');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showSnackbar('Error fetching templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTitle(template.title);
      setContent(template.content);
    } else {
      setEditingTemplate(null);
      setTitle('');
      setContent('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('chat_templates')
          .update({ title: title.trim(), content: content.trim() })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        showSnackbar('Template updated successfully');
      } else {
        const { error } = await supabase
          .from('chat_templates')
          .insert([{ title: title.trim(), content: content.trim() }]);

        if (error) throw error;
        showSnackbar('Template created successfully');
      }

      handleCloseDialog();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      showSnackbar('Error saving template', 'error');
    }
  };

  const handleDelete = async (template) => {
    try {
      const { error } = await supabase
        .from('chat_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      showSnackbar('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      showSnackbar('Error deleting template', 'error');
    }
  };

  const handleCopy = async (template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      showSnackbar('Template copied to clipboard');
    } catch (error) {
      console.error('Error copying template:', error);
      showSnackbar('Error copying template', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            {t('templates.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('templates.add')}
          </Button>
        </Box>

        <List>
          {templates.map((template) => (
            <ListItem
              key={template.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => handleCopy(template)} color="primary">
                    <CopyIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(template)} color="info">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(template)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={template.title}
                secondary={template.content}
                secondaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTemplate ? t('templates.edit') : t('templates.create')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('templates.titleLabel')}
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('templates.contentLabel')}
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChatTemplates;
