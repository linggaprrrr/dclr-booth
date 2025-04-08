'use client'

import ModalFinish from "@/components/Modal";
import React, { useRef, useState, useEffect, useMemo } from 'react';
import ModalPhotoPreview from "@/components/ModalPhoto";
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useData } from "@/context/DataContext";
import { useFullscreen } from "@/context/FullscreenContext";

export default function Photo() {
  const {back} = useRouter()
  const videoRef = useRef<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [devices, setDevices] = useState<any>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600)
  const timerRef = useRef<any>(null);
  const [showModal, setShowModal] = useState(false)
  const [showModalPhotoPreview, setShowModalPhotoPreview] = useState(false)
  const [photo, setPhoto] = useState('')
  // const [totalPhoto, setTotalPhoto] = useState(0)
  const {transactionId} = useData()
  const {isFullscreen} = useFullscreen()
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerHeight);
  }, []);

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

  useEffect(() => {
    // if (showModal || timer === 0 || totalPhoto === 40) {
      if (showModal || timer === 0) {
      setTimeout(() => {
        onUpload()
      }, 1000)
    }
  }, [showModal, timer])

  const handleClick = () => {
    // if (showModalPhotoPreview || showModal || timer === 0 || totalPhoto === 40) return
    if (showModalPhotoPreview || showModal || timer === 0) return
    onTakePict()
  };

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
    // if (showModal || timer === 0 || totalPhoto === 40) return
    if (showModal || timer === 0) return
    try {
      const res = await axios.get(`/api/capture/${transactionId}`, {})
      setPhoto(res.data.file.path)
      setShowModalPhotoPreview(prev => !prev)
      // setTotalPhoto(prevState => prevState + 1)
    } catch (ex) {
    }
  }

  const onAbort = async () => {
    try {
      const photoSplit = photo.split('/')
      await axios.delete(`/api/${photoSplit[photoSplit.length-1]}`)
      setPhoto('')
    } catch (ex) {
      console.log(`ERROR when delete ${ex}`)
    } finally {
      setShowModalPhotoPreview(prev => !prev)
    }
  }

  const onAgree = async () => {
    setPhoto('')
    setShowModalPhotoPreview(prev => !prev)
  }

  const onUpload = async () => {
    try {
      await axios.post(`/api/upload`, {transactionId: transactionId})
      await axios.put(`${process.env.NEXT_PUBLIC_REMOTE_SERVER}/transactions/${transactionId}/complete-session`, {}, {
        headers: {
          'x-api-key': 'sHCEtVx2mVXIa6ZUkigfd'
        }
      })
    } catch (ex) {
      console.log(`ERROR when finish - upload ${ex}`)
    } finally {
      back()
    }
  }

  const finishWordingMemo = useMemo(() => {
    // if (totalPhoto === 40) return "Jumlah pengambilan foto sudah terpenuhi"
    if (timer === 0) return  "Waktu dalam mengambil foto sudah habis"
    return "Kamu telah menyelesaikan pengambilan foto"
  }, [timer])

  return (
    <>
      <main 
        className="flex flex-col w-screen h-screen bg-black py-4"
        style={{cursor: isFullscreen ? 'none' : ''}}
        onClick={handleClick}
      >
        <div className="absolute top-4 w-full pr-1 py-2 flex justify-end z-[100]">
          <div className="flex flex-col items-center gap-2 p-4 bg-gray-500 w-[200px] rounded-tl rounded-bl">
            <div className="rounded bg-primary py-1 px-8">
              <span className="text-white font-bold text-lg">
                Waktu Foto
              </span>
            </div>

            <span className="text-white font-bold text-2xl">
              {formatTime(timer)}
            </span>
          </div>
          {/* <div className="flex flex-col items-center gap-2 p-4 pl-0 bg-gray-500 rounded-tr rounded-br">
            <div className="rounded bg-primary py-1 px-8">
              <span className="text-white font-bold text-lg">
                Total Foto
              </span>
            </div>

            <span className="text-white font-bold text-2xl">
              {totalPhoto} / 40
            </span>
          </div> */}
        </div>

        <div 
          className="absolute top-0 -left-[275px] h-screen rotate-90" 
          style={{ height: width, width}}
        >
          <video 
            ref={videoRef} 
            // className="w-full h-full bg-black object-fill"
            className="w-full h-full"
            autoPlay 
            playsInline
            onCanPlay={() => videoRef.current?.play()}
          />
        </div>

        <div className="absolute bottom-0 w-full px-4 py-4 flex justify-between">
          {/* <button
            className="rounded-3xl bg-primary py-1 px-8 cursor-pointer"
            onClick={onTakePict}
          >
            <span className="text-white font-bold text-lg">
              AMBIL FOTO
            </span>
          </button> */}

          {/* <button 
            className="rounded-3xl bg-primary py-1 px-8 cursor-pointer"
            onClick={onFinish}
          >
            <span className="text-white font-bold text-lg">
              SELESAI
            </span>
          </button> */}
        </div>
      </main>
      <ModalFinish 
        // show={showModal || timer === 0 || totalPhoto === 40}
        show={showModal || timer === 0}
        message={finishWordingMemo}
        onClick={onUpload}
      />
      <ModalPhotoPreview 
        show={showModalPhotoPreview}
        // show={false}
        photo={photo}
        // photo="http://localhost:3000/uploads/photo-1742748306493.jpg"
        onAbort={onAbort}
        onAgree={onAgree}
      />
    </>
  )
}