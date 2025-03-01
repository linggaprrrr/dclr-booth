'use client'

import ModalFinish from "@/components/Modal";
import React, { useRef, useState, useEffect } from 'react';
import ModalPhotoPreview from "@/components/ModalPhoto";
import axios from 'axios'

export default function Photo() {
  const videoRef = useRef<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [devices, setDevices] = useState<any>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600)
  const timerRef = useRef<any>(null);
  const keepAliveIntervalRef = useRef<any>(null);
  const [showModal, setShowModal] = useState(false)
  const [showModalPhotoPreview, setShowModalPhotoPreview] = useState(false)
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    async function getDevices() {
      try {
        // First request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Then get the list of devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);

          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: videoDevices[0].deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
          
          setStream(newStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        }
      } catch (err: any) {
        setError(`Error accessing camera: ${err.message}`);
      }
    }
    
    getDevices();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    // Cleanup interval on component unmount or when timer stops
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onFinish = () => {
    clearInterval(timerRef.current);
    setTimer(0)
    setShowModal(prevState => !prevState)
  }

  const onTakePict = async () => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_PHOTOBOOT_SERVER}/api/capture`, {})
      setPhoto(`${process.env.NEXT_PUBLIC_PHOTOBOOT_SERVER}${res.data.file.path}`)
      setShowModalPhotoPreview(prev => !prev)
    } catch (ex) {
    }
  }

  const onAbort = () => {
    setPhoto('')
    setShowModalPhotoPreview(prev => !prev)
  }

  const onAgree = () => {
    setPhoto('')
    setShowModalPhotoPreview(prev => !prev)
    // do something to api
  }

  return (
    <>
      <main className="flex flex-col w-screen h-screen bg-black py-4">
        <div className="absolute top-0 w-full px-4 py-2 flex justify-end z-[100]">
          <div className="flex flex-col items-center gap-2 p-4 bg-black rounded">
            <div className="rounded-3xl bg-primary py-1 px-8">
              <span className="text-white font-bold text-lg">
                Waktu Foto
              </span>
            </div>

            <span className="text-white font-bold text-2xl">
              {formatTime(timer)}
            </span>
          </div>
        </div>

        <div className="absolute top-0 w-screen h-screen">
          <video 
            ref={videoRef} 
            className="w-full h-full bg-black object-contain"
            autoPlay 
            playsInline
            onCanPlay={() => videoRef.current?.play()}
          />
        </div>

        <div className="absolute bottom-0 w-full px-4 py-4 flex justify-between">
          <button
            className="rounded-3xl bg-primary py-1 px-8 cursor-pointer"
            onClick={onTakePict}
          >
            <span className="text-white font-bold text-lg">
              AMBIL FOTO
            </span>
          </button>

          <button 
            className="rounded-3xl bg-primary py-1 px-8 cursor-pointer"
            onClick={onFinish}
          >
            <span className="text-white font-bold text-lg">
              SELESAI
            </span>
          </button>
        </div>
      </main>
      <ModalFinish 
        show={showModal || timer === 0}
        message="Waktu dalam mengambil foto sudah habis"
        onClick={() => window.location.href = "http://localhost:3000"}
      />
      <ModalPhotoPreview 
        show={showModalPhotoPreview}
        photo={photo}
        onAbort={onAbort}
        onAgree={onAgree}
      />
    </>
  )
}