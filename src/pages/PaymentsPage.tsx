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
  Card,
  CardContent,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Undo as UndoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

interface Payment {
  id: string;
  order_id: string;
  client_id: string;
  amount: number;
  status: string;
  payment_method: any;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
  order?: any;
  client?: any;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    action: () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [page, rowsPerPage, statusFilter, dateFrom, dateTo]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (dateFrom) {
        params.dateFrom = dateFrom;
      }
      if (dateTo) {
        params.dateTo = dateTo;
      }

      const response: any = await api.get('/admin/payments', params);
      setPayments(response.payments || []);
      setTotalPayments(response.total || 0);
      setTotalAmount(response.totalAmount || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки платежей');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleRefundPayment = async (paymentId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/admin/payments/${paymentId}/refund`);
      fetchPayments();
      setDetailsOpen(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка возврата платежа');
    } finally {
      setActionLoading(false);
    }
  };

  const openRefundConfirm = (payment: Payment) => {
    setConfirmDialog({
      open: true,
      title: 'Возврат платежа',
      message: `Вы уверены, что хотите вернуть платеж на сумму ${payment.amount}₽?`,
      action: () => handleRefundPayment(payment.id),
    });
  };

  const getStatusColor = (
    status: string
  ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'completed':
        return 'Завершен';
      case 'failed':
        return 'Ошибка';
      case 'refunded':
        return 'Возвращен';
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
    {
      id: 'created_at',
      label: 'Дата',
      minWidth: 150,
      format: (value) => formatDate(value),
    },
    {
      id: 'order_id',
      label: 'Заказ',
      minWidth: 100,
      format: (value) => value.substring(0, 8),
    },
    {
      id: 'client',
      label: 'Клиент',
      minWidth: 150,
      format: (value) => value?.name || 'Неизвестно',
    },
    {
      id: 'amount',
      label: 'Сумма',
      minWidth: 100,
      format: (value) => `${value}₽`,
    },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      format: (value) => getStatusText(value),
    },
    {
      id: 'transaction_id',
      label: 'ID транзакции',
      minWidth: 150,
      format: (value) => value || '-',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление платежами</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Общая сумма платежей
              </Typography>
              <Typography variant="h4" color="primary">
                {totalAmount.toLocaleString('ru-RU')}₽
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Статус"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="pending">Ожидает</MenuItem>
            <MenuItem value="completed">Завершен</MenuItem>
            <MenuItem value="failed">Ошибка</MenuItem>
            <MenuItem value="refunded">Возвращен</MenuItem>
          </TextField>

          <TextField
            type="date"
            label="Дата от"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />

          <TextField
            type="date"
            label="Дата до"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      </Paper>

      <DataTable
        columns={columns}
        rows={payments}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalPayments}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={handleRowClick}
        emptyMessage="Платежей не найдено"
      />

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Детали платежа</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                ID платежа
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPayment.id}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Статус
              </Typography>
              <Chip
                label={getStatusText(selectedPayment.status)}
                color={getStatusColor(selectedPayment.status)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" color="text.secondary">
                Сумма
              </Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {selectedPayment.amount}₽
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Дата создания
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(selectedPayment.created_at)}
              </Typography>

              {selectedPayment.completed_at && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Дата завершения
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedPayment.completed_at)}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">
                ID заказа
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPayment.order_id}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Клиент
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPayment.client?.name || 'Неизвестно'}
                {selectedPayment.client && ` (${selectedPayment.client.phone_number})`}
              </Typography>

              {selectedPayment.transaction_id && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID транзакции
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPayment.transaction_id}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">
                Способ оплаты
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPayment.payment_method?.type === 'card' ? 'Банковская карта' : 'Сохраненная карта'}
                {selectedPayment.payment_method?.cardLast4 &&
                  ` (**** ${selectedPayment.payment_method.cardLast4})`}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedPayment && selectedPayment.status === 'completed' && (
            <Button
              startIcon={<UndoIcon />}
              onClick={() => openRefundConfirm(selectedPayment)}
              color="warning"
            >
              Вернуть платеж
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
        loading={actionLoading}
      />
    </Box>
  );
};

export default PaymentsPage;
