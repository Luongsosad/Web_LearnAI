import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadedOverlay() {
  return (
    <div className="fixed inset-0 bg-[#1d1b1b] bg-opacity-70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-white text-sm animate-pulse">Đang xử lý...</span>
      </div>
    </div>
  );
}
