"use client";

import { useState, useRef, useCallback } from "react";

interface ResumeDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function ResumeDropzone({ onFileSelect }: ResumeDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);
      if (file.type !== "application/pdf") {
        setError("Only PDF files are accepted.");
        return false;
      }
      if (file.size > MAX_SIZE) {
        setError("File must be under 5MB.");
        return false;
      }
      return true;
    },
    [MAX_SIZE]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragOver
            ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
            : selectedFile
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-white/15 bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleInputChange}
          className="hidden"
          id="resume-upload"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            {/* File icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <svg
                className="h-8 w-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {formatSize(selectedFile.size)} · Click or drop to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Upload icon */}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                isDragOver ? "bg-violet-500/20" : "bg-white/5"
              }`}
            >
              <svg
                className={`h-8 w-8 transition-colors ${
                  isDragOver ? "text-violet-400" : "text-zinc-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isDragOver ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Drag & drop a PDF or click to browse · Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-center text-sm font-medium text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
