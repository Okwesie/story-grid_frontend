"use client"

import { ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ConnectScreen() {
  return (
    <div className="flex min-h-screen bg-[#0a192f]">
      <div className="w-full md:w-1/2 p-6 flex flex-col">
        <div className="mt-4">
          <Link href="#" className="inline-block">
            <ChevronLeft className="h-8 w-8 text-white" />
          </Link>
        </div>

        <div className="flex flex-col justify-center flex-grow">
          <h1 className="text-[#f4ce14] text-5xl font-bold mb-4">Connect with Friends</h1>

          <p className="text-white text-xl mb-12">Follow your friends, send messages and stay connected in real-time</p>

          <button className="bg-[#f4ce14] text-[#0a192f] font-bold py-3 px-6 rounded-md w-48 text-lg">
            Get Started
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className="h-2 w-2 rounded-full bg-white"></div>
          <div className="h-2 w-2 rounded-full bg-white"></div>
          <div className="h-2 w-2 rounded-full bg-white"></div>
          <div className="h-2 w-2 rounded-full bg-[#d4a5a5]"></div>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2">
        <div className="grid grid-cols-2 h-full">
          <div className="relative">
            <Image
              src="/placeholder.svg?height=600&width=400"
              alt="Friends enjoying sunset"
              width={400}
              height={600}
              className="object-cover h-full w-full"
            />
          </div>
          <div className="grid grid-rows-2 h-full">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Friends at event"
                width={400}
                height={300}
                className="object-cover h-full w-full"
              />
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Friends outdoors"
                width={400}
                height={300}
                className="object-cover h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

