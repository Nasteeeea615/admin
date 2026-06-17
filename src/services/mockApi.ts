// Mock API service for testing without backend
import {
  mockOrders,
  mockUsers,
  mockPayments,
  mockTickets,
  mockAnalytics,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_ADMIN_EMAIL = 'admin@septic1.local';
const MOCK_ADMIN_CODE = '123456';

const mockAdminUser = {
  id: 'admin-1',
  email: MOCK_ADMIN_EMAIL,
  name: 'Администратор',
  role: 'admin',
};

class MockApiService {
  private token: string | null = null;
  private pendingEmailCodes: Record<string, string> = {};
  public setToken(token: string) {
    this.token = token;
    try {
      // For mock/dev environment set a non-HttpOnly cookie so client can proceed
      if (typeof document !== 'undefined') {
        document.cookie = `access_token=${token}; path=/;`;
      }
    } catch (e) {
      // ignore
    }
  }

  public clearToken() {
    this.token = null;
    try {
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; Max-Age=0; path=/;';
      }
    } catch (e) {}
  }

  public getToken(): string | null {
    if (this.token) return this.token;
    try {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
      return match ? match[2] : null;
    } catch (e) {
      return null;
    }
  }

  // Auth
  async requestCode(email: string, role: string = 'admin') {
    await delay();

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email обязателен');
    }

    if (role !== 'admin') {
      throw new Error('Недостаточно прав');
    }

    if (normalizedEmail !== MOCK_ADMIN_EMAIL) {
      throw new Error('Администратор с таким email не найден');
    }

    this.pendingEmailCodes[normalizedEmail] = MOCK_ADMIN_CODE;

    return {
      success: true,
      data: {
        message: 'Код отправлен',
        debugCode: MOCK_ADMIN_CODE,
      },
    };
  }

  async verifyCode(email: string, code: string, role: string = 'admin') {
    await delay();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedCode = String(code || '').trim();
    const expectedCode = this.pendingEmailCodes[normalizedEmail];

    if (role !== 'admin') {
      throw new Error('Недостаточно прав');
    }

    if (!expectedCode || normalizedCode !== expectedCode) {
      throw new Error('Неверный код подтверждения');
    }

    const mockToken = 'mock_admin_token_' + Date.now();
    this.setToken(mockToken);
    delete this.pendingEmailCodes[normalizedEmail];

    return {
      success: true,
      data: {
        token: mockToken,
        user: mockAdminUser,
      },
    };
  }

  async me() {
    await delay(200);

    const token = this.getToken();
    if (!token) {
      const error: any = new Error('Не авторизован');
      error.response = { status: 401, data: { error: 'Unauthorized' } };
      throw error;
    }

    return {
      success: true,
      data: {
        user: mockAdminUser,
      },
    };
  }

  async logout() {
    await delay(200);
    this.clearToken();

    return {
      success: true,
      data: {
        message: 'Вы вышли из системы',
      },
    };
  }

  async login(phone: string, password: string) {
    await delay();
    
    // Mock admin credentials
    if (phone === '+79999999999' && password === 'admin123') {
      const mockToken = 'mock_admin_token_' + Date.now();
      // Set mock cookie for dev flows
      this.setToken(mockToken);

      return {
        success: true,
        data: {
          token: mockToken,
          user: {
            id: 'admin-1',
            phone_number: phone,
            name: 'Администратор',
            role: 'admin',
          },
        },
      };
    }
    
    throw new Error('Неверный номер телефона или пароль');
  }

  // Orders
  async getOrders(params?: any) {
    await delay();
    
    let filteredOrders = [...mockOrders];
    
    if (params?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === params.status);
    }
    
    return {
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredOrders.length,
          totalPages: 1,
        },
      },
    };
  }

  async updateOrder(id: string, data: any) {
    await delay();
    
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return {
      success: true,
      data: {
        order: { ...order, ...data },
      },
    };
  }

  async assignExecutor(orderId: string, executorId: string) {
    await delay();
    
    const order = mockOrders.find(o => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    return {
      success: true,
      data: {
        order: { ...order, executor_id: executorId, status: 'assigned' },
      },
    };
  }

  // Users
  async getUsers(params?: any) {
    await delay();
    
    let filteredUsers = [...mockUsers];
    
    if (params?.role) {
      filteredUsers = filteredUsers.filter(u => u.role === params.role);
    }
    
    if (params?.isBlocked !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.is_blocked === params.isBlocked);
    }
    
    return {
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredUsers.length,
          totalPages: 1,
        },
      },
    };
  }

  async getUser(id: string) {
    await delay();
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: {
        user,
        profile: {
          user_id: id,
          city: 'Москва',
          street: 'Ленина',
          house_number: '10',
        },
      },
    };
  }

  async blockUser(id: string, isBlocked: boolean) {
    await delay();
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      success: true,
      data: {
        user: { ...user, is_blocked: isBlocked },
      },
    };
  }

  async verifyExecutor(id: string, isVerified: boolean) {
    await delay();
    
    return {
      success: true,
      data: {
        profile: {
          user_id: id,
          vehicle_number: 'А123БВ',
          vehicle_capacity: 5,
          is_verified: isVerified,
          is_working: false,
          rating: 4.5,
          completed_orders_count: 10,
        },
      },
    };
  }

  // Payments
  async getPayments(params?: any) {
    await delay();
    
    let filteredPayments = [...mockPayments];
    
    if (params?.status) {
      filteredPayments = filteredPayments.filter(p => p.status === params.status);
    }
    
    return {
      success: true,
      data: {
        payments: filteredPayments,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredPayments.length,
          totalPages: 1,
        },
        totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      },
    };
  }

  async refundPayment(id: string) {
    await delay();
    
    const payment = mockPayments.find(p => p.id === id);
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    return {
      success: true,
      data: {
        payment: { ...payment, status: 'refunded' },
      },
    };
  }

  // Support Tickets
  async getTickets(params?: any) {
    await delay();
    
    let filteredTickets = [...mockTickets];
    
    if (params?.status) {
      filteredTickets = filteredTickets.filter(t => t.status === params.status);
    }
    
    return {
      success: true,
      data: {
        tickets: filteredTickets,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTickets.length,
          totalPages: 1,
        },
      },
    };
  }

  async getTicket(id: string) {
    await delay();
    
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return {
      success: true,
      data: {
        ticket,
        messages: [
          {
            id: 'msg-1',
            ticket_id: id,
            sender_id: ticket.user_id,
            sender_role: ticket.user_role,
            content: ticket.description,
            created_at: ticket.created_at,
          },
        ],
      },
    };
  }

  async replyToTicket(id: string, content: string) {
    await delay();
    
    return {
      success: true,
      data: {
        message: {
          id: 'msg-' + Date.now(),
          ticket_id: id,
          sender_id: 'admin-1',
          sender_role: 'admin',
          content,
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  async updateTicketStatus(id: string, status: string) {
    await delay();
    
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return {
      success: true,
      data: {
        ticket: { ...ticket, status },
      },
    };
  }

  // Analytics
  async getAnalytics(params?: any) {
    await delay();
    
    return {
      success: true,
      data: mockAnalytics,
    };
  }

  // Generic methods for compatibility
  async get<T>(url: string, params?: any): Promise<T> {
    const urlParts = url.split('/');

    if (url.includes('/auth/me')) {
      return this.me() as T;
    } else if (url.includes('/admin/orders')) {
      return this.getOrders(params) as T;
    } else if (url.includes('/admin/users')) {
      const userId = urlParts[urlParts.length - 1];
      if (userId && userId !== 'users') {
        return this.getUser(userId) as T;
      }
      return this.getUsers(params) as T;
    } else if (url.includes('/admin/payments')) {
      return this.getPayments(params) as T;
    } else if (url.includes('/admin/tickets')) {
      const ticketId = urlParts[urlParts.length - 1];
      if (ticketId && ticketId !== 'tickets') {
        return this.getTicket(ticketId) as T;
      }
      return this.getTickets(params) as T;
    } else if (url.includes('/admin/analytics')) {
      return this.getAnalytics(params) as T;
    }
    
    throw new Error('Unknown endpoint');
  }

  async post<T>(url: string, data?: any): Promise<T> {
    if (url.includes('/auth/request-code')) {
      return this.requestCode(data?.email, data?.role) as T;
    } else if (url.includes('/auth/verify-code')) {
      return this.verifyCode(data?.email, data?.code, data?.role) as T;
    } else if (url.includes('/auth/logout')) {
      return this.logout() as T;
    } else if (url.includes('/auth/admin/login')) {
      return this.login(data.phone_number, data.password) as T;
    } else if (url.includes('/assign')) {
      const orderId = url.split('/')[3];
      return this.assignExecutor(orderId, data.executor_id) as T;
    } else if (url.includes('/reply')) {
      const ticketId = url.split('/')[3];
      return this.replyToTicket(ticketId, data.content) as T;
    } else if (url.includes('/refund')) {
      const paymentId = url.split('/')[3];
      return this.refundPayment(paymentId) as T;
    }
    
    throw new Error('Unknown endpoint');
  }

  async put<T>(url: string, data?: any): Promise<T> {
    if (url.includes('/block')) {
      const userId = url.split('/')[3];
      return this.blockUser(userId, data.isBlocked) as T;
    } else if (url.includes('/verify')) {
      const userId = url.split('/')[3];
      return this.verifyExecutor(userId, data.isVerified) as T;
    } else if (url.includes('/status')) {
      const ticketId = url.split('/')[3];
      return this.updateTicketStatus(ticketId, data.status) as T;
    } else if (url.includes('/orders/')) {
      const orderId = url.split('/')[3];
      return this.updateOrder(orderId, data) as T;
    }
    
    throw new Error('Unknown endpoint');
  }

  async delete<T>(url: string, _config?: any): Promise<T> {
    throw new Error('Delete not implemented in mock');
  }
}

export default new MockApiService();
