import React from 'react'
import {
  Users,
  Server,
  MessageSquare,
  Shield,
  Link,
  Settings,
  CheckCircle,
  BrainCircuit,
  Cpu,
  Share2,
  Wrench,
  PlusCircle,
  Database,
  MemoryStick,
  FileText,
  BookOpen,
  Globe,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  DatabaseZap,
  Box,
  Mail,
  Map,
  List,
  UploadCloud
} from 'lucide-react'

// Component phụ: Khối chức năng chính
const ArchBlock: React.FC<{
  title: string
  icon: React.ReactNode
  color: string
  children?: React.ReactNode
}> = ({ title, icon, color, children }) => (
  <div
    className={`border-l-8 bg-white ${color} flex w-full flex-col items-center rounded-xl p-2 text-center shadow-lg`}
  >
    <div className='mb-2 flex flex-col items-center'>
      <div
        className={`rounded-full bg-opacity-10 p-2 ${color.replace('border', 'bg').replace('-500', '-100')}`}
      >
        {icon}
      </div>
      <h3 className='mt-2 text-base font-bold text-gray-800'>{title}</h3>
    </div>
    <div className='w-full space-y-2 text-xs text-gray-600'>{children}</div>
  </div>
)

// Component phụ: Icon kèm nhãn ngắn
const IconLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label
}) => (
  <div className='flex items-center justify-center space-x-2 rounded-md  p-2'>
    {icon}
    <span className='font-medium text-gray-700'>{label}</span>
  </div>
)

// Component phụ: Mũi tên luồng
const FlowArrow: React.FC<{
  direction: 'down' | 'up' | 'right'
  label?: string
  className?: string
}> = ({ direction, label, className }) => {
  const ArrowComponent =
    direction === 'down' ? ArrowDown : direction === 'up' ? ArrowUp : ArrowRight
  return (
    <div
      className={`my-3 flex flex-col items-center justify-center ${className}`}
    >
      {label && (
        <span className='mb-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600'>
          {label}
        </span>
      )}
      <ArrowComponent className='text-gray-400' size={28} />
    </div>
  )
}

// Component chính của Sơ đồ Kiến trúc
const ChatbotArchitectureDiagram: React.FC = () => {
  return (
    <div className='mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white p-4 font-sans shadow-2xl'>
      <div className='mb-8 border-b pb-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-800'>
          Sơ đồ Kiến trúc Hệ thống Chatbot
        </h1>
        <p className='text-md text-gray-500'>Nền tảng AI Hội thoại Đa Tác tử</p>
      </div>

      <div className='grid flex-grow grid-cols-3 gap-4'>
        {/* === CỘT 1: GIAO TIẾP === */}
        <div className='flex flex-col items-center space-y-4'>
          <h2 className='text-xl font-semibold text-blue-700'>Giao tiếp</h2>
          <ArchBlock
            title='Client'
            icon={<Users size={32} className='text-blue-500' />}
            color='border-blue-500'
          />
          <FlowArrow direction='down' label='JWT' />
          <ArchBlock
            title='Socket.IO Server'
            icon={<Server size={32} className='text-blue-500' />}
            color='border-blue-500'
          >
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <IconLabel icon={<Shield size={16} />} label='Auth' />
              <IconLabel icon={<Link size={16} />} label='Connect' />
              <IconLabel icon={<Settings size={16} />} label='Handlers' />
              <IconLabel icon={<CheckCircle size={16} />} label='Ready' />
            </div>
          </ArchBlock>
          <FlowArrow direction='down' label='send_message' />
          <ArchBlock
            title='Message Handler'
            icon={<MessageSquare size={32} className='text-blue-500' />}
            color='border-blue-500'
          />
        </div>

        {/* === CỘT 2: NÃO BỘ XỬ LÝ === */}
        <div className='flex flex-col items-center space-y-4 border-x-2 border-dashed border-gray-300 px-8'>
          <h2 className='text-xl font-semibold text-green-700'>Não bộ Xử lý</h2>
          <ArchBlock
            title='Orchestrator'
            icon={<Cpu size={32} className='text-green-500' />}
            color='border-green-500'
          />
          <FlowArrow direction='down' />
          <div className='relative w-full rounded-lg border-2 border-green-600 bg-green-50/50 p-4'>
            <div className='absolute -top-3.5 left-1/2 -translate-x-1/2  px-2 font-bold text-green-600'>
              ReAct Loop
            </div>
            <ArchBlock
              title='Host Agent'
              icon={<BrainCircuit size={32} className='text-green-600' />}
              color='border-green-600'
            >
              <IconLabel icon={<Share2 size={16} />} label='Route to Agent' />
            </ArchBlock>

            <div className='my-2 flex justify-around'>
              <ArrowDown className='text-purple-500' />
              <span className='self-center text-xs font-bold text-purple-500'>
                Request
              </span>
              <span className='self-center text-xs font-bold text-teal-500'>
                Response
              </span>
              <ArrowUp className='text-teal-500' />
            </div>

            <div className='rounded-lg  p-3 text-center'>
              <h4 className='mb-2 text-sm font-semibold text-gray-700'>
                Sub-Agents (Chuyên viên)
              </h4>
              <div className='flex items-center justify-around text-yellow-600'>
                <BookOpen size={24} />
                <FileText size={24} />
                <Globe size={24} />
                <PlusCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* === CỘT 3: TÀI NGUYÊN & DỮ LIỆU === */}
        <div className='flex flex-col items-center space-y-4'>
          <h2 className='text-xl font-semibold text-orange-700'>
            Tài nguyên & Dữ liệu
          </h2>
          <div className='relative w-full'>
            <FlowArrow
              direction='right'
              className='absolute -left-12 top-1/2 -translate-y-1/2'
            />
            <ArchBlock
              title='Kho Công cụ'
              icon={<Wrench size={32} className='text-orange-500' />}
              color='border-orange-500'
            >
              <div className='grid w-full grid-cols-2 gap-2'>
                <IconLabel icon={<DatabaseZap size={16} />} label='Query DB' />
                <IconLabel icon={<List size={16} />} label='Display UI' />
                <IconLabel icon={<Box size={16} />} label='System API' />
                <IconLabel icon={<Map size={16} />} label='Google Map' />
                <IconLabel
                  icon={<UploadCloud size={16} />}
                  label='File Upload'
                />
                <IconLabel icon={<Mail size={16} />} label='Send Email' />
              </div>
            </ArchBlock>
          </div>

          <div className='flex w-full flex-grow flex-col justify-end space-y-4'>
            <div className='relative w-full'>
              <FlowArrow
                direction='right'
                className='absolute -left-12 top-1/2 -translate-y-1/2'
              />
              <ArchBlock
                title='PostgreSQL'
                icon={<Database size={32} className='text-purple-500' />}
                color='border-purple-500'
              >
                <p className='font-semibold'>Bộ não Tri thức</p>
                <p>(Dữ liệu có cấu trúc)</p>
              </ArchBlock>
            </div>
            <div className='relative w-full'>
              <FlowArrow
                direction='right'
                className='absolute -left-12 top-1/2 -translate-y-1/2'
              />
              <ArchBlock
                title='MongoDB'
                icon={<MemoryStick size={32} className='text-teal-500' />}
                color='border-teal-500'
              >
                <p className='font-semibold'>Bộ não Hội thoại</p>
                <p>(Lịch sử trò chuyện)</p>
              </ArchBlock>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatbotArchitectureDiagram
