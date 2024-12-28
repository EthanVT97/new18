import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ChatInterface = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    checkUser();
    fetchTemplates();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    subscribeToPresence();

    return () => {
      unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      
      // Set user presence
      await supabase.from('user_presence')
        .upsert({ 
          user_id: user.id,
          email: user.email,
          last_seen: new Date().toISOString(),
          status: 'online'
        });
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/login');
    }
  };

  const subscribeToPresence = () => {
    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = new Set();
        const presenceState = channel.presenceState();
        
        Object.values(presenceState).forEach(presence => {
          presence.forEach(p => {
            if (p.user_id !== user?.id) {
              newState.add(p.email);
            }
          });
        });
        
        setOnlineUsers(newState);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user?.id,
            email: user?.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      // Emit typing event
      supabase.channel('typing').send({
        type: 'broadcast',
        event: 'typing',
        payload: { user: user?.email }
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      // Emit stopped typing event
      supabase.channel('typing').send({
        type: 'broadcast',
        event: 'stop_typing',
        payload: { user: user?.email }
      });
    }, 1000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            user_id: user.id,
            user_email: user.email,
          },
        ]);

      if (error) throw error;
      setNewMessage('');
      setTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTemplateClick = (template) => {
    setNewMessage(template.content);
  };

  const handleMessageMenu = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      navigator.clipboard.writeText(selectedMessage.content);
    }
    handleCloseMenu();
  };

  const getInitials = (email) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', py: 2 }}>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Chat Header */}
        <Box sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/login/dashboard')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">{t('chat.title')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Array.from(onlineUsers).map((email) => (
              <Tooltip key={email} title={`${email} ${t('chat.online')}`}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#44b700',
                      color: '#44b700',
                      boxShadow: '0 0 0 2px white',
                      '&::after': {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        animation: 'ripple 1.2s infinite ease-in-out',
                        border: '1px solid currentColor',
                        content: '""',
                      },
                    },
                    '@keyframes ripple': {
                      '0%': {
                        transform: 'scale(.8)',
                        opacity: 1,
                      },
                      '100%': {
                        transform: 'scale(2.4)',
                        opacity: 0,
                      },
                    },
                  }}
                >
                  <Avatar sx={{ width: 30, height: 30, bgcolor: 'secondary.main' }}>
                    {getInitials(email)}
                  </Avatar>
                </Badge>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Templates Section */}
        <Box sx={{ p: 1, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('chat.templates')}:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outlined"
                size="small"
                onClick={() => handleTemplateClick(template)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {template.title}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Messages Section */}
        <List sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  flexDirection: message.user_id === user?.id ? 'row-reverse' : 'row',
                  gap: 1,
                }}
              >
                <Avatar sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: message.user_id === user?.id ? 'primary.main' : 'secondary.main'
                }}>
                  {getInitials(message.user_email)}
                </Avatar>
                <ListItemText
                  primary={
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: message.user_id === user?.id ? 'flex-end' : 'flex-start',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                      <Typography variant="body2" color="textSecondary">
                        {message.user_email}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        mt: 0.5,
                        bgcolor: message.user_id === user?.id ? 'primary.light' : 'grey.100',
                        color: message.user_id === user?.id ? 'white' : 'inherit',
                        maxWidth: '80%',
                        ml: message.user_id === user?.id ? 'auto' : 0,
                        borderRadius: 2,
                        wordBreak: 'break-word',
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                    </Paper>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleMessageMenu(e, message)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItem>
              {index < messages.length - 1 && (
                <Box sx={{ my: 1 }} />
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Message Input */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('chat.typemessage')}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              multiline
              maxRows={4}
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!newMessage.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'action.disabled',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleCopyMessage}>
          <CopyIcon fontSize="small" sx={{ mr: 1 }} />
          {t('chat.copy')}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ChatInterface;
