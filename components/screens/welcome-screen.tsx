import Image from "next/image"

export default function WelcomeScreen() {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-start">
        <div className="space-y-4 max-w-lg mx-auto md:mx-0 text-center md:text-left">
          <h1 className="text-[#f4ce14] text-4xl md:text-5xl font-bold leading-tight">Welcome to StoryGrid</h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Your new social media platform for sharing stories, connecting, and exploring.
          </p>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2 h-full">
        <div className="h-full relative overflow-hidden">
          <Image src="/welcome1.jpg" alt="People sharing stories" fill className="object-cover" priority />
        </div>
      </div>
    </div>
  )
}

