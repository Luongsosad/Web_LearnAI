import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export class SessionStorage {
  private static key = 'user';
  private static apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6789';

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
        return res.data.user;
      }
      return null;
    } catch (err) {
      console.error('Error fetching user data:', (err as any).message);
      this.clearUser();
      if (setUser) setUser(null);
      return null;
    } finally {
      if (setLoading) setLoading(false);
    }
  }


  // Xóa dữ liệu người dùng khỏi sessionStorage
  static clearUser(): void {
    sessionStorage.removeItem(this.key);
  }
}