'use client';

import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { Upload, Loader2, Check, X } from 'lucide-react';

export default function UploadButton({ 
  endpoint = 'imageUploader', // 'imageUploader' | 'audioUploader'
  onUploadComplete,
  onUploadError,
  accept,
  className = '',
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress(0);
      if (res?.[0]?.url) {
        onUploadComplete?.(res[0].url);
      }
    },
    onUploadError: (err) => {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message || 'Erro no upload');
      onUploadError?.(err);
      setTimeout(() => setError(null), 3000);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    
    try {
      await startUpload([file]);
    } catch (err) {
      console.error('Upload error:', err);
      setIsUploading(false);
      setError('Falha no upload');
    }
  }, [startUpload]);

  return (
    <div className={className}>
      <label className="cursor-pointer">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <div
          className={`
            w-full py-3 border-2 border-dashed rounded-lg text-sm font-medium 
            flex items-center justify-center gap-2 transition-all
            ${isUploading 
              ? 'border-accent bg-accent/5 text-accent cursor-wait' 
              : error
              ? 'border-red-300 text-red-500 hover:border-red-400'
              : 'border-gray-300 text-gray-400 hover:border-accent hover:text-accent'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Enviando... {uploadProgress}%
            </>
          ) : error ? (
            <>
              <X size={16} />
              {error}
            </>
          ) : (
            <>
              <Upload size={16} />
              Clique para enviar
            </>
          )}
        </div>
      </label>
    </div>
  );
}
