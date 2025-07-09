import React from 'react'

const Section = ({
  title,
  color,
  children
}: {
  title: string
  color: string
  children: React.ReactNode
}) => (
  <div
    className={`border-2 border-dashed border-${color}-400 bg-${color}-50 rounded-lg p-4`}
  >
    <h3 className={`text-lg font-semibold text-${color}-800 mb-2`}>{title}</h3>
    {children}
  </div>
)

const ApiCallAnatomyDiagram: React.FC = () => {
  return (
    <div className='space-y-4'>
      <div className='rounded-lg bg-gray-800 p-4 text-center text-white shadow-md'>
        <h2 className='font-mono text-xl'>paramsForSDK</h2>
        <p className='text-sm'>Đối tượng tham số hoàn chỉnh</p>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Section title='model' color='blue'>
          <p className='font-mono text-blue-700'>
            &quot;gemini-1.5-flash&quot;
          </p>
        </Section>

        <Section title='generationConfig' color='green'>
          <ul className='list-inside list-disc space-y-1 text-sm text-green-800'>
            <li>
              <span className='font-semibold'>temperature:</span> 0.2
            </li>
            <li>
              <span className='font-semibold'>maxOutputTokens:</span> 8192
            </li>
            <li>
              <span className='font-semibold'>responseMimeType:</span>{' '}
              &quot;application/json&quot;
            </li>
          </ul>
        </Section>
      </div>

      <Section title='contents' color='purple'>
        <div className='space-y-3 rounded bg-purple-100 p-2'>
          <div className='rounded border border-gray-300 bg-white p-2'>
            <p className='text-xs font-semibold text-gray-500'>
              SYSTEM INSTRUCTION
            </p>
            <p className='text-sm'>
              &quot;Bạn là một chuyên gia xử lý dữ liệu...&quot;
            </p>
          </div>
          <div className='rounded border border-gray-300 bg-white p-2'>
            <p className='text-xs font-semibold text-gray-500'>
              FEW-SHOT EXAMPLE
            </p>
            <p className='text-sm'>User: ... | Model: ...</p>
          </div>
          <div className='rounded border border-indigo-300 bg-indigo-50 p-2 shadow'>
            <p className='text-xs font-semibold text-indigo-600'>MAIN PROMPT</p>
            <p className='text-sm'>
              &quot;Trích xuất thông tin từ văn bản sau: ... &quot;
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}

export default ApiCallAnatomyDiagram
