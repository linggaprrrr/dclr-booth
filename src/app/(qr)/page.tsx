'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import QrScanner from 'qr-scanner';
import { LoadingSpinner } from "@/components/LoadingSpinner";
import axios from 'axios'
import { useFullscreen } from "@/context/FullscreenContext";
import { useData } from "@/context/DataContext";

export default function QR() {
  const {push} = useRouter()
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('')
  const videoRef = useRef(null);
  const scannerRef = useRef<any>(null);
  const {isFullscreen, fullscreenSupported, toggleFullscreen} = useFullscreen()
  const {setTransactionId} = useData()

  useEffect(() => {
    //@ts-ignore
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && isFullscreen) {
      startScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, [isFullscreen]);

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

  const checkQR = async (data: any) => {
    try {
      setError('')
      setIsScanning(false);
      const qrData = JSON.parse(data.data)
      const res = await axios.put(`${process.env.NEXT_PUBLIC_REMOTE_SERVER}/transactions/${qrData.transactionId}/start-session`, {}, {
        headers: {
          'x-api-key': 'sHCEtVx2mVXIa6ZUkigfd'
        }
      })
      if (!res.data || !res.data.data || !res.data.data.status || res.data.data.status !== 'in_booth', res.data.data.status !== 'in_booth') {
        throw new Error('')
      }
      setTransactionId(qrData.transactionId)
      push('/photo')
    } catch (ex: any) {
      setError('QR code tidak valid.')
      setIsScanning(true);
    } finally {
      setScanResult('')
    }
  }

  if (!isFullscreen && fullscreenSupported) {
    return (
      <main 
        className="w-screen h-screen bg-black flex flex-col justify-center items-center gap-10"
        onClick={toggleFullscreen}
      >
        <h1 className="text-white font-bold text-3xl">
          Ask for Full Screen
        </h1>
        <button
            className="rounded-3xl bg-primary py-1 px-8 cursor-pointer"
            // onClick={toggleFullscreen}
          >
            <span className="text-white font-bold text-lg">
              Allow Full Screen
            </span>
          </button>
      </main>
    )
  }

  return (
    <main 
      className="w-screen h-screen bg-black flex flex-col justify-center items-center gap-10"
      style={{cursor: isFullscreen ? 'none' : ''}}
    >
      <h1 className="text-white font-bold text-3xl">
        Scan QR Code
      </h1>

      <div className="w-[30%] h-[40%] relative rounded-xl">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover rounded-xl -rotate-90" />
        
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
          <p className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-base font-semibold text-red-400 text-center">
            {error}
          </p>
        }
      </div>
    </main>
  )
}