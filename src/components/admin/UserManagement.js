import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    is_admin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  const handleCreateUser = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser]);

      if (error) throw error;
      
      setOpen(false);
      setNewUser({ username: '', password: '', is_admin: false });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: !isBlocked })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user block status:', error.message);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t('userManagement')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        {t('createUser')}
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('username')}</TableCell>
              <TableCell>{t('role')}</TableCell>
              <TableCell>{t('status')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.is_admin ? t('admin') : t('user')}
                </TableCell>
                <TableCell>
                  {user.is_blocked ? t('blocked') : t('active')}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                    color={user.is_blocked ? 'error' : 'default'}
                  >
                    <BlockIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteUser(user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('createUser')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('username')}
            fullWidth
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label={t('password')}
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleCreateUser} color="primary">
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagement;
