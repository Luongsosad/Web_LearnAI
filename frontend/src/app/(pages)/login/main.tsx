'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { SessionStorage } from '@/storage/sessionStorage';
import { EmailLoginStorage } from '@/storage/localStorage';
import LoadedOverlay from '@/components/LoadedOverlay';
import Notify from '@/components/Notify';
import { User } from '@/types/User';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false); // ✅ Biến riêng để disable
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const user = await SessionStorage.getUser(
        (loading) => setLoading(loading),
        (user) => setUser(user)
      );
      if (user) {
        router.push('/');
      } else {
        setLoading(false);
      }
    }
    fetchUser();
    const email = EmailLoginStorage.getEmail();
    if (email) {
      setEmail(email);
    }
  }, [router]);

  // Hàm đăng nhập thường
  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsDisabled(true);
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (res.status !== 200) throw new Error('Lỗi API');
      EmailLoginStorage.saveEmail(email);
      setMessage('Đăng nhập thành công!');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      setIsDisabled(false); // ✅ Cho phép nhập lại khi thất bại
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng nhập Google
  const handleGoogleLogin = (): void => {
    setIsDisabled(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#111111] text-white px-4">
      <div className="w-full max-w-md bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626]">
        <div className="flex flex-col items-center mb-6">
          <UserCircle className="w-12 h-12 text-blue-400 mb-2" />
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center border border-gray-600 rounded-lg p-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="Gmail"
              className="bg-transparent w-full outline-none text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
            />
          </div>

          <div className="flex items-center border border-gray-600 rounded-lg p-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="bg-transparent w-full outline-none text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isDisabled}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-lg flex justify-center items-center ${
              isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isDisabled}
          >
            Đăng nhập
          </button>
        </form>

        <div className="text-center text-gray-500 text-sm mt-4">Hoặc đăng nhập bằng</div>

        <div className="flex justify-between space-x-4 mt-4">
          <button
            onClick={handleGoogleLogin}
            className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm ${
              isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
            }`}
            disabled={isDisabled}
          >
            <Mail className="w-4 h-4 mr-2" />
            Google
          </button>
        </div>

        <div className="text-center text-sm mt-4">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-blue-400 hover:underline"
            disabled={isDisabled}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
      {loading && <LoadedOverlay />}
      {user && <></>}
      <Notify message={message} type="success" duration={2000} onClose={() => setMessage(null)} />
    </div>
  );
}
