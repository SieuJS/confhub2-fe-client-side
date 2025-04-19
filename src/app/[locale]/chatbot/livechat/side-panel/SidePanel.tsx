// SidePanel.tsx (Adjusted: Output format is Audio or Text)
'use client'
import { useRef, useState, useEffect } from 'react'
import { useLiveAPIContext } from '../contexts/LiveAPIContext'
import { useLoggerStore } from '../lib/store-logger'
import Logger from '../logger/Logger'
import { AudioRecorder } from '../lib/audio-recorder'
import ChatInput from './ChatInput'
import useLoggerScroll from '../hooks/useLoggerScroll'
import useLoggerEvents from '../hooks/useLoggerEvents'
import useAudioRecorder from '../hooks/useAudioRecorder'
import useModelAudioResponse from '../hooks/useModelAudioResponse'
import useVolumeControl from '../hooks/useVolumeControl'
import ConnectionButton from './ConnectionButton'
import MicButton from './MicButton'
import ChatIntroduction from './ChatIntroduction'
import useInteractionHandlers from '../hooks/useInteractionHandlers'
// Ensure OutputModality type in parent is 'audio' | 'text'
import { OutputModality, PrebuiltVoice } from '../page'
import { Link } from '@/src/navigation'

// --- Props ---
interface SidePanelProps {
  // Ensure parent passes 'audio' or 'text'
  currentModality: OutputModality
  onModalityChange: (modality: OutputModality) => void
  currentVoice: PrebuiltVoice
  onVoiceChange: (voice: PrebuiltVoice) => void
  availableVoices: PrebuiltVoice[]
  connected: boolean
  isConnecting: boolean
  streamStartTime: number | null
  connectionStatusMessage: string | null
  connectWithPermissions: () => Promise<void>
  handleDisconnect: () => void
}
// --- END Props ---

