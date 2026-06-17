import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ShoppingCart,
  People,
  Payment,
  PersonAdd,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

interface Analytics {
  totalOrders: number;
  totalPayments: number;
  activeUsers: number;
  newRegistrations: number;
  ordersChart?: any[];
  paymentsChart?: any[];
}

const normalizeAnalytics = (payload: any): Analytics => {
  if (!payload || typeof payload !== 'object') {
    return {
      totalOrders: 0,
      totalPayments: 0,
      activeUsers: 0,
      newRegistrations: 0,
      ordersChart: [],
      paymentsChart: [],
    };
  }

  const totalOrders = payload.totalOrders ?? payload.orders?.total ?? 0;
  const totalPayments = payload.totalPayments ?? payload.payments?.total ?? 0;
  const activeUsers = payload.activeUsers && typeof payload.activeUsers === 'object'
    ? (payload.activeUsers.clients || 0) + (payload.activeUsers.executors || 0)
    : payload.activeUsers || 0;
  const newRegistrations = payload.newRegistrations && Array.isArray(payload.newRegistrations)
    ? payload.newRegistrations.reduce((sum: number, item: any) => sum + (item?.count || 0), 0)
    : payload.newRegistrations || 0;

  return {
    totalOrders,
    totalPayments,
    activeUsers,
    newRegistrations,
    ordersChart: Array.isArray(payload.ordersChart) ? payload.ordersChart : [],
    paymentsChart: Array.isArray(payload.paymentsChart) ? payload.paymentsChart : [],
  };
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalOrders: 0,
    totalPayments: 0,
    activeUsers: 0,
    newRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response: any = await api.get('/admin/analytics', { period });
      setAnalytics(normalizeAnalytics(response));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки аналитики');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodText = (period: string): string => {
    switch (period) {
      case 'day':
        return 'за сегодня';
      case 'week':
        return 'за неделю';
      case 'month':
        return 'за месяц';
      case 'year':
        return 'за год';
      default:
        return '';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Аналитика</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Период"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="day">День</MenuItem>
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="year">Год</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Основные метрики {getPeriodText(period)}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <StatCard
          title="Количество заказов"
          value={analytics.totalOrders}
          icon={<ShoppingCart />}
          color="#2196F3"
        />
        <StatCard
          title="Сумма платежей"
          value={`${analytics.totalPayments.toLocaleString('ru-RU')}₽`}
          icon={<Payment />}
          color="#4CAF50"
        />
        <StatCard
          title="Активные пользователи"
          value={analytics.activeUsers}
          icon={<People />}
          color="#FF9800"
        />
        <StatCard
          title="Новые регистрации"
          value={analytics.newRegistrations}
          icon={<PersonAdd />}
          color="#9C27B0"
        />
      </Box>

      {analytics.ordersChart && analytics.ordersChart.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Динамика заказов
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.ordersChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#2196F3" name="Заказы" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {analytics.paymentsChart && analytics.paymentsChart.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Динамика платежей
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.paymentsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#4CAF50" name="Сумма (₽)" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {!loading && (!analytics.ordersChart || analytics.ordersChart.length === 0) && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Недостаточно данных для отображения графиков
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AnalyticsPage;
