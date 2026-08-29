"use client"
import { useState, useEffect, useRef, useId } from "react"
import type { KeyboardEvent } from "react"
import styles from "./combobox.module.scss"
import normalizeText from "@/app/utils/normalizeText"

type Option = {
  value: string
  label: string
  keywords?: string
}

type Props = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowFreeInput?: boolean
  required?: boolean
  maxLength?: number
  ariaLabel?: string
  emptyMessage?: string
}

const Combobox = ({
  options,
  value,
  onChange,
  placeholder,
  allowFreeInput,
  required,
  maxLength,
  ariaLabel,
  emptyMessage = "該当する候補がありません"
}: Props) => {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const selectedOption = options.find((option) => option.value === value)
  const selectedLabel = selectedOption ? selectedOption.label : ""

  const keyword = allowFreeInput ? value : query
  const inputValue = allowFreeInput ? value : (open ? query : selectedLabel)
  const normalizedKeyword = normalizeText(keyword)
  const filteredOptions = options.filter((option) =>
    normalizeText(`${option.label} ${option.keywords ?? ""}`).includes(normalizedKeyword)
  )

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current === null) return
      if (containerRef.current.contains(event.target as Node)) return
      setOpen(false)
      setActiveIndex(-1)
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [open])

  const closeList = () => {
    setOpen(false)
    setActiveIndex(-1)
  }

  const selectOption = (option: Option) => {
    onChange(option.value)
    setQuery("")
    closeList()
  }

  const handleFocus = () => {
    setQuery("")
    setOpen(true)
    setActiveIndex(-1)
  }

  const handleInputChange = (newValue: string) => {
    setOpen(true)
    setActiveIndex(-1)
    if (allowFreeInput) {
      onChange(newValue)
    } else {
      setQuery(newValue)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (filteredOptions.length === 0) return
      setActiveIndex(activeIndex + 1 >= filteredOptions.length ? 0 : activeIndex + 1)
      return
    }

    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (!open || filteredOptions.length === 0) return
      setActiveIndex(activeIndex - 1 < 0 ? filteredOptions.length - 1 : activeIndex - 1)
      return
    }

    if (e.key === "Enter") {
      if (!open || activeIndex < 0) return
      e.preventDefault()
      selectOption(filteredOptions[activeIndex])
      return
    }

    if (e.key === "Escape") {
      closeList()
    }
  }

  return (
    <div className={styles.combobox} ref={containerRef}>
      <input
        className={styles.input}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex < 0 ? undefined : `${listId}-${activeIndex}`}
        aria-label={ariaLabel}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        autoComplete="off"
      />
      {open && (
        <ul className={styles.list} id={listId} role="listbox">
          {filteredOptions.length === 0 ? (
            <li className={styles.empty}>{emptyMessage}</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                className={`${styles.option} ${index === activeIndex ? styles.active : ""}`}
                id={`${listId}-${index}`}
                key={option.value}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectOption(option)
                }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

export default Combobox
