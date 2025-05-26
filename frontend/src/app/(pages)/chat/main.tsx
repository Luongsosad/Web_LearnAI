"use client";
import React, { useRef, useState, useEffect } from "react";
import { Plus, Settings2, Mic, Send } from "lucide-react";
import axios from "axios";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Main() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setText(e.currentTarget.value);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setText("");

    try {
      // Kiểm tra API có sẵn bằng ping
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ping`);

      // Gửi yêu cầu POST tới endpoint /chat
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        prompt: text.trim(),
        history: messages.slice(-20), // Giới hạn 20 tin nhắn cuối
      }, {
        headers: { "Content-Type": "application/json" },
      });

      // Kiểm tra trạng thái phản hồi
      if (res.status !== 200) throw new Error("Lỗi API");

      const botMessage: Message = {
        role: "bot",
        content: res.data.script || "Không có phản hồi.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      const botMessage: Message = {
        role: "bot",
        content: "Lỗi khi lấy phản hồi, vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col max-h-screen text-white overflow-hidden custom-scroll">
      {/* Header - Cố định ở trên */}
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="w-6 h-6 border rounded-full border-white" />
          <div className="text-xl font-semibold">Learning By AI</div>
          <div className="w-6 h-6 border rounded-full border-white" />
        </div>
        <div className="text-center text-sm text-gray-400 mt-2">Bộ nhớ đã lưu đã đầy</div>
      </div>

      <div className="mt-[82px] mb-[100px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111]">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center h-[360px] items-center text-center text-gray-400 flex-grow">
            <h1 className="text-2xl font-medium">Chào Lương?</h1>
            <h1 className="text-2xl font-medium">Tôi có thể giúp gì cho bạn?</h1>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-line ${msg.role === "user"
                  ? "rounded-3xl p-3 pt-2 pb-2 max-w-[70%] bg-[#323232d9] self-end text-white"
                  : "p-1 self-start text-gray-300"
                }`}
            >
              {msg.content}
            </div>
          ))
        )}

        {/* div ẩn để scroll tới */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Cố định ở dưới */}
      <div className="fixed bottom-0 left-0 w-full z-10 px-3 py-2 bg-[#111111]">
        <div className="flex flex-col items-end gap-4 bg-[#202020] rounded-2xl px-4 py-2">
          <div className="flex-1 w-full">
            <textarea
              ref={textareaRef}
              value={text}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
            <button onClick={sendMessage} aria-label="Gửi tin nhắn" className="flex gap-3">
              <Mic size={20} className="text-white" />
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}