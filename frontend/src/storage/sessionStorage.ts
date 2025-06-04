import axios from 'axios';
import { User } from '@/types/User';

interface Transaction {
  transactionId: string;
    amount: number;
    bankAccount: string;
    accountHolder: string;
    bank: string;
    planName: string;
    qrCode: string;
    expiresAt: number;
}

export class SessionStorage {
  private static key = 'user';
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6789';

  static setTransaction(transaction: Transaction) {
    sessionStorage.setItem("transaction", JSON.stringify(transaction));
  }
  static getTransaction() {
    const data = sessionStorage.getItem("transaction");
    return data ? JSON.parse(data) : null;
  }
  static clearTransaction() {
    sessionStorage.removeItem("transaction");
  }

  // Lưu dữ liệu người dùng vào sessionStorage
  static saveUser(user: User): void {
    sessionStorage.setItem(this.key, JSON.stringify(user));
  }

  // Kiểm tra xem user có tồn tại trong sessionStorage không
  static hasUser(): boolean {
    return !!sessionStorage.getItem(this.key);
  }

  // Lấy dữ liệu người dùng từ sessionStorage, nếu không có thì gọi API
  static async getUser(
    setLoading?: (loading: boolean) => void,
    setUser?: (user: User | null) => void
  ): Promise<User | null> {
    try {
      const storedUser = sessionStorage.getItem(this.key);
      if (storedUser) {
        if (setUser) setUser(JSON.parse(storedUser));
        console.log("Đã đăng nhập!")
        return JSON.parse(storedUser);
      }

      if (setLoading) setLoading(true);

      const res = await axios.get(`${this.apiUrl}/a/profile`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.status !== 200) throw new Error("Lỗi API");

      if (!res.data.success) console.log("Chưa đăng nhập!");

      if (res.data.user) {
        this.saveUser(res.data.user);
        if (setUser) setUser(res.data.user);
        console.log("Đã đăng nhập!");
        console.log("Dữ liệu người dùng:", res.data.user);
        return res.data.user;
      }
      return null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching user data:', err.message);
      } else {
        console.error('Error fetching user data:', err);
      }
      this.clearUser();
      if (setUser) setUser(null);
      return null;
    }
    finally {
      if (setLoading) setLoading(false);
    }
  }


  // Xóa dữ liệu người dùng khỏi sessionStorage
  static clearUser(): void {
    sessionStorage.removeItem(this.key);
  }
}