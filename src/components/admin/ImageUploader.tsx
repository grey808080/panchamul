'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, maxFiles = 4 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    setUploading(true);
    const newImages = [...images];

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        newImages.push(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      }
    }

    onChange(newImages);
    setUploading(false);
  }, [images, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    disabled: uploading || images.length >= maxFiles
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'}
          ${uploading || images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center text-slate-500">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <PhotoIcon className="h-10 w-10 text-slate-400 mb-2" />
            <p className="font-medium text-slate-700">Drop images here, or click to select</p>
            <p className="text-sm mt-1">PNG, JPG up to 5MB ({images.length}/{maxFiles})</p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-slate-200 group bg-slate-100">
              <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              {i === 0 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  Main Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
