// app/poster/page.tsx
import A4PaperContainer from './A4PaperContainer'
import ApiCallAnatomyDiagram from './ApiCallAnatomyDiagram'
import ApiCallAnatomyV2Diagram from './ApiCallAnatomyV2Diagram'
import ApiIllustrationDiagram from './ApiIllustrationDiagram'
import ChatbotArchitectureDiagram from './ChatbotArchitectureDiagram'
import DataProcessingFlowchart1 from './DataProcessingFlowchart1'
import DataProcessingFlowchartPhase2 from './DataProcessingFlowchart2'
import FlowchartDiagram from './FlowchartDiagram'
import DataProcessingFlowchartPhase3 from './FlowchartPhase3'
import MultiAgentPipelineDiagram from './MultiAgentPipelineDiagram'
import Poster from './Poster'
import PosterExporter from './PosterExporter'
import ResponseProcessingPipelineDiagram from './ResponseProcessingPipelineDiagram'

export default function PosterPage() {
  return (
    <main>
      {/* <DataProcessingFlowchart1 /> */}
      {/* <DataProcessingFlowchartPhase2 /> */}
      {/* <DataProcessingFlowchartPhase3 /> */}
      {/* <ChatbotArchitectureDiagram /> */}
      <Poster />
      {/* <PosterExporter /> */}
      {/* <A4PaperContainer title='Hình 1: Sơ đồ luồng xử lý API tích hợp cơ chế Retry và Fallback'>
        <FlowchartDiagram />
      </A4PaperContainer>

      <A4PaperContainer title='Hình 2: Giải phẫu chi tiết một lệnh gọi API (determineLinks)'>
        <ApiIllustrationDiagram />
      </A4PaperContainer>

      <A4PaperContainer title='Hình 3: Quy trình xử lý và xác thực kết quả trả về từ Gemini API'>
        <ResponseProcessingPipelineDiagram />
      </A4PaperContainer>

      <A4PaperContainer title='Hình 4: Kiến trúc hệ thống theo mô hình Pipeline Đa Tác nhân AI'>
        <MultiAgentPipelineDiagram />
      </A4PaperContainer> */}
    </main>
  )
}
