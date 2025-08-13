'use client'

import ModalFinish from "@/components/Modal";
import React, { useRef, useState, useEffect, useMemo } from 'react';
import ModalPhotoPreview from "@/components/ModalPhoto";
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useData } from "@/context/DataContext";
import { useFullscreen } from "@/context/FullscreenContext";

export default function Photo() {
  const {back, push} = useRouter()
  const videoRef = useRef<any>(null);
  const [stream, setStream] = useState<any>(null);
  const [devices, setDevices] = useState<any>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0) // Changed from 600 to 0 as initial value
  const timerRef = useRef<any>(null);
  const [showModal, setShowModal] = useState(false)
  const [showModalPhotoPreview, setShowModalPhotoPreview] = useState(false)
  const [photo, setPhoto] = useState('')
  const [transactionData, setTransactionData] = useState<any>(null) // Added state for transaction data
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true) // Added loading state
  const [contextLoaded, setContextLoaded] = useState(false) // Track if context has been checked
  const [shouldStayOnPage, setShouldStayOnPage] = useState(false) // Prevent redirect once we confirm valid transaction
  const [timerStarted, setTimerStarted] = useState(false) // Track if timer has actually started
  // const [totalPhoto, setTotalPhoto] = useState(0)
  const {transactionId} = useData()
  const {isFullscreen} = useFullscreen()
  const [width, setWidth] = useState(0);


  // Check transaction ID and redirect only once after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Final check - transaction ID:', transactionId);
      setContextLoaded(true);
      
      if (!transactionId || transactionId.trim() === '') {
        console.log('No valid transaction ID after delay, redirecting to QR page');
        push('/');
      } else {
        console.log('Valid transaction ID confirmed:', transactionId);
        setShouldStayOnPage(true);
      }
    }, 300); // Increased delay to ensure context is fully loaded
    
    return () => clearTimeout(timer);
  }, []); // Remove all dependencies to run only once

  useEffect(() => {
    setWidth(window.innerHeight);
  }, []);

  // Added useEffect to fetch transaction details
  useEffect(() => {
    if (!transactionId) return;
    
    const fetchTransactionDetails = async () => {
      try {
        setIsLoadingTransaction(true);
        const response = await axios.get(`/trx/${transactionId}`);
        
        const data = response.data;
        
        if (data && data.data && data.data.plan) {
          setTransactionData(data.data);
          // Set timer from plan's durationSecond
          const planDuration = data.data.plan.durationSecond;
          
          const durationInSeconds = planDuration || 600;
          
          setTimer(durationInSeconds);
          setTimerStarted(true); // Mark that timer has been set from API
        } else {
          setTimer(600);
          setTimerStarted(true); // Mark that timer has been set (fallback)
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        // Fallback to default timer if API call fails
        setTimer(600);
        setTimerStarted(true); // Mark that timer has been set (fallback)
      } finally {
        setIsLoadingTransaction(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  // Start timer when timer value is set from API
  useEffect(() => {
    console.log('Timer useEffect triggered - timer:', timer, 'isLoadingTransaction:', isLoadingTransaction, 'timerRef.current:', !!timerRef.current);
    if (timer > 0 && !isLoadingTransaction && !timerRef.current) {
      console.log('Starting timer with:', timer, 'seconds');
      timerRef.current = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [timer, isLoadingTransaction]);

  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };
  
    const disableOtherClicks = (e: MouseEvent) => {
      if (e.button !== 0) { // hanya klik kiri yang diperbolehkan
        e.preventDefault();
        e.stopPropagation();
      }
    };
  
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('mousedown', disableOtherClicks);
    async function getDevices() {
      try {
        // First request permission to access media devices
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Then get the list of devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput').find((v: any) => v.label.includes("usb video"));
        setDevices(videoDevices);
        console.log(videoDevices)
        
        if (videoDevices) {
          setSelectedDeviceId(videoDevices.deviceId);
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: videoDevices.deviceId },
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
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
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('mousedown', disableOtherClicks);
      if (stream) {
        stream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    console.log('Upload check - showModal:', showModal, 'timer:', timer, 'timerStarted:', timerStarted);
    // Only trigger upload if timer has actually started and reached 0, or if modal is shown
    if (showModal || (timer === 0 && timerStarted)) {
      console.log('Triggering upload due to:', showModal ? 'modal shown' : 'timer finished');
      setTimeout(() => {
        onUpload()
      }, 2000)
    }
  }, [showModal, timer, timerStarted])

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
    console.log('----',transactionId)
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

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("🎥 Menyambungkan stream ke videoRef");
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef.current]);

  const onUpload = async () => {
    try {
      // await axios.post(`/api/upload`, {transactionId: transactionId})
      await axios.put(`${process.env.NEXT_PUBLIC_REMOTE_SERVER}/transactions/${transactionId}/complete-session`, {}, {
        headers: {
          'x-api-key': 'sHCEtVx2mVXIa6ZUkigfd'
        }
      })
      setTimerStarted(false)
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

  // Show loading state while fetching transaction details or context loading
  if (isLoadingTransaction || !contextLoaded) {
    return (
      <main className="flex flex-col w-screen h-screen bg-black items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    )
  }

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
          <img 
            className="absolute h-screen w-screen top-0 left-0 brightness-80"
            src="/bg.png"
            alt="bacgkroud image" />  
          
          {/* <div className="fixed inset-0 bg-black flex justify-center items-center overflow-hidden">
            <video 
              ref={videoRef}
              className="h-full object-contain transform rotate-90"
              autoPlay
              playsInline
              muted
              onCanPlay={() => videoRef.current?.play()}
            />
          </div> */}

          <div className="absolute top-0 left-0 h-screen w-screen flex justify-center items-center">
            <video 
              ref={videoRef} 
              className="w-auto h-[1000px] max-w-none object-contain rotate-90"
              autoPlay 
              playsInline
              muted
              onCanPlay={() => videoRef.current?.play()}
            />
          </div>
      </main>

      <ModalFinish
        show={showModal || timer === 0}
        message={finishWordingMemo}
        onClick={onUpload}
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