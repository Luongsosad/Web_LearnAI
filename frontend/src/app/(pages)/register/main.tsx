'use client';
import React, { useState } from 'react';
import { Mail, Lock, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { SessionStorage } from '@/storage/sessionStorage';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const handleContinue = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    // try {
    //   await axios.post<ApiResponse>(
    //     `${process.env.NEXT_PUBLIC_API_URL}/auth/send-verification-code`,
    //     { email },
    //     { withCredentials: true }
    //   );
    //   setStep(2);
    //   setResendCooldown(90);
    // } catch (err) {
    //   const error = err as AxiosError<{ message: string }>;
    //   setError(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    // }

    setStep(2);
    setResendCooldown(90);
  };

  const handleResendCode = async (): Promise<void> => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/send-verification-code`,
        { email },
        { headers: { "Content-Type": "application/json" }, }
      );
      setResendCooldown(90);
      alert('Mã xác nhận đã được gửi lại!');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || 'Không thể gửi lại mã xác nhận');
    }
  };

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!username || !password) { //|| !code
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    console.log(username, email, password)
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        { username, email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status !== 201) throw new Error("Lỗi API");
      if (res.data.user) {
        SessionStorage.saveUser(res.data.user);
        window.location.href = `/login`;
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      console.log(error)
      setError(error.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleGoogleLogin = (): void => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#111111] text-white px-4">
      <div className="w-full max-w-md bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626]">
        <div className="flex flex-col items-center mb-6">
          <UserCircle className="w-12 h-12 text-blue-400 mb-2" />
          <h1 className="text-2xl font-bold">{step === 1 ? 'Đăng ký' : 'Hoàn tất đăng ký'}</h1>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-4">
          {step === 1 ? (
            <form onSubmit={handleContinue}>
              <div className="flex items-center border border-gray-600 rounded-lg p-2">
                <Mail className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Gmail"
                  className="bg-transparent w-full outline-none text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center mt-4"
              >
                Tiếp tục
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className='flex flex-col gap-2'>
              <div className="flex items-center border border-gray-600 rounded-lg p-2">
                <UserCircle className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Tên người dùng"
                  className="bg-transparent w-full outline-none text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="flex items-center border border-gray-600 rounded-lg p-2">
                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  className="bg-transparent w-full outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex items-center border border-gray-600 rounded-lg p-2 flex-1">
                  <Mail className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Mã xác nhận"
                    className="bg-transparent w-full outline-none text-sm"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className={`w-[150px] py-2 rounded-lg flex justify-center items-center text-sm ${resendCooldown > 0
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                >
                  Gửi lại mã {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center"
              >
                Đăng ký
              </button>
            </form>
          )}

          <div className="text-center text-gray-500 text-sm mt-4">Hoặc đăng ký bằng</div>

          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={handleGoogleLogin}
              className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 py-2 rounded-lg text-sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Google
            </button>
          </div>

          <div className="text-center text-sm mt-4">
            Đã có tài khoản?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-400 hover:underline"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}