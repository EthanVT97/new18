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
  Edit as EditIcon,
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';

const ChatRoomManagement = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          created_by(username)
        `)
        .order('name');
      
      if (error) throw error;
      setRooms(data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error.message);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('chat_rooms')
        .insert([{
          name: newRoom.name,
          created_by: user.id
        }]);

      if (error) throw error;
      
      setOpen(false);
      setNewRoom({ name: '' });
      fetchRooms();
    } catch (error) {
      console.error('Error creating chat room:', error.message);
    }
  };

  const handleUpdateRoom = async () => {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ name: editRoom.name })
        .eq('id', editRoom.id);

      if (error) throw error;
      
      setEditRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating chat room:', error.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;
      fetchRooms();
    } catch (error) {
      console.error('Error deleting chat room:', error.message);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t('chatRoomManagement')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        {t('createRoom')}
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('roomName')}</TableCell>
              <TableCell>{t('createdBy')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.name}</TableCell>
                <TableCell>{room.created_by?.username}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => setEditRoom(room)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteRoom(room.id)}
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

      {/* Create Room Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('createRoom')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('roomName')}
            fullWidth
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button onClick={handleCreateRoom} color="primary">
            {t('create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={!!editRoom} onClose={() => setEditRoom(null)}>
        <DialogTitle>{t('editRoom')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('roomName')}
            fullWidth
            value={editRoom?.name || ''}
            onChange={(e) =>
              setEditRoom({ ...editRoom, name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRoom(null)}>{t('cancel')}</Button>
          <Button onClick={handleUpdateRoom} color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ChatRoomManagement;
