'use client';
import React from 'react';
import Main from './main';

export default function BilingualStoryPage() {
  return (
    <div className="overflow-hidden h-screen flex w-full mx-auto custom-scroll">
      <div className="w-[0] md:w-full"></div>
      <div className="w-full h-screen md:min-w-[768px]">
        <Main />
      </div>
      <div className="w-[0] md:w-full"></div>
    </div>
  );
}
