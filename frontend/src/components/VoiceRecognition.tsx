'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import VoiceIndicator from './VoiceIndicator';

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  language?: string;
}

export default function VoiceRecognition({
  onTranscript,
  isListening,
  onListeningChange,
  language = 'vi-VN'
}: VoiceRecognitionProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, _setAudioLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  useEffect(() => {
    // Kiểm tra hỗ trợ Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        console.log('Voice recognition started');
        onListeningChange(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Tự động restart nếu không có giọng nói
          setTimeout(() => {
            if (isListening) {
              recognition.start();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        onListeningChange(false);
        // Tự động restart nếu vẫn đang trong chế độ listening
        if (isListening) {
          setTimeout(() => {
            recognition.start();
          }, 100);
        }
      };
    }
  }, [language, onListeningChange, onTranscript, isListening]);

  const toggleListening = () => {
    if (!isSupported) return;

    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 text-gray-500">
        <p>Trình duyệt không hỗ trợ nhận diện giọng nói</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleListening}
          className={`relative p-4 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/50'
          }`}
        >
          {isListening ? (
            <MicOff size={24} className="animate-pulse" />
          ) : (
            <Mic size={24} />
          )}
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className={`p-3 rounded-full transition-all duration-300 ${
            isMuted
              ? 'bg-gray-500 hover:bg-gray-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Voice Indicator */}
      <div className="flex justify-center">
        <VoiceIndicator 
          isListening={isListening} 
          isMuted={isMuted}
          level={audioLevel}
        />
      </div>

      {/* Interim Transcript */}
      {interimTranscript && (
        <div className="w-full max-w-md p-3 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-300 italic">Đang nghe: {interimTranscript}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-xs text-gray-500 max-w-sm">
        <p>Nói tự nhiên, AI sẽ tự động nhận diện và trả lời</p>
        <p>Không cần bấm nút ghi âm liên tục</p>
      </div>
    </div>
  );
} 