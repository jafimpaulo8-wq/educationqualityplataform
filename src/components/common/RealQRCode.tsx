import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface RealQRCodeProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const RealQRCode: React.FC<RealQRCodeProps> = ({
  value,
  size = 140,
  className = '',
  darkColor = '#090d16',
  lightColor = '#ffffff'
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR code generation failed:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-slate-100 animate-pulse rounded-lg flex items-center justify-center ${className}`}
      >
        <span className="text-[10px] text-slate-400 font-mono">Gerando QR...</span>
      </div>
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt="QR Code" 
      width={size} 
      height={size} 
      className={`rounded-lg object-contain ${className}`} 
    />
  );
};
