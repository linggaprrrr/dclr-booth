import React from 'react'

interface Props {
  message: string
  show?: boolean
  children?: React.ReactNode
  onClick?: () => void
}

const ModalFinish: React.FC<Props> = (props) => {
  if (!props.show) return null
  
  return (
    <div className="fixed top-0 w-screen h-screen backdrop-blur-sm flex justify-center items-center px-4 z-[1000]">
      <div className="flex flex-col items-center gap-4 bg-primary rounded-3xl p-8">
        <p className="text-white font-medium text-2xl text-center">
          {props.message}
        </p>
        <p className="text-white font-medium text-2xl text-center">
          Menyimpan...
        </p>

        {/* <button 
          className="rounded-full bg-[#FFB5C0] py-2 px-8 text-white font-bold text-lg cursor-pointer"
          onClick={props.onClick}
        >
          SELESAI
        </button> */}
      </div>
    </div>
  )
}

export default ModalFinish