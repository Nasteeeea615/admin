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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import DataTable, { Column } from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../services/api';

interface User {
  id: string;
  phone_number: string;
  name: string;
  email?: string;
  role: string;
  is_blocked: boolean;
  email_confirmed: boolean;
  created_at: string;
  client_profile?: {
    city: string;
    street: string;
    house_number: string;
  };
  executor_profile?: {
    vehicle_number: string;
    vehicle_capacity: number;
    is_verified: boolean;
    is_working: boolean;
    rating: number;
    completed_orders_count: number;
    balance?: number;
  };
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('1000');

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (roleFilter) {
        params.role = roleFilter;
      }

      const response: any = await api.get('/admin/users', params);
      setUsers(response.users || []);
      setTotalUsers(response.pagination?.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки пользователей');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userId}/block`, { isBlocked: block });
      fetchUsers();
      setDetailsOpen(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка блокировки пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTopUpBalance = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${selectedUser.id}/balance`, { amount: Number(balanceAmount) });
      fetchUsers();
      setBalanceDialogOpen(false);
      setBalanceAmount('1000');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка пополнения баланса');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyExecutor = async (userId: string, verify: boolean) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userId}/verify`, { isVerified: verify });
      fetchUsers();
      setDetailsOpen(false);
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка верификации исполнителя');
    } finally {
      setActionLoading(false);
    }
  };

  const openBlockConfirm = (user: User) => {
    setConfirmDialog({
      open: true,
      title: user.is_blocked ? 'Разблокировать пользователя' : 'Заблокировать пользователя',
      message: user.is_blocked
        ? `Вы уверены, что хотите разблокировать пользователя ${user.name}?`
        : `Вы уверены, что хотите заблокировать пользователя ${user.name}?`,
      action: () => handleBlockUser(user.id, !user.is_blocked),
    });
  };

  const openVerifyConfirm = (user: User, verify: boolean) => {
    setConfirmDialog({
      open: true,
      title: verify ? 'Подтвердить исполнителя' : 'Отклонить исполнителя',
      message: verify
        ? `Вы уверены, что хотите подтвердить исполнителя ${user.name}?`
        : `Вы уверены, что хотите отклонить исполнителя ${user.name}?`,
      action: () => handleVerifyExecutor(user.id, verify),
    });
  };

  const getRoleText = (role: string): string => {
    switch (role) {
      case 'client':
        return 'Клиент';
      case 'executor':
        return 'Исполнитель';
      case 'admin':
        return 'Администратор';
      default:
        return role;
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

  const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' },
        gap: 1,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Box>{children}</Box>
    </Box>
  );

  const columns: Column[] = [
    { id: 'id', label: 'ID', minWidth: 100, format: (value) => String(value || '').substring(0, 8) },
    { id: 'name', label: 'Имя', minWidth: 150 },
    { id: 'phone_number', label: 'Телефон', minWidth: 130 },
    { id: 'email', label: 'Email', minWidth: 160 },
    {
      id: 'role',
      label: 'Роль',
      minWidth: 120,
      format: (value) => getRoleText(value),
    },
    {
      id: 'email_confirmed',
      label: 'Email подтверждён',
      minWidth: 130,
      format: (value) => (value ? '✅ Да' : '❌ Нет'),
    },
    {
      id: 'is_blocked',
      label: 'Статус',
      minWidth: 100,
      format: (value) => (value ? 'Заблокирован' : 'Активен'),
    },
    {
      id: 'created_at',
      label: 'Дата регистрации',
      minWidth: 130,
      format: (value) => formatDate(value),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Управление пользователями</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
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
            label="Роль"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Все</MenuItem>
            <MenuItem value="client">Клиенты</MenuItem>
            <MenuItem value="executor">Исполнители</MenuItem>
          </TextField>
        </Box>
      </Paper>

      <DataTable
        columns={columns}
        rows={users}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalUsers}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={handleRowClick}
        emptyMessage="Пользователей не найдено"
      />

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Профиль пользователя</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <DetailRow label="ID">
                <Typography variant="body1">{selectedUser.id}</Typography>
              </DetailRow>

              <DetailRow label="Имя">
                <Typography variant="body1">{selectedUser.name}</Typography>
              </DetailRow>

              <DetailRow label="Номер телефона">
                <Typography variant="body1">{selectedUser.phone_number}</Typography>
              </DetailRow>

              {selectedUser.email && (
                <DetailRow label="Email">
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </DetailRow>
              )}

              <DetailRow label="Email подтверждён">
                <Chip
                  label={selectedUser.email_confirmed ? 'Подтверждён' : 'Не подтверждён'}
                  color={selectedUser.email_confirmed ? 'success' : 'default'}
                  size="small"
                />
              </DetailRow>

              <DetailRow label="Роль">
                <Chip label={getRoleText(selectedUser.role)} />
              </DetailRow>

              <DetailRow label="Статус">
                <Chip
                  label={selectedUser.is_blocked ? 'Заблокирован' : 'Активен'}
                  color={selectedUser.is_blocked ? 'error' : 'success'}
                />
              </DetailRow>

              <DetailRow label="Дата регистрации">
                <Typography variant="body1">{formatDate(selectedUser.created_at)}</Typography>
              </DetailRow>

              {selectedUser.role === 'client' && selectedUser.client_profile && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Профиль клиента
                  </Typography>

                  <DetailRow label="Адрес">
                    <Typography variant="body1">
                      {selectedUser.client_profile.city}, {selectedUser.client_profile.street},{' '}
                      {selectedUser.client_profile.house_number}
                    </Typography>
                  </DetailRow>
                </>
              )}

              {selectedUser.role === 'executor' && selectedUser.executor_profile && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Профиль исполнителя
                  </Typography>

                  <DetailRow label="Номер машины">
                    <Typography variant="body1">{selectedUser.executor_profile.vehicle_number}</Typography>
                  </DetailRow>

                  <DetailRow label="Объем машины">
                    <Typography variant="body1">{selectedUser.executor_profile.vehicle_capacity} м³</Typography>
                  </DetailRow>

                  <DetailRow label="Статус верификации">
                    <Chip
                      label={
                        selectedUser.executor_profile.is_verified
                          ? 'Подтвержден'
                          : 'Ожидает проверки'
                      }
                      color={selectedUser.executor_profile.is_verified ? 'success' : 'warning'}
                    />
                  </DetailRow>

                  <DetailRow label="Рейтинг">
                    <Typography variant="body1">⭐ {selectedUser.executor_profile.rating || 0}</Typography>
                  </DetailRow>

                  <DetailRow label="Выполнено заказов">
                    <Typography variant="body1">{selectedUser.executor_profile.completed_orders_count || 0}</Typography>
                  </DetailRow>

                  <DetailRow label="Баланс">
                    <Typography variant="body1" fontWeight="bold">
                      {Number(selectedUser.executor_profile.balance || 0).toFixed(2)} ₽
                    </Typography>
                  </DetailRow>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 1, px: 3, pb: 2 }}>
          {selectedUser && selectedUser.role === 'executor' && !selectedUser.executor_profile?.is_verified && (
            <>
              <Button
                startIcon={<CheckCircleIcon />}
                onClick={() => openVerifyConfirm(selectedUser, true)}
                color="success"
              >
                Подтвердить
              </Button>
              <Button
                startIcon={<CancelIcon />}
                onClick={() => openVerifyConfirm(selectedUser, false)}
                color="error"
              >
                Отклонить
              </Button>
            </>
          )}
          {selectedUser && selectedUser.role === 'executor' && (
            <Button
              color="info"
              onClick={() => setBalanceDialogOpen(true)}
            >
              Пополнить баланс
            </Button>
          )}
          {selectedUser && (
            <Button
              startIcon={<BlockIcon />}
              onClick={() => openBlockConfirm(selectedUser)}
              color={selectedUser.is_blocked ? 'success' : 'error'}
            >
              {selectedUser.is_blocked ? 'Разблокировать' : 'Заблокировать'}
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Balance top-up dialog */}
      <Dialog open={balanceDialogOpen} onClose={() => setBalanceDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Пополнить баланс исполнителя</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedUser?.name} — текущий баланс: {Number(selectedUser?.executor_profile?.balance || 0).toFixed(2)} ₽
          </Typography>
          <TextField
            label="Сумма пополнения (₽)"
            type="number"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            fullWidth
            inputProps={{ min: 1, step: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleTopUpBalance}
            disabled={actionLoading || !balanceAmount || Number(balanceAmount) <= 0}
          >
            Пополнить
          </Button>
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

export default UsersPage;
