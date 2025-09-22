'use client';
import React, { useRef, useState, useEffect } from 'react';
import { Plus, Settings2, Mic, Send, Copy, RefreshCw, Sidebar, X, History } from 'lucide-react';
import axios from 'axios';
import { useSidebarStore } from '@/lib/storage/sidebarState';
import LoadedOverlay from '@/components/LoadedOverlay';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { PATH } from '@/lib/contants/path';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export default function Main() {
  const { toggle } = useSidebarStore();
  const cancelAudioRef = useRef(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push(PATH.LOGIN);
    } else if (user?.plan_id && user?.plan_id >= 1) {
      setLoading(false);
      setIsAuthorized(true);
    } else {
      router.push(PATH.PLANS);
    }
  }, [user]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setText(e.currentTarget.value);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => console.log('Đã sao chép nội dung!'),
      (err) => console.error('Lỗi khi sao chép:', err)
    );
  };

  const sendMessage = async (prompt?: string, isRegenerate: boolean = false) => {
    const inputPrompt = prompt || text.trim();
    if (!inputPrompt) return;

    if (isRegenerate) {
      setMessages((prev) => prev.slice(0, -1));
    } else {
      const userMessage: Message = { role: 'user', content: inputPrompt };
      setMessages((prev) => [...prev, userMessage]);
      setText('');
      // Đặt lại chiều cao của textarea
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }

    setIsThinking(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          prompt: inputPrompt,
          history: messages.slice(-20),
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (res.status !== 200) throw new Error('Lỗi API');

      const botMessage: Message = {
        role: 'bot',
        content: res.data.script || 'Không có phản hồi.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      const botMessage: Message = {
        role: 'bot',
        content: isRegenerate
          ? 'Lỗi khi tạo lại phản hồi, vui lòng thử lại.'
          : 'Lỗi khi lấy phản hồi, vui lòng thử lại.',
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const regenerateMessage = () => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find((msg) => msg.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (cancelAudioRef.current) {
          cancelAudioRef.current = false;
          return;
        }
        setIsProcessingAudio(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'recording.webm');

        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/audio`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          });

          if (res.status !== 200) throw new Error('Lỗi chuyển đổi âm thanh');

          const transcribedText = res.data.text || '';
          if (transcribedText) {
            setIsProcessingAudio(false);
            await sendMessage(transcribedText);
          } else {
            setMessages((prev) => [
              ...prev,
              { role: 'bot', content: 'Không thể chuyển đổi âm thanh thành văn bản.' },
            ]);
          }
        } catch (error) {
          console.error('Lỗi khi gửi âm thanh:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'bot', content: 'Lỗi khi xử lý âm thanh, vui lòng thử lại.' },
          ]);
        } finally {
          setIsProcessingAudio(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Lỗi khi truy cập micro:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Lỗi khi truy cập micro, vui lòng kiểm tra quyền truy cập.' },
      ]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      cancelAudioRef.current = true;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      audioChunksRef.current = [];
      setIsRecording(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isProcessingAudio]);

  if (!isAuthorized) return null;

  return (
    <div className="w-full flex flex-col h-screen text-white overflow-hidden">
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <button className="text-gray-200 hover:text-white" onClick={() => toggle()}>
            <Sidebar size={24} />
          </button>
          <div className="text-xl font-semibold">Chat with AI</div>
          <button className="text-gray-200 hover:text-white" onClick={() => console.log('History')}>
            <History size={24} />
          </button>
        </div>
        <div className="text-center text-sm text-gray-400 mt-1 mb-1">Leaning by AI</div>
      </div>

      <div className="mt-[82px] mb-[100px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111] pb-7">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center h-[360px] items-center text-center text-gray-400 flex-grow">
            <h1 className="text-2xl font-medium mb-2">
              Chào {user?.username ? user.username : 'bạn'}?
            </h1>
            <h1 className="text-2xl font-medium">Tôi có thể giúp gì cho bạn?</h1>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex-col whitespace-pre-line flex items-start ${
                msg.role === 'user'
                  ? 'rounded-3xl p-3 pt-2 pb-2 max-w-[70%] bg-[#323232d9] self-end text-white'
                  : 'p-1 self-start text-gray-300'
              }`}
            >
              <div className="flex-1 whitespace-pre-line break-words">{msg.content}</div>
              {msg.role === 'bot' && idx === messages.length - 1 && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    aria-label="Sao chép tin nhắn"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={regenerateMessage}
                    aria-label="Tạo lại phản hồi"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {isThinking && (
          <div className="p-1 self-start text-gray-400 italic">Đang suy nghĩ câu trả lời...</div>
        )}
        {isProcessingAudio && (
          <div className="p-1 self-start text-gray-400 italic">Đang xử lý âm thanh...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#171717] p-6 rounded-xl shadow-lg border border-[#262626] flex flex-col items-center">
            <div className="flex items-center mb-4">
              <Mic size={24} className="text-red-500 animate-pulse mr-2" />
              <span className="text-lg text-white">Đang ghi âm...</span>
            </div>
            <div className="flex gap-3 w-full text-sm justify-center text-center mt-2">
              <button
                onClick={cancelRecording}
                className="justify-center w-[100px] bg-red-500 hover:bg-red-600 text-white py-2 px-2 rounded-lg flex items-center"
              >
                <X size={16} className="mr-2" />
                Hủy
              </button>
              <button
                onClick={stopRecording}
                className="justify-center w-[100px] bg-green-500 hover:bg-green-600 text-white py-2 px-2 rounded-lg flex items-center"
              >
                <Send size={16} className="mr-2" />
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 w-full md:w-[768px] z-10 px-3 py-2 bg-[#111111]">
        <div className="flex flex-col items-end gap-4 bg-[#202020] rounded-2xl px-4 py-2">
          <div className="flex-1 w-full">
            <textarea
              ref={textareaRef}
              value={text}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
              }}
              rows={1}
              placeholder="Hỏi bất kỳ điều gì"
              className="w-full bg-transparent resize-none overflow-hidden text-white placeholder-gray-400 focus:outline-none text-base pt-2"
            />
          </div>
          <div className="flex w-full justify-between pb-1">
            <div className="flex gap-2">
              <Plus size={20} className="text-white" />
              <Settings2 size={20} className="text-white" />
              <span className="text-sm">Công cụ</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startRecording}
                aria-label="Bắt đầu ghi âm"
                className="text-white"
                disabled={isRecording}
              >
                <Mic size={20} className={isRecording ? 'text-gray-500' : 'text-white'} />
              </button>
              <button
                onClick={() => sendMessage()}
                aria-label="Gửi tin nhắn"
                className="flex gap-3"
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <LoadedOverlay />}
    </div>
  );
}
