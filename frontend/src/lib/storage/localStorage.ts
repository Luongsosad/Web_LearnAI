export class EmailLoginStorage {
  private static key = 'email-login';

  // Lưu email vào localStorage
  static saveEmail(email: string): void {
    try {
      localStorage.setItem(this.key, JSON.stringify({ email }));
    } catch (err) {
      console.error('Error saving email to localStorage:', err);
    }
  }

  // Lấy email từ localStorage
  static getEmail(): string | null {
    try {
      const storedData = localStorage.getItem(this.key);
      if (storedData) {
        const data = JSON.parse(storedData);
        return data.email || null;
      }
      return null;
    } catch (err) {
      console.error('Error retrieving email from localStorage:', err);
      return null;
    }
  }

  // Xóa email khỏi localStorage
  static clearEmail(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (err) {
      console.error('Error removing email from localStorage:', err);
    }
  }
}
