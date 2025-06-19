// src/app/[locale]/chatbot/ModelSelectionDropdown.tsx
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { ModelOption, AVAILABLE_MODELS } from './lib/models' // Đảm bảo đường dẫn này đúng
import ModelInfoTooltip from './ModelInfoTooltip'
import { useTranslations } from 'next-intl'

interface ModelSelectionDropdownProps {
  currentModel: ModelOption
  availableModels: ModelOption[]
  onModelChange: (model: ModelOption) => void
  disabled?: boolean
}

const ModelSelectionDropdown: React.FC<ModelSelectionDropdownProps> = ({
  currentModel,
  availableModels,
  onModelChange,
  disabled = false
}) => {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredModelValue, setHoveredModelValue] = useState<string | null>(
    null
  )
  const dropdownRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLLIElement | null>>(new Map())

  const toggleDropdown = () => !disabled && setIsOpen(!isOpen)

  const handleSelectModel = (model: ModelOption) => {
    onModelChange(model)
    setIsOpen(false)
    setHoveredModelValue(null) // Reset hover state
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setHoveredModelValue(null) // Đóng tooltip khi click ra ngoài
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lấy ModelOption object cho item đang được hover
  const currentHoveredModel = hoveredModelValue
    ? availableModels.find(m => m.value === hoveredModelValue)
    : null

  // Lấy ref của HTMLLIElement đang được hover
  const currentHoveredItemRef = hoveredModelValue
    ? itemRefs.current.get(hoveredModelValue)
    : null

  const CurrentModelIcon = currentModel.icon // Gán icon của model hiện tại vào biến viết hoa

  return (
    <div className='relative w-full' ref={dropdownRef}>
      <label className='mb-1 block text-sm  font-medium'>
        {t('Chat_Model_Selection_Label')}
      </label>
      <button
        type='button'
        className={`flex w-full items-center justify-between rounded-md border bg-white-pure px-3 py-2 text-sm  shadow-sm hover:bg-gray-10  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1  ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
        onClick={toggleDropdown}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className='flex items-center'>
          {CurrentModelIcon && (
            <CurrentModelIcon className='mr-2 h-4 w-4 text-blue-500' />
          )}
          {currentModel.name}
        </span>
        <ChevronDown
          size={16}
          className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <ul
          className='absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-600 dark:bg-gray-700'
          role='listbox'
        >
          {availableModels.map(modelItem => {
            const ItemIcon = modelItem.icon // Gán icon của từng item vào biến viết hoa
            return (
              <li
                key={modelItem.value}
                ref={el => {
                  if (el) {
                    itemRefs.current.set(modelItem.value, el)
                  } else {
                    // Quan trọng: Xóa ref khỏi map khi item unmount
                    itemRefs.current.delete(modelItem.value)
                  }
                }}
                onMouseEnter={() => setHoveredModelValue(modelItem.value)}
                onMouseLeave={() => setHoveredModelValue(null)}
                // Không cần 'relative' ở đây nữa vì tooltip dùng portal
              >
                <button
                  type='button'
                  className='flex w-full items-center justify-between px-3 py-2 text-left text-sm  hover:bg-gray-10 hover:text-gray-90 '
                  onClick={() => handleSelectModel(modelItem)}
                  role='option'
                  aria-selected={modelItem.value === currentModel.value}
                >
                  <span className='flex items-center'>
                    {ItemIcon && (
                      <ItemIcon className='mr-2 h-4 w-4 text-blue-500' />
                    )}
                    <span className='truncate'>{modelItem.name}</span>
                  </span>
                  {modelItem.value === currentModel.value && (
                    <Check
                      size={16}
                      className='text-blue-600 dark:text-blue-400'
                    />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Render Tooltip sử dụng portal, chỉ khi có item được hover và ref của nó tồn tại */}
      {currentHoveredModel && currentHoveredItemRef && (
        <ModelInfoTooltip
          model={currentHoveredModel}
          isVisible={!!hoveredModelValue} // Tooltip chỉ visible khi có hoveredModelValue
          targetRef={{ current: currentHoveredItemRef }}
        />
      )}
    </div>
  )
}

export default ModelSelectionDropdown
