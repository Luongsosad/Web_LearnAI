"use client";
import React, { useRef, useState, useEffect } from "react";
import { Plus, Settings2, Mic, Send, Copy, RefreshCw } from "lucide-react";
import axios from "axios";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function Main() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    setText(e.currentTarget.value);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => console.log("Đã sao chép nội dung!"),
      (err) => console.error("Lỗi khi sao chép:", err)
    );
  };

  const sendMessage = async (prompt?: string, isRegenerate: boolean = false) => {
    const inputPrompt = prompt || text.trim();
    if (!inputPrompt) return;

    if (isRegenerate) {
      setMessages((prev) => prev.slice(0, -1));
    } else {
      const userMessage: Message = { role: "user", content: inputPrompt };
      setMessages((prev) => [...prev, userMessage]);
      setText("");
    }

    setIsThinking(true);

    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/ping`);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        {
          prompt: inputPrompt,
          history: messages.slice(-20),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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
        content: isRegenerate
          ? "Lỗi khi tạo lại phản hồi, vui lòng thử lại."
          : "Lỗi khi lấy phản hồi, vui lòng thử lại.",
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
      .find((msg) => msg.role === "user");
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audioFile", audioBlob, "recording.webm");

          try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/audio`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.status !== 200) throw new Error("Lỗi chuyển đổi âm thanh");

            const transcribedText = res.data.text || "";
            if (transcribedText) {
              await sendMessage(transcribedText);
            } else {
              setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Không thể chuyển đổi âm thanh thành văn bản." },
              ]);
            }
          } catch (error) {
            console.error("Lỗi khi gửi âm thanh:", error);
            setMessages((prev) => [
              ...prev,
              { role: "bot", content: "Lỗi khi xử lý âm thanh, vui lòng thử lại." },
            ]);
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Lỗi khi truy cập micro:", error);
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Lỗi khi truy cập micro, vui lòng kiểm tra quyền truy cập." },
        ]);
      }
    } else {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col max-h-screen text-white overflow-hidden custom-scroll">
      <div className="fixed top-0 left-0 w-full bg-[#111111]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="w-6 h-6 border Rounded-full border-white" />
          <div className="text-xl font-semibold">Learning By AI</div>
          <div className="w-6 h-6 border rounded-full border-white" />
        </div>
        <div className="text-center text-sm text-gray-400 mt-2">Bộ nhớ đã lưu đã đầy</div>
      </div>

      <div className="mt-[82px] mb-[100px] flex-1 flex flex-col px-4 py-4 overflow-y-auto h-full space-y-4 custom-scroll bg-[#111111] pb-7">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center h-[360px] items-center text-center text-gray-400 flex-grow">
            <h1 className="text-2xl font-medium">Chào Lương?</h1>
            <h1 className="text-2xl font-medium">Tôi có thể giúp gì cho bạn?</h1>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex-col whitespace-pre-line flex items-start ${msg.role === "user"
                ? "rounded-3xl p-3 pt-2 pb-2 max-w-[70%] bg-[#323232d9] self-end text-white"
                : "p-1 self-start text-gray-300"
                }`}
            >
              <div className="flex-1">{msg.content}</div>
              {msg.role === "bot" && idx === messages.length - 1 && (
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
          <div className="p-1 self-start text-gray-400 italic">
            Đang suy nghĩ câu trả lời...
          </div>
        )}
        {isRecording && (
          <div className="p-1 self-start text-gray-400 italic">
            Đang ghi âm...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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
            <div className="flex gap-3">
              <button
                onClick={toggleRecording}
                aria-label={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                className="text-white"
              >
                <Mic
                  size={20}
                  className={isRecording ? "text-red-500 animate-pulse" : "text-white"}
                />
              </button>
              <button onClick={() => sendMessage()} aria-label="Gửi tin nhắn" className="flex gap-3">
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
}