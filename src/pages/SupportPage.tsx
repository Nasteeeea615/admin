import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import DataTable, { Column } from '../components/DataTable';
import api from '../services/api';

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: any;
  messages?: Message[];
}

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
  sender?: any;
}

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalTickets, setTotalTickets] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [page, rowsPerPage, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response: any = await api.get('/admin/tickets', params);
      setTickets(response.tickets || []);
      setTotalTickets(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки тикетов');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response: any = await api.get(`/admin/tickets/${ticketId}`);
      setSelectedTicket(response.ticket);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки деталей тикета');
    }
  };

  const handleRowClick = async (ticket: Ticket) => {
    await fetchTicketDetails(ticket.id);
    setDetailsOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.post(`/admin/tickets/${selectedTicket.id}/reply`, {
        content: replyText.trim(),
      });
      setReplyText('');
      await fetchTicketDetails(selectedTicket.id);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка отправки ответа');
    } finally {
      setSendingReply(false);
    }
  };

  const handleChangeStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      await fetchTicketDetails(ticketId);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка изменения статуса');
    }
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'open':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'open':
        return 'Открыт';
      case 'in_progress':
        return 'В работе';
      case 'closed':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column[] = [
    { id: 'id', label: 'ID', minWidth: 100, format: (value) => value.substring(0, 8) },
    { id: 'subject', label: 'Тема', minWidth: 200 },
    {
      id: 'user',
      label: 'Пользователь',
      minWidth: 150,
      format: (value) => value?.name || 'Неизвестно',
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      format: (value) => getStatusText(value),
    },
    {
      id: 'created_at',
      label: 'Дата создания',
      minWidth: 150,
      format: (value) => formatDate(value),
    },
    {
      id: 'updated_at',
      label: 'Обновлен',
      minWidth: 150,
      format: (value) => formatDate(value),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Служба поддержки</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTickets}
          disabled={loading}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Статус"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="open">Открыт</MenuItem>
            <MenuItem value="in_progress">В работе</MenuItem>
            <MenuItem value="closed">Закрыт</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <DataTable
        columns={columns}
        rows={tickets}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalTickets}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={handleRowClick}
        emptyMessage="Тикетов не найдено"
      />

      {/* Ticket Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Обращение в поддержку</Typography>
            {selectedTicket && (
              <Chip
                label={getStatusText(selectedTicket.status)}
                color={getStatusColor(selectedTicket.status)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Тема
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedTicket.subject}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Описание
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTicket.description}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Пользователь
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTicket.user?.name} ({selectedTicket.user?.phone_number})
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Сообщения
              </Typography>

              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
                  {selectedTicket.messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        bgcolor:
                          message.sender_role === 'admin' ? 'action.hover' : 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="caption" color="text.secondary">
                          {message.sender_role === 'admin' ? 'Поддержка' : message.sender?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(message.created_at)}
                        </Typography>
                      </Box>
                      <ListItemText primary={message.content} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Нет сообщений
                </Typography>
              )}

              {selectedTicket.status !== 'closed' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Ответить
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Введите ответ..."
                    disabled={sendingReply}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedTicket && selectedTicket.status !== 'closed' && (
            <>
              <Button
                startIcon={<SendIcon />}
                onClick={handleSendReply}
                variant="contained"
                disabled={!replyText.trim() || sendingReply}
              >
                Отправить ответ
              </Button>
              {selectedTicket.status === 'open' && (
                <Button
                  onClick={() => handleChangeStatus(selectedTicket.id, 'in_progress')}
                  color="warning"
                >
                  В работу
                </Button>
              )}
              <Button
                onClick={() => handleChangeStatus(selectedTicket.id, 'closed')}
                color="success"
              >
                Закрыть
              </Button>
            </>
          )}
          {selectedTicket && selectedTicket.status === 'closed' && (
            <Button
              onClick={() => handleChangeStatus(selectedTicket.id, 'open')}
              color="info"
            >
              Открыть заново
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportPage;
