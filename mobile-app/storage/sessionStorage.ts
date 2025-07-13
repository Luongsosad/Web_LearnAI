import type { User } from '../types/User';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SessionStorage {
  private static key = 'user';
  private static apiUrl = 'http://localhost:6789';

  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.key, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  static async hasUser(): Promise<boolean> {
    try {
      const user = await AsyncStorage.getItem(this.key);
      return !!user;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const storedUser = await AsyncStorage.getItem(this.key);
      if (storedUser) return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error getting user from storage:', error);
    }
    
    // Nếu chưa có thì gọi API
    try {
      const res = await axios.get(`${this.apiUrl}/a/profile`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (res.status !== 200 || !res.data.user) return null;
      await this.saveUser(res.data.user);
      return res.data.user;
    } catch {
      await this.clearUser();
      return null;
    }
  }

  static async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.key);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  }
} 