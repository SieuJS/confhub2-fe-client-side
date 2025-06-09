import React, { useState, useEffect } from 'react';
import { PhotoIcon, LinkIcon } from '@heroicons/react/24/solid';

interface ImageUploaderProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  t: (key: string) => string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, setImageUrl, t }) => {
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cập nhật preview nếu imageUrl thay đổi từ bên ngoài
    setPreview(imageUrl);
  }, [imageUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setError(null);

    // Cố gắng hiển thị preview, nếu lỗi thì báo
    if (url) {
      const img = new Image();
      img.src = url;
      img.onload = () => setPreview(url);
      img.onerror = () => {
        setPreview(null);
        setError(t('Invalid_image_URL_or_CORS_policy_issue'));
      };
    } else {
      setPreview(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{t('Conference_Banner_Image')}</label>
      <div className="mt-2 flex items-center gap-x-4">
        {/* Preview Image */}
        <div className="h-24 w-48 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <PhotoIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
          )}
        </div>

        {/* Input for URL */}
        <div className="w-full">
            <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder={t('Paste_image_URL_here')}
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <p className="mt-1 text-xs text-gray-500">
                {t('A_landscape_image_is_recommended_e_g_1200x630px')}
            </p>
        </div>

      </div>
       {/* Gợi ý thêm: Bạn có thể thêm một nút "Upload" ở đây để tích hợp với dịch vụ lưu trữ (S3, Cloudinary, ...) */}
    </div>
  );
};

export default ImageUploader;