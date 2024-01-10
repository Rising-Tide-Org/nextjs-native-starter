import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Box, Text, Tooltip } from '@chakra-ui/react'

export type WordData = {
  text: string
  count: number
}

type WordPosition = {
  x: number
  y: number
  width: number
  height: number
}

type Props = {
  words: WordData[]
}

const WordCloud = ({ words }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const sortedWords = useMemo(() => redistributeWords(words), [words])

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleHover = (index: number | null) => {
    setSelectedIndex(index)
  }

  return (
    <Box p={10} width='100%' height='400px' bg='brandGray.200' rounded='lg'>
      <Box ref={containerRef} w='full' h='full' position='relative'>
        {sortedWords.map((word, index) => {
          const isSelected = index === selectedIndex
          const isNearSelected =
            selectedIndex && Math.abs(index - selectedIndex) < 3

          const fontSize = fontSizeForCount(word.count)
          const opacity = (() => {
            if (isSelected) return 1
            if (isNearSelected) return 0.1
            return Math.min(1, word.count / 7) * (selectedIndex ? 0.3 : 1)
          })()
          const shadowSize = Math.max(1, word.count / 8) + 'px'
          const shadowOpacity = Math.max(1, word.count / 30)
          const wordSize = {
            width: word.text.length * fontSize, // Simplified width calculation
            height: fontSize * 1.2, // Simplified height calculation
          }
          const position = calculateWordPosition(index, wordSize, containerSize)

          wordPositions[word.text] = position

          return (
            <Tooltip
              key={index}
              label={`${word.text}: ${word.count} mentions`}
              aria-label={`${word.count} mentions`}
              placement='top'
              hasArrow
            >
              <Text
                key={index}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  opacity,
                  fontSize: `${fontSize}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                color='brandGray.900'
                textShadow={`1px 1px ${shadowSize} rgba(0,200,0,${shadowOpacity})`}
                onMouseEnter={() => handleHover(index)}
                onMouseLeave={() => handleHover(null)}
                transition='opacity 0.2s ease-in-out'
                zIndex={isSelected ? 1 : 0}
                cursor='pointer'
              >
                {word.text}
              </Text>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}

const fontSizeForCount = (count: number): number => {
  // Adjust the font size based on the count
  return Math.max(Math.min(3 * count, 40), 14)
}

const isOverlapping = (word1: WordPosition, word2: WordPosition): boolean => {
  return !(
    word1.x + word1.width < word2.x ||
    word1.x > word2.x + word2.width ||
    word1.y + word1.height < word2.y ||
    word1.y > word2.y + word2.height
  )
}

const spiralPosition = (
  index: number,
  containerSize: { width: number; height: number }
) => {
  const expansionRate = Math.min(containerSize.width, containerSize.height) / 2

  // These constants control the spiral density and spacing
  const a = expansionRate // Adjust this to increase/decrease the tightness of the spiral
  const b = 2 // Adjust this to ensure the spiral fits within the container

  const angle = index * 0.15 // Controls how far apart each loop of the spiral is
  const radius = a + b * angle

  // The spiral equation
  const x = containerSize.width / 2 + radius * Math.cos(angle)
  const y = containerSize.height / 2 + radius * Math.sin(angle)

  // Ensure the position is within the bounds of the container
  return {
    x: Math.max(0, Math.min(containerSize.width, x)),
    y: Math.max(0, Math.min(containerSize.height, y)),
  }
}

const wordPositions: Record<string, WordPosition> = {}

const calculateWordPosition = (
  index: number,
  wordSize: { width: number; height: number },
  containerSize: { width: number; height: number }
): WordPosition => {
  let position = { x: 0, y: 0, ...wordSize } // Initialize with a basic position and the wordSize
  let overlap = false
  let attempt = 0

  do {
    // Calculate the new position, potentially using a spiral pattern or another approach
    const { x, y } = spiralPosition(index, containerSize)
    position = { x: x, y, ...wordSize }

    // Check for overlaps with each existing word position
    overlap = Object.keys(wordPositions).some((key) => {
      const pos = wordPositions[key]
      return isOverlapping(position, pos)
    })

    attempt++
  } while (overlap && attempt < 100) // Limit the number of attempts to avoid infinite loops

  return position
}

const redistributeWords = (arr: WordData[]) => {
  if (arr.length < 5) return arr

  // Sort the original array
  const sorted = [...arr].sort((a, b) => b.count - a.count)

  const top: WordData[] = sorted.slice(0, 5) ?? []
  const rest: WordData[] = sorted.slice(5) ?? []

  // Distribute the top 5 words evenly around the container
  const interval = Math.floor(rest.length / top.length)

  const merged: WordData[] = []
  let i = 0
  while (merged.length < arr.length) {
    if (i === interval && top.length > 0) {
      const word = top.shift()
      if (word) {
        merged.push(word)
      }
      i = 0
    } else {
      const word = rest.shift()
      if (word) {
        merged.push(word)
      }
    }
    i++
  }

  return merged
}

export default WordCloud
