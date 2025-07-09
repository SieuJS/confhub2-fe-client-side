import React from 'react'
import CodeBlock from './CodeBlock'

// --- Dữ liệu từ các ảnh của bạn ---
const systemInstructionContent = `**Role**: You are an expert conference information retriever. Your primary goal is to find the official website of ${'{Title}'} (${'{Acronym}'}) conference in 2025 and extract its Call for Papers (CFP) and Important Dates information...
...
**Instructions**:
**Prioritize 2025 Information:** First, meticulously search for the official conference website for the year 2025...
**Website Analysis and Adaptation:** Carefully examine the website's content...
  * **Conference Name Changes:** ...
  * **Link Discovery within Content:** ...look for URLs within the \`href\` attribute of \`<a>\` tags, AND the \`value\` attribute of \`<option>\` tags...
...
**Return the Results in the EXACT Format:** ...Return the following information in the precise format demonstrated in the provided examples...
`

const fewShotExample1 = `Input:
Conference Info:
  Title: Smart Card Research and Advanced Application Conference
  Acronym: CARDIS
Candidate Website Contents:
  Source Link [1]: http://cardis.org/
  Content [1]:
    CARDIS has merged with COSADE, please find more information on CASCADE
    href=""https://cascade-conference.org"" - cascade-conference.org...
---
Output:
{
  "Official Website": "https://cascade-conference.org/",
  "Call for papers link": "None",
  "Important dates link": "None"
}`

const fewShotExample2 = `Input:
Conference Info:
  Title: International Conference Abstract State Machines, Alloy, B, TLA, VDM, and Z
  Acronym: ABZ
Candidate Website Contents:
  Source Link [1]: https://abz-conf.org/site/2025/calls/
  Content [1]:
    ABZ 2025 - 11th International Conference on Rigorous State Based Methods
    (abstract: 15th of February, ...)
---
  Source Link [2]: https://abz-conf.org/site/
  Content [2]:
    href=""/site/2025/"" - ABZ 2025 - 11th International Conference...
    Düsseldorf (Germany) - Jun 10, 2025 – Jun 13, 2025...
---
Output:
{
  "Official Website": "https://abz-conf.org/site/2025",
  "Call for papers link": "https://abz-conf.org/site/2025/calls/",
  "Important dates link": "https://abz-conf.org/site/2025/importantdates/"
}`

const mainPromptContent = `Conference Info:
  Title: Asian Conference on Intelligent Information and Database Systems
  Acronym: ACIIDS
Candidate Website Contents:
  Source Link [1]: https://aciids.pwr.edu.pl/2026/
  Content [1]:
    ACIIDS 2026 is an international scientific conference...
    href="dates.php" - Dates
    href="forauthors-howtosubmit.php" - How to Submit
...`

const fullParamsContent = `const paramsForSDK = {
  model: "gemini-1.5-flash",
  contents: [
    // few-shot examples
    { role: "user", parts: [{ text: "..." }] },
    { role: "model", parts: [{ text: "{...}" }] },
    { role: "user", parts: [{ text: "..." }] },
    { role: "model", parts: [{ text: "{...}" }] },
    // main prompt
    { role: "user", parts: [{ text: "..." }] },
  ],
  config: {
    systemInstruction: { role: "system", parts: [{ text: "**Role**: You are an expert..." }] },
    temperature: 0.1,
    topP: 0.5,
    // ...
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: { /* ... */ },
      required: [ /* ... */ ]
    }
  }
};`

const sdkCallContent = `import { GoogleGenerativeAI } from '@google/genai';
const ai = new GoogleGenerativeAI({apiKey: "..."});

// Sử dụng bộ tham số đã lắp ráp
const determineLinksResult = await ai.model
  .generateContent(paramsForSDK);`

const resultOutputContent = `{
  "Official Website": "https://aciids.pwr.edu.pl/2026/",
  "Call for papers link": "https://aciids.pwr.edu.pl/2026/forauthors-howtosubmit.php",
  "Important dates link": "https://aciids.pwr.edu.pl/2026/dates.php"
}`

