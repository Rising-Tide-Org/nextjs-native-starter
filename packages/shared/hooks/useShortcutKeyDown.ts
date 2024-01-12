import { useEffect } from 'react'

const useKeyboardShortcut = (
  keys: string[],
  callback: (e: KeyboardEvent) => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        keys.every(
          (key) =>
            typeof key === 'string' &&
            event.key.toLowerCase() === key.toLowerCase()
        )
      ) {
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [keys, callback])
}

export default useKeyboardShortcut
