import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [debugCode, setDebugCode] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await api.post('/auth/request-code', {
        email,
        role: 'admin',
      });

      setSentEmail(email.trim().toLowerCase());
      setStep('code');
      setDebugCode(response.debugCode || '');
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить код. Проверьте email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-code', {
        email: sentEmail || email.trim().toLowerCase(),
        code,
        role: 'admin',
      });

      onLoginSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка подтверждения кода.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('email');
    setCode('');
    setDebugCode('');
    setError('');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Админ-панель
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Вход по коду из email
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Введите email администратора и подтвердите код из письма.
          </Alert>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={step === 'email' ? handleRequestCode : handleVerifyCode}>
            {step === 'email' ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            ) : (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Alert severity="success">
                  Код отправлен на {sentEmail || email}.
                </Alert>
                {debugCode && <Alert severity="warning">Код подтверждения: {debugCode}</Alert>}
                <TextField
                  required
                  fullWidth
                  name="code"
                  label="Код подтверждения"
                  id="code"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </Stack>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : step === 'email' ? 'Отправить код' : 'Подтвердить код'}
            </Button>

            {step === 'code' && (
              <Button fullWidth variant="text" onClick={handleReset} disabled={loading}>
                Изменить email
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
