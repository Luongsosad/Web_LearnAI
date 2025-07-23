'use client';
import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceIndicatorProps {
  isListening: boolean;
  isMuted?: boolean;
  level?: number; // 0-100
}

export default function VoiceIndicator({ 
  isListening, 
  isMuted = false, 
  level = 0 
}: VoiceIndicatorProps) {
  const getWaveformBars = () => {
    const bars = [];
    const barCount = 8;
    const maxHeight = 24;
    
    for (let i = 0; i < barCount; i++) {
      const height = isListening 
        ? Math.max(2, (level / 100) * maxHeight * (0.3 + Math.random() * 0.7))
        : 2;
      
      bars.push(
        <div
          key={i}
          className={`bg-current rounded-full transition-all duration-150 ${
            isListening ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${height}px`,
            animationDelay: `${i * 50}ms`
          }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Icon */}
      <div className="relative">
        {isListening ? (
          <div className="relative">
            <Mic 
              size={24} 
              className={`${
                isMuted ? 'text-gray-500' : 'text-red-500'
              } animate-pulse`} 
            />
            {!isMuted && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
            )}
          </div>
        ) : (
          <MicOff 
            size={24} 
            className="text-gray-400" 
          />
        )}
      </div>

      {/* Waveform */}
      <div className="flex items-end space-x-1 h-6">
        {getWaveformBars()}
      </div>

      {/* Status Text */}
      <div className="text-sm font-medium">
        {isListening ? (
          <span className={isMuted ? 'text-gray-500' : 'text-green-400'}>
            {isMuted ? 'Đã tắt âm' : 'Đang lắng nghe...'}
          </span>
        ) : (
          <span className="text-gray-400">Sẵn sàng</span>
        )}
      </div>

      {/* Mute Indicator */}
      {isMuted && (
        <Volume2 
          size={16} 
          className="text-yellow-400" 
        />
      )}
    </div>
  );
} 