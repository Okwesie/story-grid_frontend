import Image from "next/image"

export default function ShareScreen() {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-start">
        <div className="space-y-4 max-w-lg mx-auto md:mx-0 text-center md:text-left">
          <h1 className="text-[#f4ce14] text-4xl md:text-5xl font-bold leading-tight">Share Your Stories</h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Post photos, videos, and updates to share your life with friends and followers
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 h-full">
        <div className="h-full relative overflow-hidden">
          <Image src="/share1.jpg" alt="People sharing moments" fill className="object-cover" />
        </div>
      </div>
    </div>
  )
}

