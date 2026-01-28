'use client';

import Image from 'next/image';
import { getSampulUrl } from '@/lib/utils/url';
import { useEffect, useState } from 'react';

// Halaman ini PUBLIC untuk testing
export const dynamic = 'force-dynamic';

export default function TestImagePage() {
  const [mounted, setMounted] = useState(false);
  
  // Path dari database (contoh nyata dari data)
  const testPaths = [
    '/uploads/sampul/2026-01-13_gemini-generated-image-28q00d28q00d28q0_2a65a8d1ce51a0a1.png',
    'http://localhost:3000/uploads/sampul/2026-01-13_bg-app_c72602634595e765.jpg',
    '/uploads/naskah/2026-01-13_makalah-chapter1-daffa-robbani-23076007_b5fcbdc79fee73f9.docx'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Image URL Transformation</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>window.location.origin:</strong> {window.location.origin}</p>
        <p><strong>Expected Backend URL:</strong> https://publishify.me</p>
      </div>

      {testPaths.map((path, index) => {
        const transformedUrl = getSampulUrl(path);
        
        return (
          <div key={index} className="mb-8 p-4 border rounded">
            <h3 className="font-bold mb-2">Test #{index + 1}</h3>
            <div className="mb-2 text-sm">
              <p><strong>Original:</strong></p>
              <code className="bg-red-100 p-1 block">{path}</code>
            </div>
            <div className="mb-4 text-sm">
              <p><strong>Transformed:</strong></p>
              <code className="bg-green-100 p-1 block">{transformedUrl}</code>
            </div>
            
            {path.includes('.png') || path.includes('.jpg') ? (
              <div>
                <p className="mb-2"><strong>Image Preview:</strong></p>
                <Image 
                  src={transformedUrl} 
                  alt={`Test ${index + 1}`}
                  width={200}
                  height={200}
                  className="border"
                  onError={(e) => {
                    console.error('Image failed to load:', transformedUrl);
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', transformedUrl);
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500">File dokumen (tidak ada preview)</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
