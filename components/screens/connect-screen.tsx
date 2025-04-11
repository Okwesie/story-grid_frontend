import Image from "next/image"
import Link from "next/link"

export default function ConnectScreen() {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-start">
        <div className="space-y-6 max-w-lg mx-auto md:mx-0 text-center md:text-left">
          <h1 className="text-[#f4ce14] text-4xl md:text-5xl font-bold leading-tight">Connect with Friends</h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Follow your friends, send messages and stay connected in real-time
          </p>

          <div className="pt-6 flex justify-center md:justify-start w-full">
            <Link
              href="/register"
              className="inline-block bg-[#f4ce14] text-[#0a192f] font-bold py-3 px-8 rounded-md text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 h-full">
        <div className="h-full relative overflow-hidden">
          <Image src="/connect1.jpg" alt="Friends connecting" fill className="object-cover" />
        </div>
      </div>
    </div>
  )
}

