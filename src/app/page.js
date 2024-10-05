"use client";

import FileShare from '@/component/FileShare';
import { useState, useRef } from 'react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-5">File Bridge App</h1>
      <FileShare />
    </div>
  );
}