const cachedParamsContent = `const paramsForSDK = {
  model: "gemini-1.5-flash", // Phải khớp model đã cache
  contents: [
    // Không cần few-shot examples nữa
    // Chỉ cần prompt chính
    { role: "user", parts: [{ text: "..." }] },
  ],
  config: {
    // Không cần system instruction nữa
    temperature: 0.1,
    // ...
  },
  // THÀNH PHẦN MỚI: Tham chiếu đến cache đã tạo
  // SDK sẽ tự động hợp ngữ cảnh này với 'contents' mới.
  cachedContent: "cachedContents/xyz-789-abcdef"
};`

// --- SVG Icons ---
const PlusIcon = () => (
  <svg
    className='my-4 h-10 w-10 text-gray-400'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 4v16m8-8H4'
    />
  </svg>
)
const ArrowDownIcon = () => (
  <svg
    className='my-4 h-12 w-12 text-gray-400'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M16 17l-4 4m0 0l-4-4m4 4V3'
    />
  </svg>
)
const LightbulbIcon = () => (
  <svg
    className='mr-3 h-8 w-8 text-yellow-500'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
    />
  </svg>
)

const ApiCallAnatomyV2Diagram: React.FC = () => {
  return (
    <div className='space-y-8'>
      {/* --- Phần 1: Các thành phần cấu tạo --- */}
      <div>
        <h3 className='mb-4 text-center text-xl font-bold text-gray-700'>
          1. Các Thành Phần Cấu Tạo Prompt
        </h3>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <CodeBlock title='System Instruction'>
            {systemInstructionContent}
          </CodeBlock>
          <div className='space-y-4'>
            <CodeBlock title='Few-shot Example #1'>{fewShotExample1}</CodeBlock>
            <CodeBlock title='Few-shot Example #2'>{fewShotExample2}</CodeBlock>
          </div>
        </div>
        <div className='flex justify-center'>
          <PlusIcon />
        </div>
        <CodeBlock title='Main Prompt'>{mainPromptContent}</CodeBlock>
      </div>

      {/* --- Phần 2: Lắp ráp và thực thi --- */}
      <div className='flex flex-col items-center'>
        <ArrowDownIcon />
        <h3 className='mb-4 text-center text-xl font-bold text-gray-700'>
          2. Lắp Ráp & Thực Thi
        </h3>
        <CodeBlock title='Bộ tham số hoàn chỉnh (paramsForSDK)'>
          {fullParamsContent}
        </CodeBlock>
        <CodeBlock title='Gọi API bằng SDK'>{sdkCallContent}</CodeBlock>
        <CodeBlock title='Kết quả phản hồi (đã xử lý)'>
          {resultOutputContent}
        </CodeBlock>
      </div>

      {/* --- Phần 3: Tối ưu hóa --- */}
      <div>
        <h3 className='mb-4 text-center text-xl font-bold text-gray-700'>
          3. Tối ưu hóa với Context Caching
        </h3>
        <div className='rounded-lg border-2 border-dashed border-yellow-300 bg-yellow-50 p-6'>
          <div className='mb-4 flex items-center'>
            <LightbulbIcon />
            <p className='text-yellow-800'>
              <span className='font-bold'>Pro Tip:</span> Sau lần gọi đầu tiên
              thành công, `systemInstruction` và `few-shot examples` có thể được
              cache lại. Ở các lần gọi tiếp theo, chỉ cần gửi prompt chính và
              tham chiếu đến cache.
            </p>
          </div>
          <CodeBlock title='Bộ tham số khi áp dụng cachedContent'>
            {cachedParamsContent}
          </CodeBlock>
          <ul className='mt-4 list-inside list-disc space-y-1 text-sm text-green-700'>
            <li>
              <span className='font-bold'>Giảm chi phí:</span> Không cần gửi lại
              các token của ngữ cảnh đã cache.
            </li>
            <li>
              <span className='font-bold'>Tăng tốc độ:</span> Giảm thời gian xử
              lý và độ trễ mạng.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ApiCallAnatomyV2Diagram
