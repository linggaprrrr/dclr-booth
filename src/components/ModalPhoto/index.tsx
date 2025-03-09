import React, { useState, useEffect, useRef } from 'react'

interface Props {
  photo?: string
  show?: boolean
  children?: React.ReactNode
  onAbort?: () => void
  onAgree?: () => void
}

const ModalPhotoPreview: React.FC<Props> = (props) => {
  const [timer, setTimer] = useState(5)
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (props.show) {
      setTimer(5)
      timerRef.current = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    if (!props.show && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [props.show])

  useEffect(() => {
    if (timer === 0 && props.onAgree) {
      props.onAgree()
    }
  }, [timer])

  if (!props.show) return null
  
  return (
    <div className="fixed top-0 w-screen h-screen backdrop-blur-sm flex justify-center items-center z-[1000]">        
        
        <div className="bg-black w-screen h-screen flex justify-center items-center">
          <img 
            src={props.photo || ''}
            alt="photo preview"
            className="object-contain w-[90%] h-full"
          /> 
        </div>

        <div className="absolute bottom-0 w-full px-4 py-4 flex justify-between">
          <button 
            className="rounded-full bg-primary py-2 px-8 text-white font-bold text-lg cursor-pointer"
            onClick={props.onAbort}
          >
            TIDAK PILIH
          </button>

          <button 
            className="rounded-full bg-primary py-2 px-8 text-white font-bold text-lg cursor-pointer"
            onClick={props.onAgree}
          >
            ({timer}){' '}
            PILIH
          </button>
        </div>
    </div>
  )
}

export default ModalPhotoPreview