// --- Main Component ---
export default function SidePanel({
  currentModality,
  onModalityChange, // This should now expect 'audio' or 'text'
  currentVoice,
  onVoiceChange,
  availableVoices,
  connected,
  isConnecting,
  streamStartTime,
  // connectionStatusMessage,
  connectWithPermissions,
  handleDisconnect
}: SidePanelProps) {
  const { client, volume, on, off } = useLiveAPIContext()
  const loggerRef = useRef<HTMLDivElement>(null)
  const { log, clearLogs } = useLoggerStore()

  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isOutputSettingsOpen, setIsOutputSettingsOpen] = useState(true)

  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log
  })

  // --- Effects ---
  useEffect(() => {
    if (connected) {
      clearLogs()
    }
  }, [connected, clearLogs])

  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true)
    }
  }, [connected, isConnecting, streamStartTime])

  // --- Hooks ---
  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log) // This hook might need adjustment based on whether 'text' modality should still play audio internally
  useVolumeControl(inVolume)

  // --- Handlers ---
  // Renamed for clarity, passes 'audio' or 'text' directly
  const handleModalityButtonClick = (newValue: OutputModality) => {
    if (!connected) {
      onModalityChange(newValue) // Pass 'audio' or 'text'
    }
  }

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!connected) {
      onVoiceChange(event.target.value as PrebuiltVoice)
    }
  }

  // Show Voice selection only when 'audio' modality is selected
  const isAudioSelected = currentModality === 'audio'

  // --- Render ---
  return (
    <div className='flex h-screen flex-row bg-gray-100'>
      {' '}
      {/* Outer container */}
      {/* --- Left Panel (Settings - Light Theme) --- */}
      <div
        className={`relative flex flex-col overflow-y-auto rounded-l-2xl border-r border-gray-200 bg-white text-gray-700 transition-all duration-300 ease-in-out ${isOutputSettingsOpen ? 'w-64 p-4' : 'w-12 p-2'}`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOutputSettingsOpen(!isOutputSettingsOpen)}
          className='absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400'
          title={isOutputSettingsOpen ? 'Thu gọn Cài đặt' : 'Mở Cài đặt'}
          aria-expanded={isOutputSettingsOpen}
        >
          {/* Chevron Icon */}
          {isOutputSettingsOpen ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              {' '}
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5L8.25 12l7.5-7.5'
              />{' '}
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-4 w-4'
            >
              {' '}
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M8.25 4.5l7.5 7.5-7.5 7.5'
              />{' '}
            </svg>
          )}
          <span className='sr-only'>
            {isOutputSettingsOpen ? 'Thu gọn Cài đặt' : 'Mở Cài đặt'}
          </span>
        </button>

        {/* Settings Content */}
        <div
          className={`flex-grow space-y-2 overflow-hidden transition-opacity duration-200 ${isOutputSettingsOpen ? 'opacity-100' : 'pointer-events-none h-0 opacity-0'}`}
        >
          <div className=' text-lg font-semibold text-gray-800'>LIVE CHAT</div>
          <div className='flex flex-col  border-t border-gray-200 pt-2'>
            <Link
              href='/'
              className='flex items-center space-x-2 rounded p-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-800'
            >
              <span>HOME</span>
            </Link>
            <Link
              href='/chatbot/chat'
              className='flex items-center space-x-2 rounded p-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-800'
            >
              <span>CHATBOT</span>
            </Link>
          </div>
          <fieldset
            disabled={connected || !isOutputSettingsOpen}
            className='space-y-4 border-t border-gray-200 pt-4 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {/* --- Output Format --- */}
            <div>
              <label className='mb-2 block text-sm font-medium text-gray-600'>
                Output format
              </label>
              <div className='flex space-x-2'>
                {/* Audio Button */}
                <button
                  type='button'
                  onClick={() => handleModalityButtonClick('audio')} // Send 'audio'
                  disabled={connected || !isOutputSettingsOpen}
                  className={`flex flex-1 flex-col items-center justify-center rounded-lg border p-3 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50
                                        ${
                                          isAudioSelected // Check if currentModality is 'audio'
                                            ? 'border-blue-600 bg-blue-500 text-white shadow-sm' // Selected style
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50' // Default style
                                        }`}
                >
                  {/* Icon representing Audio (e.g., Speaker) */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className={`mb-1 h-5 w-5 ${isAudioSelected ? 'text-white' : 'text-gray-500'}`}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z'
                    />
                  </svg>
                  <span className='text-xs font-medium'>Audio</span>{' '}
                  {/* Changed Label */}
                </button>

                {/* Text Button */}
                <button
                  type='button'
                  onClick={() => handleModalityButtonClick('text')} // Send 'text'
                  disabled={connected || !isOutputSettingsOpen}
                  className={`flex flex-1 flex-col items-center justify-center rounded-lg border p-3 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50
                                        ${
                                          currentModality === 'text' // Check if currentModality is 'text'
                                            ? 'border-blue-600 bg-blue-500 text-white shadow-sm' // Selected style
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50' // Default style
                                        }`}
                >
                  {/* Icon representing Text (e.g., Document/Lines) */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className={`mb-1 h-5 w-5 ${currentModality === 'text' ? 'text-white' : 'text-gray-500'}`}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12'
                    />{' '}
                    {/* Simple text lines icon */}
                  </svg>
                  <span className='text-xs font-medium'>Text</span>{' '}
                  {/* Label remains Text */}
                </button>
              </div>
            </div>

            {/* --- Voice Selection (Conditional) --- */}
            {isAudioSelected && ( // Show only when currentModality is 'audio'
              <div>
                <label
                  htmlFor='voiceSelect'
                  className='mb-2 block text-sm font-medium text-gray-600'
                >
                  Voice
                </label>
                <select
                  id='voiceSelect'
                  value={currentVoice}
                  onChange={handleVoiceChange}
                  className={`w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-70 ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  disabled={connected || !isOutputSettingsOpen}
                >
                  {availableVoices.map(voice => (
                    <option key={voice} value={voice}>
                      {voice}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </fieldset>
        </div>
      </div>
      {/* --- End Left Panel --- */}
      {/* --- Right Panel (Main Chat Area) --- */}
      <div className='flex flex-grow flex-col space-y-4 rounded-r-2xl border-l border-gray-200 bg-white p-4 text-gray-700'>
        <div className='flex-grow overflow-y-auto' ref={loggerRef}>
          {!connected && !hasInteracted ? (
            <ChatIntroduction
              onStartVoice={() => {
                handleStartVoice()
                setHasInteracted(true)
              }}
            />
          ) : (
            <Logger filter='none' />
          )}
        </div>
        <div className='flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5'>
          <ConnectionButton
            connected={connected}
            connect={connectWithPermissions}
            disconnect={handleDisconnect}
          />
          <MicButton
            muted={muted}
            setMuted={setMuted}
            volume={volume}
            connected={connected}
          />
          <div className='flex-grow'>
            {' '}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={!connected}
            />{' '}
          </div>
        </div>
      </div>
      {/* --- End Right Panel --- */}
    </div> // End Main Flex Row Container
  )
}
