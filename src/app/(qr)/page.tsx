'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QrScanner from 'qr-scanner';
import { LoadingSpinner } from "@/components/LoadingSpinner";
import axios from 'axios'

export default function QR() {
  const {replace} = useRouter()
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('')
  const videoRef = useRef(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    //@ts-ignore
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      startScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      scannerRef.current = new QrScanner(
        videoRef.current, 
        async result => {
          setScanResult(result.data);
          await checkQR({
            data: result.data
          })
        },
        {
          onDecodeError: error => {},
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      await scannerRef.current.start();
    } catch (error) {
      setIsScanning(false);
    }
  };

  const checkQR = async (payload: any) => {
    try {
      setError('')
      setIsScanning(false);
      await new Promise((res) => setTimeout(() => res(''), 500))
      replace('/photo')
    } catch (ex: any) {
      setError('QR code tidak valid.')
      setIsScanning(true);
    } finally {
      setScanResult('')
    }
  }

  return (
    <main className="w-screen h-screen bg-black flex flex-col justify-center items-center gap-10">
      <h1 className="text-white font-bold text-3xl">
        Scan QR Code
      </h1>

      <div className="w-[30%] h-[40%] relative rounded-xl">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover rounded-xl" />
        
        {(!isScanning && scanResult) &&
          <div 
            className={`
              absolute 
              top-0 
              backdrop-blur-lg 
              bg-white/20 
              border 
              border-white/30 
              rounded-xl 
              w-full 
              h-full
              flex
              justify-center
              items-center
            `}
          >
            <LoadingSpinner 
              size={64} 
              strokeWidth={6} 
              color="#FF7590" 
              secondaryColor="#fff"
              speed={0} />
          </div>
        }
      
        {error.length &&
          <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-base font-semibold text-red-500 text-center">
            {error} QR code tidak valid
          </p>
        }
      </div>
    </main>
  )
}