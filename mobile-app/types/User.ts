type Order = {
  id: number;
  email: string;
  image: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string;
  plan_id: number;
  created_at: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  plan_id: number;
  plan_expires_at?: string | null;
  avatar?: string | null;
  orders?: Order[];
};

export type { User, Order }; 