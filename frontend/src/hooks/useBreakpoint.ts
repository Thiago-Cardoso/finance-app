import { useState, useEffect } from 'react'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm')
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({ width, height })

      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setBreakpoint('md')
      } else {
        setBreakpoint('sm')
      }
    }

    // Set initial size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Helper functions
  const isAbove = (bp: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[bp]
  }

  const isBelow = (bp: Breakpoint): boolean => {
    return windowSize.width < breakpoints[bp]
  }

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max]
  }

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg

  return {
    breakpoint,
    windowSize,
    isAbove,
    isBelow,
    isBetween,
    isMobile,
    isTablet,
    isDesktop,
  }
}
