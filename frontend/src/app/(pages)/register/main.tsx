'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { EmailLoginStorage } from '@/lib/storage/localStorage';
import LoadedOverlay from '@/components/LoadedOverlay';
import Notify from '@/components/Notify';
import { useAuth } from '@/contexts/auth.context';
import { PATH } from '@/lib/contants/path';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false); // ✅ quản lý disable
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push(PATH.HOME);
    } else {
      setIsAuthorized(true);
    }
  }, [user, router]);

  const handleContinue = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Vui lòng nhập email');
    setIsDisabled(true);
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-code`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setStep(2);
      setResendCooldown(90);
      setMessage('Mã xác thực đã được gửi!');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    } finally {
      setLoading(false);
      setIsDisabled(false);
    }
  };

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!username || !password || !code) return setError('Vui lòng nhập đầy đủ thông tin');
    setIsDisabled(true);
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        { username, email, password, code },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      if (res.status !== 201) throw new Error('Lỗi API');
      EmailLoginStorage.saveEmail(email);
      setMessage('Đăng ký thành công!');
      setTimeout(() => {
        router.push(PATH.LOGIN);
      }, 2500);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Đăng ký thất bại');
      setIsDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (resendCooldown > 0) return;
    setError('');
    setIsDisabled(true);
    try {
      setLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-code`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setResendCooldown(90);
      setMessage('Mã xác nhận đã được gửi lại!');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Không thể gửi lại mã xác nhận');
    } finally {
      setLoading(false);
      setIsDisabled(false);
    }
  };

  const handleGoogleLogin = (): void => {
    setIsDisabled(true);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  if (!isAuthorized) return null;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#111111] text-white px-4">
      <div className="w-full max-w-md bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626]">
        <div className="flex flex-col items-center mb-6">
          <UserCircle className="w-12 h-12 text-blue-400 mb-2" />
          <h1 className="text-2xl font-bold">{step === 1 ? 'Đăng ký' : 'Hoàn tất đăng ký'}</h1>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleContinue} className="space-y-4">
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
            <button
              type="submit"
              className={`w-full py-2 rounded-lg flex justify-center items-center ${
                isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={isDisabled}
            >
              Tiếp tục
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-2">
            <div className="flex items-center border border-gray-600 rounded-lg p-2">
              <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Tên người dùng"
                className="bg-transparent w-full outline-none text-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <div className="flex space-x-2">
              <div className="flex items-center border border-gray-600 rounded-lg p-2 flex-1">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Mã xác nhận"
                  className="bg-transparent w-full outline-none text-base"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isDisabled}
                />
              </div>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isDisabled}
                className={`w-[150px] py-2 rounded-lg text-sm ${
                  resendCooldown > 0 || isDisabled
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                Gửi lại mã {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
              </button>
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-lg flex justify-center items-center ${
                isDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              disabled={isDisabled}
            >
              Đăng ký
            </button>
          </form>
        )}

        <div className="text-center text-gray-500 text-sm mt-4">Hoặc đăng ký bằng</div>

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
          Đã có tài khoản?{' '}
          <button
            onClick={() => router.push(PATH.LOGIN)}
            className="text-blue-400 hover:underline"
            disabled={isDisabled}
          >
            Đăng nhập
          </button>
        </div>
      </div>

      {loading && <LoadedOverlay />}
      {user && <></>}
      <Notify message={message} type="success" duration={2500} onClose={() => setMessage(null)} />
    </div>
  );
}
