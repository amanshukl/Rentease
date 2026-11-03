import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'user' | 'admin';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'user' | 'admin';
  }
}

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  monthlyRent: number;
  securityDeposit: number;
  tenure: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
}
