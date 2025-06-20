// src/app/[locale]/journal/detail/CitationMetricsSection.tsx
import React from 'react'
import { BookCopy, FileText, Quote, BarChart2 } from 'lucide-react'

const MetricItem = ({ icon: Icon, value, label }: any) => (
  <div className='flex items-start gap-4 rounded-lg bg-background p-4'>
    <Icon className='mt-1 h-6 w-6 text-primary' />
    <div>
      <p className='text-2xl font-bold text-foreground'>{value || 'N/A'}</p>
      <p className='text-sm text-muted-foreground'>{label}</p>
    </div>
  </div>
)

interface Props {
  journal: any // Sử dụng any để truy cập các trường động
  t: (key: string, options?: { [key: string]: any }) => string // Cập nhật kiểu cho hàm t
}

export const CitationMetricsSection: React.FC<Props> = ({ journal, t }) => {
  // Logic để tìm key "Total Docs." với năm lớn nhất
  let latestTotalDocsYear: number | null = null;
  let latestTotalDocsValue: string | number | undefined = undefined;

  // Duyệt qua tất cả các key trong đối tượng journal
  for (const key in journal) {
    if (key.startsWith('Total Docs. (')) {
      // Trích xuất năm từ key, ví dụ: "Total Docs. (2023)" -> 2023
      const match = key.match(/\((\d{4})\)/);
      if (match && match[1]) {
        const year = parseInt(match[1], 10);
        // Nếu đây là năm lớn hơn hoặc là năm đầu tiên chúng ta tìm thấy
        if (latestTotalDocsYear === null || year > latestTotalDocsYear) {
          latestTotalDocsYear = year;
          latestTotalDocsValue = journal[key];
        }
      }
    }
  }

  // Nếu không tìm thấy Total Docs. theo năm nào, có thể fallback hoặc hiển thị N/A
  const displayTotalDocsYear = latestTotalDocsYear || 'N/A';
  const displayTotalDocsValue = latestTotalDocsValue;

  return (
    <section id='citation-metrics' className='scroll-mt-28 border-b border-border py-8 md:py-12'>
      <h2 className='mb-6 text-2xl font-bold text-foreground md:text-3xl'>
        {t('CitationMetrics.title')}
      </h2>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {/* Chỉ hiển thị Total Docs. của năm gần nhất tìm được */}
        <MetricItem
          icon={FileText}
          value={displayTotalDocsValue}
          label={t('CitationMetrics.totalDocsYearly', { year: displayTotalDocsYear })}
        />
        <MetricItem icon={BookCopy} value={journal['Total Docs. (3years)']} label={t('CitationMetrics.totalDocs3years')} />
        <MetricItem icon={Quote} value={journal['Total Cites (3years)']} label={t('CitationMetrics.totalCites3years')} />
        <MetricItem icon={BarChart2} value={journal['Cites / Doc. (2years)']} label={t('CitationMetrics.citesPerDoc2years')} />
      </div>
    </section>
  )
}