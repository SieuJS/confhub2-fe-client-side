// src/app/[locale]/journal/detail/CitationMetricsSection.tsx
import React from 'react'
import { BookCopy, FileText, Quote, BarChart2 } from 'lucide-react'
import { JournalData } from '@/src/models/response/journal.response'

const MetricItem = ({ icon: Icon, value, label }: any) => (
  <div className='flex items-start gap-4 rounded-lg bg-background p-4'>
    <Icon className='mt-1 h-6 w-6 text-primary' />
    <div>
      <p className='text-foreground text-2xl font-bold'>{value || 'N/A'}</p>
      <p className='text-muted-foreground text-sm'>{label}</p>
    </div>
  </div>
)

interface Props {
  journal: JournalData // Sử dụng any để truy cập các trường động
  t: (key: string, options?: { [key: string]: any }) => string // Cập nhật kiểu cho hàm t
}

export const CitationMetricsSection: React.FC<Props> = ({ journal, t }) => {
  // Logic để tìm key "Total Docs." với năm lớn nhất
  let latestTotalDocsYear: number | null = null
  let latestTotalDocsValue: string | number | undefined = undefined

  // Duyệt qua tất cả các key trong đối tượng journal
  for (const stat of journal.Statistics) {
    if (stat.category.startsWith('Total Docs. (')) {
      // Trích xuất năm từ key, ví dụ: "Total Docs. (2023)" -> 2023
      const match = stat.category.match(/\((\d{4})\)/)
      if (match && match[1]) {
        const year = parseInt(match[1], 10)
        // Nếu đây là năm lớn hơn hoặc là năm đầu tiên chúng ta tìm thấy
        if (latestTotalDocsYear === null || year > latestTotalDocsYear) {
          latestTotalDocsYear = year
          latestTotalDocsValue = journal.Statistics.find(s =>
            s.category.includes(stat.category)
          )?.statistic
        }
      }
    }
  }

  // Nếu không tìm thấy Total Docs. theo năm nào, có thể fallback hoặc hiển thị N/A
  const displayTotalDocsYear = latestTotalDocsYear || 'N/A'
  const displayTotalDocsValue = latestTotalDocsValue

  return (
    <section
      id='citation-metrics'
      className='border-border scroll-mt-28 border-b py-8 md:py-12'
    >
      <h2 className='text-foreground mb-6 text-2xl font-bold md:text-3xl'>
        {t('CitationMetrics.title')}
      </h2>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        {/* 3. Sử dụng key động cho value và label */}
        <MetricItem
          icon={FileText}
          value={latestTotalDocsValue || 'N/A'}
          label={t('CitationMetrics.totalDocs', { year: displayTotalDocsYear })}
        />
        <MetricItem
          icon={BookCopy}
          value={
            journal.Statistics.find(t =>
              t.category.includes('Total Docs. (3years)')
            )?.statistic || 'N/A'
          }
          label={t('CitationMetrics.totalDocs3years')}
        />
        <MetricItem
          icon={Quote}
          value={
            journal.Statistics.find(t =>
              t.category.includes('Total Cites (3years)')
            )?.statistic
          }
          label={t('CitationMetrics.totalCites3years')}
        />
        <MetricItem
          icon={BarChart2}
          value={
            journal.Statistics.find(t =>
              t.category.includes('Cites / Doc. (2years')
            )?.statistic
          }
          label={t('CitationMetrics.citesPerDoc2years')}
        />
      </div>
    </section>
  )
}
