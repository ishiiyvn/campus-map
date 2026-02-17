import * as React from "react"

const MOBILE_BREAKPOINT = 768

function getIsMobile(breakpoint: number) {
  if (typeof window === "undefined") {
    return false
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  }

  return window.innerWidth < breakpoint
}

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState(() => getIsMobile(breakpoint))

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const query = `(max-width: ${breakpoint - 1}px)`
    const mediaQueryList = window.matchMedia(query)

    const handleChange = (event?: MediaQueryListEvent) => {
      setIsMobile(event ? event.matches : mediaQueryList.matches)
    }

    handleChange()

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange)
      return () => mediaQueryList.removeEventListener("change", handleChange)
    }

    mediaQueryList.addListener(handleChange)
    return () => mediaQueryList.removeListener(handleChange)
  }, [breakpoint])

  return isMobile
}
