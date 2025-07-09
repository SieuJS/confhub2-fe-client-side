// src/components/ClientServerFlowchart.tsx
import React from 'react'

// --- ICON SVGs (Giữ nguyên không đổi) ---
const UserIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.8}
    stroke='currentColor'
    className='h-full w-full'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
    />
  </svg>
)
const ServerIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.8}
    stroke='currentColor'
    className='h-full w-full'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m15.54 0a2.25 2.25 0 01-2.25 2.25H4.725a2.25 2.25 0 01-2.25-2.25m15.54 0v-4.5a2.25 2.25 0 00-2.25-2.25H4.725a2.25 2.25 0 00-2.25 2.25v4.5'
    />
  </svg>
)
const DatabaseIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.8}
    stroke='currentColor'
    className='h-full w-full'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375'
    />
  </svg>
)
const CrawlerIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.8}
    stroke='currentColor'
    className='h-full w-full'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a2.652 2.652 0 00-3.75-3.75L6.17 11.42m5.25 3.75L6.17 11.42m11.317 4.913l-2.471-2.471a2.652 2.652 0 00-3.75-3.75L6.17 11.42'
    />
  </svg>
)

// --- CÁC COMPONENT HELPER ---
const ColumnHeader = ({
  name,
  icon,
  color
}: {
  name: string
  icon: React.ReactNode
  color: string
}) => (
  <div
    className={`flex w-full flex-col items-center gap-4 rounded-3xl p-6 text-center font-bold text-white shadow-lg ${color}`}
  >
    <div className='h-20 w-20'>{icon}</div>
    <span className='text-5xl'>{name}</span>
  </div>
)
const ActionBlock = ({ children }: { children: React.ReactNode }) => (
  <div className='flex w-full flex-col items-center gap-8'>{children}</div>
)
const ActionCard = ({
  text,
  color,
  className = ''
}: {
  text: string
  color: string
  className?: string
}) => (
  <div
    className={`w-full rounded-2xl border p-6 text-3xl font-semibold shadow-md ${color} ${color.replace('bg-', 'text-')} border-opacity-50 bg-white ${className}`}
  >
    {text}
  </div>
)
const Arrow = ({
  label,
  direction = 'right',
  top,
  left
}: {
  label: string
  direction?: 'left' | 'right'
  top: string
  left: string
}) => {
  const ArrowIcon =
    direction === 'right' ? (
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
      />
    ) : (
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
      />
    )
  return (
    <div
      className='absolute flex w-60 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center gap-2'
      style={{ top, left }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={2.5}
        stroke='currentColor'
        className='h-12 w-12 text-gray-500'
      >
        {ArrowIcon}
      </svg>
      {label && (
        <span className='text-3xl font-semibold text-gray-600'>{label}</span>
      )}
    </div>
  )
}
const DiagonalArrow = ({
  label,
  x1,
  y1,
  x2,
  y2
}: {
  label: string
  x1: string
  y1: string
  x2: string
  y2: string
}) => (
  <svg className='pointer-events-none absolute left-0 top-0 h-full w-full'>
    <defs>
      <marker
        id='arrowhead'
        markerWidth='10'
        markerHeight='7'
        refX='0'
        refY='3.5'
        orient='auto'
      >
        <polygon points='0 0, 10 3.5, 0 7' fill='#6b7280' />
      </marker>
    </defs>
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke='#6b7280'
      strokeWidth='3'
      markerEnd='url(#arrowhead)'
    />
    {label && (
      <text
        x={`calc((${x1} + ${x2}) / 2)`}
        y={`calc((${y1} + ${y2}) / 2 - 15px)`}
        fill='#4b5563'
        fontSize='24px'
        fontWeight='600'
        textAnchor='middle'
        className='pointer-events-auto'
      >
        {label}
      </text>
    )}
  </svg>
)

// --- ĐỊNH NGHĨA TYPE CHO ACTION ---
type ActionType = {
  text: string
  className?: string
  colorKey?: string
}

// --- DỮ LIỆU CẤU TRÚC ---
const flowchartData: Array<{
  id: string
  header?: { name: string; icon: React.ReactNode } // header is now optional
  colorKey?: string // colorKey is now optional
  actionGroups?: ActionType[][] // actionGroups is now optional
  sections?: Array<{
    // new property for split columns
    id: string
    header: { name: string; icon: React.ReactNode }
    colorKey: string
    actions: ActionType[]
  }>
}> = [
  {
    id: 'client',
    header: { name: 'Client (Frontend)', icon: <UserIcon /> },
    colorKey: 'client',
    actionGroups: [
      [{ text: 'Gửi yêu cầu TÌM KIẾM' }],
      [
        {
          text: 'Hiển thị kết quả',
          className: 'h-64 flex items-center '
        }
      ],
      [{ text: 'Gửi yêu cầu CẬP NHẬT' }]
    ]
  },
  {
    id: 'server',
    header: { name: 'Server (Backend)', icon: <ServerIcon /> },
    colorKey: 'server',
    actionGroups: [
      [{ text: 'Nhận YC, gửi cho DB' }],
      [{ text: 'Nhận KQ từ DB, trả về FE' }],
      [{ text: 'Nhận YC, gửi cho Crawler' }],
      [{ text: 'Nhận KQ Crawl' }, { text: 'Lưu vào DB', colorKey: 'db' }]
    ]
  },
  {
    id: 'services',
    sections: [
      {
        id: 'database',
        header: { name: 'Database', icon: <DatabaseIcon /> },
        colorKey: 'db',
        actions: [
          {
            text: 'Truy vấn DB',
            className: 'h-48 flex items-center justify-center' // Dài gấp đôi
          }
        ]
      },
      {
        id: 'crawler',
        header: { name: 'Server Crawl', icon: <CrawlerIcon /> },
        colorKey: 'crawler',
        actions: [{ text: 'Crawl dữ liệu' }]
      }
    ]
  }
]

// --- TYPESCRIPT VÀ DỮ LIỆU MŨI TÊN ---
type NormalArrowType = {
  type: 'normal'
  direction?: 'left' | 'right'
  top: string
  left: string
}
type DiagonalArrowType = {
  type: 'diagonal'
  x1: string
  y1: string
  x2: string
  y2: string
}
type ArrowDataType = (NormalArrowType | DiagonalArrowType) & { label?: string }

// [UPDATED] Đã xóa 2 mũi tên chéo
const arrowData: ArrowDataType[] = [
  // Luồng tìm kiếm
  { type: 'normal', top: '33%', left: '31.5%' }, // Gửi yêu cầu TÌM KIẾM -> Nhận YC, gửi cho DB
  { type: 'normal', top: '21%', left: '68.5%' }, // Nhận YC, gửi cho DB -> Truy vấn DB
  { type: 'normal', direction: 'left', top: '40%', left: '68.5%' }, // Truy vấn DB -> Nhận KQ từ DB, trả về FE
  { type: 'normal', direction: 'left', top: '48%', left: '31.5%' }, // Nhận KQ từ DB, trả về FE -> Hiển thị

  // Luồng cập nhật
  { type: 'normal', top: '75%', left: '31.5%' }, // Gửi yêu cầu CẬP NHẬT -> Nhận YC, gửi cho Crawler
  { type: 'normal', top: '91%', left: '68.5%' }, // Nhận YC, gửi cho Crawler -> Crawl dữ liệu
  { type: 'normal', direction: 'left', top: '91%', left: '31.5%' } // Crawl dữ liệu -> Nhận KQ Crawl
]

// --- COMPONENT CHÍNH ---
const ClientServerFlowchart: React.FC = () => {
  const colors = {
    client: { bg: 'bg-blue-500', border: 'border-blue-500' },
    server: { bg: 'bg-teal-600', border: 'border-teal-600' },
    db: { bg: 'bg-amber-500', border: 'border-amber-500' },
    crawler: { bg: 'bg-purple-600', border: 'border-purple-600' }
  }

  return (
    <div className='w-full rounded-3xl bg-white p-10 font-sans'>
      <h3 className='mb-16 text-center text-9xl font-bold text-gray-800'>
        Luồng Hoạt Động Hệ Thống
      </h3>
      <div className='relative'>
        <div className='flex items-start justify-between'>
          {flowchartData.map(column => (
            <div
              key={column.id}
              className='flex w-1/4 flex-none flex-col items-center'
            >
              {/* Render cho cột bình thường (Client, Server) */}
              {column.header && (
                <div className='flex w-full flex-col items-center gap-y-8'>
                  <ColumnHeader
                    name={column.header.name}
                    icon={column.header.icon}
                    color={colors[column.colorKey as keyof typeof colors].bg}
                  />
                  <div className='flex h-full w-full flex-col justify-between'>
                    {column.actionGroups?.map((group, groupIndex) => (
                      <ActionBlock key={groupIndex}>
                        {group.map((action, actionIndex) => {
                          const colorKey = action.colorKey || column.colorKey
                          const colorClass =
                            colors[colorKey as keyof typeof colors].border
                          return (
                            <ActionCard
                              key={actionIndex}
                              text={action.text}
                              color={colorClass}
                              className={action.className || ''}
                            />
                          )
                        })}
                      </ActionBlock>
                    ))}
                  </div>
                </div>
              )}

              {/* Render cho cột được tách (Services) */}
              {column.sections &&
                column.sections.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className={`flex w-full flex-col items-center gap-y-8 ${
                      sectionIndex < column.sections!.length - 1 ? 'mb-12' : ''
                    }`}
                  >
                    <ColumnHeader
                      name={section.header.name}
                      icon={section.header.icon}
                      color={colors[section.colorKey as keyof typeof colors].bg}
                    />
                    <ActionBlock>
                      {section.actions.map((action, actionIndex) => (
                        <ActionCard
                          key={actionIndex}
                          text={action.text}
                          color={
                            colors[section.colorKey as keyof typeof colors]
                              .border
                          }
                          className={action.className || ''}
                        />
                      ))}
                    </ActionBlock>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Render các mũi tên */}
        {arrowData.map((arrow, index) => {
          if (arrow.type === 'diagonal') {
            return (
              <DiagonalArrow
                key={`arrow-${index}`}
                label={arrow.label || ''}
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
              />
            )
          }
          return (
            <Arrow
              key={`arrow-${index}`}
              label={arrow.label || ''}
              direction={arrow.direction}
              top={arrow.top}
              left={arrow.left}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ClientServerFlowchart
