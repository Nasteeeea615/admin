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
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import DataTable, { Column } from '../components/DataTable';
import mockApi from '../services/mockApi';

interface Order {
  id: string;
  client_id: string;
  executor_id?: string;
  status: string;
  vehicle_capacity: number;
  city: string;
  street: string;
  house_number: string;
  scheduled_date: string;
  scheduled_time: string;
  comment?: string;
  is_urgent: boolean;
  price: number;
  created_at: string;
  client?: any;
  executor?: any;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [executors, setExecutors] = useState<any[]>([]);
  const [selectedExecutor, setSelectedExecutor] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, statusFilter]);

  const fetchOrders = async () => {
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

      const response: any = await mockApi.getOrders(params);
      setOrders(response.data.orders || []);
      setTotalOrders(response.data.pagination.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки заказов');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutors = async (capacity: number) => {
    try {
      const response: any = await mockApi.getUsers({
        role: 'executor',
        vehicle_capacity: capacity,
      });
      setExecutors(response.data.users || []);
    } catch (err) {
      console.error('Error fetching executors:', err);
    }
  };

  const handleRowClick = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleAssignExecutor = async (order: Order) => {
    setSelectedOrder(order);
    await fetchExecutors(order.vehicle_capacity);
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedOrder || !selectedExecutor) return;

    setAssignLoading(true);
    try {
      await mockApi.assignExecutor(selectedOrder.id, selectedExecutor);
      setAssignDialogOpen(false);
      setSelectedExecutor('');
      fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Ошибка назначения исполнителя');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleChangeStatus = async (orderId: string, newStatus: string) => {
    try {
      await mockApi.updateOrder(orderId, { status: newStatus });
      fetchOrders();
      setDetailsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка изменения статуса');
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'assigned':
        return 'Назначен';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Выполнен';
      case 'cancelled':
        return 'Отменен';
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
    });
  };

  const columns: Column[] = [
    { id: 'id', label: 'ID', minWidth: 100, format: (value) => value.substring(0, 8) },
    {
      id: 'status',
      label: 'Статус',
      minWidth: 120,
      format: (value) => getStatusText(value),
    },
    {
      id: 'client_name',
      label: 'Клиент',
      minWidth: 150,
    },
    {
      id: 'executor_name',
      label: 'Исполнитель',
      minWidth: 150,
      format: (value) => value || 'Не назначен',
    },
    {
      id: 'vehicle_capacity',
      label: 'Объем',
      minWidth: 80,
      format: (value) => `${value} м³`,
    },
    {
      id: 'price',
      label: 'Стоимость',
      minWidth: 100,
      format: (value) => `${value}₽`,
    },
    {
      id: 'scheduled_date',
      label: 'Дата',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'is_urgent',
      label: 'Срочный',
      minWidth: 80,
      format: (value) => (value ? 'Да' : 'Нет'),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление заказами</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
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
            <MenuItem value="pending">Ожидает</MenuItem>
            <MenuItem value="assigned">Назначен</MenuItem>
            <MenuItem value="in_progress">В работе</MenuItem>
            <MenuItem value="completed">Выполнен</MenuItem>
            <MenuItem value="cancelled">Отменен</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalOrders}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={handleRowClick}
        emptyMessage="Заказов не найдено"
      />

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Детали заказа</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                ID заказа
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.id}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Статус
              </Typography>
              <Chip
                label={getStatusText(selectedOrder.status)}
                color={getStatusColor(selectedOrder.status)}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" color="text.secondary">
                Клиент
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {(selectedOrder as any).client_name} ({(selectedOrder as any).client_phone})
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Исполнитель
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {(selectedOrder as any).executor_name || 'Не назначен'}
                {(selectedOrder as any).executor_phone && ` (${(selectedOrder as any).executor_phone})`}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Адрес
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.city}, {selectedOrder.street}, {selectedOrder.house_number}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Дата и время
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(selectedOrder.scheduled_date)} в {selectedOrder.scheduled_time}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Объем машины
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.vehicle_capacity} м³
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Стоимость
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.price}₽
              </Typography>

              {selectedOrder.comment && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Комментарий
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedOrder.comment}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" color="text.secondary">
                Срочный заказ
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedOrder.is_urgent ? 'Да' : 'Нет'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && !selectedOrder.executor_id && (
            <Button onClick={() => handleAssignExecutor(selectedOrder)} color="primary">
              Назначить исполнителя
            </Button>
          )}
          {selectedOrder && selectedOrder.status !== 'completed' && (
            <Button
              onClick={() => handleChangeStatus(selectedOrder.id, 'completed')}
              color="success"
            >
              Завершить
            </Button>
          )}
          {selectedOrder && selectedOrder.status !== 'cancelled' && (
            <Button
              onClick={() => handleChangeStatus(selectedOrder.id, 'cancelled')}
              color="error"
            >
              Отменить
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Executor Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Назначить исполнителя</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Исполнитель</InputLabel>
            <Select
              value={selectedExecutor}
              onChange={(e) => setSelectedExecutor(e.target.value)}
              label="Исполнитель"
            >
              {executors.map((executor) => (
                <MenuItem key={executor.id} value={executor.id}>
                  {executor.name} - {executor.executor_profile?.vehicle_number} (
                  {executor.executor_profile?.vehicle_capacity}м³)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)} disabled={assignLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            disabled={!selectedExecutor || assignLoading}
          >
            {assignLoading ? <CircularProgress size={24} /> : 'Назначить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
