// src/utils/SearchInput.tsx
import React, { useState, useEffect } from 'react'

// Định nghĩa props cho component
interface SearchInputProps {
  initialValue?: string
  onSearchChange: (searchTerm: string) => void
  placeholder?: string
  debounceDelay?: number
  className?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  initialValue = '',
  onSearchChange,
  placeholder = 'Search...',
  debounceDelay = 500,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(initialValue)

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(inputValue)
    }, debounceDelay)

    return () => {
      clearTimeout(handler)
    }
  }, [inputValue, debounceDelay, onSearchChange])

  useEffect(() => {
    setInputValue(initialValue)
  }, [initialValue])

  return (
    <div className={`w-full ${className}`}>
      <input
        type='text'
        placeholder={placeholder}
        className='w-full rounded-full border px-4 py-2 placeholder:text-primary focus:outline-none focus:ring-2 focus:ring-button'
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        spellCheck='false' // <--- THÊM DÒNG NÀY VÀO ĐÂY
      />
    </div>
  )
}

export default SearchInput
