"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import WelcomeScreen from "./screens/welcome-screen"
import ShareScreen from "./screens/share-screen"
import ExploreScreen from "./screens/explore-screen"
import ConnectScreen from "./screens/connect-screen"

const SLIDE_DURATION = 8000 // 8 seconds per slide

export default function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const totalSlides = 4

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (isTransitioning) return

      setIsTransitioning(true)
      setCurrentSlide(slideIndex)

      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500) // Match this with the CSS transition duration
    },
    [isTransitioning],
  )

  const nextSlide = useCallback(() => {
    const nextIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1
    goToSlide(nextIndex)
  }, [currentSlide, totalSlides, goToSlide])

  const prevSlide = useCallback(() => {
    const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1
    goToSlide(prevIndex)
  }, [currentSlide, totalSlides, goToSlide])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide()
      }
    }, SLIDE_DURATION)

    return () => clearInterval(interval)
  }, [nextSlide, isTransitioning])

  // Define screens in the correct order
  const screens = [
    <WelcomeScreen key="welcome" />,
    <ShareScreen key="share" />,
    <ExploreScreen key="explore" />,
    <ConnectScreen key="connect" />,
  ]

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a192f]">
      {/* Slides Container */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {screens.map((screen, index) => (
          <div key={index} className="min-w-full h-full flex-shrink-0">
            {screen}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent text-white p-2 z-10 focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent text-white p-2 z-10 focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              currentSlide === index ? "bg-[#d4a5a5]" : "bg-white",
            )}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  )
}

