"use client"
import { useRef } from "react"
import type { CompositionEvent } from "react"

const isKanaOnly = (text: string) => /^[ぁ-んー]+$/.test(text)

const useKanaCapture = (onCapture: (kana: string) => void) => {
  const buffer = useRef("")

  const onCompositionUpdate = (e: CompositionEvent<HTMLInputElement>) => {
    if (isKanaOnly(e.data)) {
      buffer.current = e.data
    }
  }

  const onCompositionEnd = () => {
    if (buffer.current === "") return
    onCapture(buffer.current)
    buffer.current = ""
  }

  return { onCompositionUpdate, onCompositionEnd }
}

export default useKanaCapture
