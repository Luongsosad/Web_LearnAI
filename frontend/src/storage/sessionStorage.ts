interface User {
  username: string;
  email: string;
  token: string;
}

export class SessionStorage {
  private static key = "username";

  // Lưu dữ liệu người dùng vào sessionStorage
  static saveUser(user: User): void {
    sessionStorage.setItem(this.key, JSON.stringify(user));
  }

  // Lấy dữ liệu người dùng từ sessionStorage
  static getUser(): User | null {
    try {
      const storedUser = sessionStorage.getItem(this.key);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error("Error parsing sessionStorage data:", err);
      return null;
    }
  }

  // Xóa dữ liệu người dùng khỏi sessionStorage
  static clearUser(): void {
    sessionStorage.removeItem(this.key);
  }
}