import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  style?: any
  className?: string
  children?: React.ReactNode
  cursor?: boolean
  cursorChar?: string
  pauseOnPunctuation?: number
  skipAnimation?: boolean
  autoStart?: boolean
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  delay = 0,
  onComplete,
  style,
  className,
  children,
  cursor = false,
  cursorChar = '|',
  pauseOnPunctuation = 200,
  skipAnimation = false,
  autoStart = true,
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [showCursor, setShowCursor] = useState(cursor)
  
  const timeoutRef = useRef<number | null>(null)
  const cursorIntervalRef = useRef<number | null>(null)
  const indexRef = useRef(0)

  // Reset function
  const resetTypewriter = useCallback(() => {
    setDisplayedText('')
    setIsComplete(false)
    setShowCursor(cursor)
    indexRef.current = 0
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [cursor])

  // Typing function using useCallback to prevent infinite rerenders
  const typeCharacter = useCallback(() => {
    if (indexRef.current >= text.length) {
      setIsComplete(true)
      if (!cursor) setShowCursor(false)
      onComplete?.()
      return
    }

    const currentChar = text[indexRef.current]
    setDisplayedText(text.substring(0, indexRef.current + 1))
    indexRef.current += 1

    // Calculate delay for next character
    let nextDelay = speed
    if (['.', '!', '?', ';', ':'].includes(currentChar)) {
      nextDelay += pauseOnPunctuation
    } else if ([','].includes(currentChar)) {
      nextDelay += pauseOnPunctuation / 2
    }

    // Schedule next character
    timeoutRef.current = window.setTimeout(typeCharacter, nextDelay)
  }, [text, speed, pauseOnPunctuation, cursor, onComplete])

  // Start typing function
  const startTyping = useCallback(() => {
    if (skipAnimation) {
      setDisplayedText(text)
      setIsComplete(true)
      setShowCursor(false)
      onComplete?.()
      return
    }

    resetTypewriter()
    timeoutRef.current = window.setTimeout(typeCharacter, delay)
  }, [skipAnimation, text, delay, typeCharacter, resetTypewriter, onComplete])

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor || isComplete) {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current)
        cursorIntervalRef.current = null
      }
      return
    }

    cursorIntervalRef.current = window.setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current)
        cursorIntervalRef.current = null
      }
    }
  }, [cursor, isComplete])

  // Auto-start typing when text changes
  useEffect(() => {
    if (autoStart && text) {
      startTyping()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [text, autoStart, startTyping])

  // Hide cursor after completion
  useEffect(() => {
    if (isComplete && cursor) {
      const timer = setTimeout(() => {
        setShowCursor(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, cursor])

  const displayText = displayedText + (cursor && showCursor ? cursorChar : '')

  return (
    <View style={styles.container}>
      <Text style={style} className={className}>
        {displayText}
      </Text>
      {children}
    </View>
  )
}

// Multi-line typewriter component
interface TypewriterLinesProps extends Omit<TypewriterTextProps, 'text'> {
  lines: string[]
  lineDelay?: number
}

const TypewriterLines: React.FC<TypewriterLinesProps> = ({
  lines,
  lineDelay = 500,
  onComplete,
  style,
  className,
  ...props
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [completedLines, setCompletedLines] = useState<string[]>([])
  const [isAllComplete, setIsAllComplete] = useState(false)

  const handleLineComplete = useCallback(() => {
    const currentLine = lines[currentLineIndex]
    setCompletedLines(prev => [...prev, currentLine])

    if (currentLineIndex < lines.length - 1) {
      setTimeout(() => {
        setCurrentLineIndex(prev => prev + 1)
      }, lineDelay)
    } else {
      setIsAllComplete(true)
      onComplete?.()
    }
  }, [currentLineIndex, lines, lineDelay, onComplete])

  // Reset when lines change
  useEffect(() => {
    setCurrentLineIndex(0)
    setCompletedLines([])
    setIsAllComplete(false)
  }, [lines])

  if (!lines.length) {
    return null
  }

  return (
    <View style={styles.linesContainer}>
      {completedLines.map((line, index) => (
        <Text key={index} style={[style, styles.completedLine]} className={className}>
          {line}
        </Text>
      ))}
      {!isAllComplete && currentLineIndex < lines.length && (
        <TypewriterText
          {...props}
          text={lines[currentLineIndex]}
          style={style}
          className={className}
          onComplete={handleLineComplete}
        />
      )}
    </View>
  )
}

// Game-specific preset configurations
export const GameTypewriterPresets = {
  dialogue: {
    speed: 40,
    delay: 200,
    pauseOnPunctuation: 300,
    cursor: false,
  },
  narration: {
    speed: 30,
    delay: 300,
    pauseOnPunctuation: 400,
    cursor: true,
    cursorChar: '_',
  },
  fastDialogue: {
    speed: 20,
    delay: 100,
    pauseOnPunctuation: 150,
    cursor: false,
  },
  dramatic: {
    speed: 80,
    delay: 800,
    pauseOnPunctuation: 600,
    cursor: true,
  },
  system: {
    speed: 15,
    delay: 0,
    pauseOnPunctuation: 100,
    cursor: false,
  },
  instant: {
    speed: 0,
    delay: 0,
    pauseOnPunctuation: 0,
    skipAnimation: true,
    cursor: false,
  },
}

const styles = StyleSheet.create({
  container: {
    minHeight: 20,
  },
  linesContainer: {
    minHeight: 20,
  },
  completedLine: {
    marginBottom: 4,
  },
})

export { TypewriterText, TypewriterLines }