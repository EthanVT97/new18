import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { supabase } from '../../config/supabase';

const ChatRoom = () => {
  const { t } = useTranslation();
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRoom();
    fetchMessages();
    getCurrentUser();
    subscribeToMessages();
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (error) {
      console.error('Error fetching room:', error.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(username)
        `)
        .eq('room_id', roomId)
        .order('created_at');

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          room_id: roomId,
          sender_id: user.id,
          content: newMessage,
        },
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{room?.name}</Typography>
        </Toolbar>
      </AppBar>

      <Container
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            overflow: 'auto',
            mb: 2,
            p: 2,
          }}
        >
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent:
                    message.sender_id === user?.id ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection:
                      message.sender_id === user?.id ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Avatar>{message.sender?.username?.[0]}</Avatar>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor:
                        message.sender_id === user?.id
                          ? 'primary.light'
                          : 'grey.100',
                      maxWidth: '70%',
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      {message.sender?.username}
                    </Typography>
                    <Typography>{message.content}</Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            placeholder={t('typeMessage')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ ml: 1, flex: 1 }}
          />
          <IconButton type="submit" color="primary" sx={{ p: '10px' }}>
            <SendIcon />
          </IconButton>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChatRoom;
