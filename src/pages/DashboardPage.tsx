import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart,
  People,
  Payment,
  CheckCircle,
} from '@mui/icons-material';
import mockApi from '../services/mockApi';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
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
  </Paper>
);

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await mockApi.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const completedOrders = analytics?.orders.byStatus.find((s: any) => s.status === 'completed')?.count || 0;
  const totalUsers = (analytics?.activeUsers.clients || 0) + (analytics?.activeUsers.executors || 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        <StatCard
          title="Всего заказов"
          value={analytics?.orders.total || 0}
          icon={<ShoppingCart />}
          color="#2196F3"
        />
        <StatCard
          title="Активные пользователи"
          value={totalUsers}
          icon={<People />}
          color="#4CAF50"
        />
        <StatCard
          title="Общая сумма платежей"
          value={`${(analytics?.payments.total || 0).toLocaleString()}₽`}
          icon={<Payment />}
          color="#FF9800"
        />
        <StatCard
          title="Выполнено заказов"
          value={completedOrders}
          icon={<CheckCircle />}
          color="#9C27B0"
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Добро пожаловать в админ-панель!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Здесь вы можете управлять заказами, пользователями, платежами и обращениями в поддержку.
        </Typography>
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="primary" fontWeight="bold">
            🔧 Режим тестирования с мок-данными
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Для входа используйте: +79999999999 / admin123
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardPage;
