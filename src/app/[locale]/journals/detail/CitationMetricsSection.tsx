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
  t: (key: string) => string
}

export const CitationMetricsSection: React.FC<Props> = ({ journal, t }) => {
  return (
    <section id='citation-metrics' className='scroll-mt-28 border-b border-border py-8 md:py-12'>
      <h2 className='mb-6 text-2xl font-bold text-foreground md:text-3xl'>
        {t('CitationMetrics.title')}
      </h2>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        <MetricItem icon={FileText} value={journal['Total Docs. (2023)']} label={t('CitationMetrics.totalDocs2023')} />
        <MetricItem icon={BookCopy} value={journal['Total Docs. (3years)']} label={t('CitationMetrics.totalDocs3years')} />
        <MetricItem icon={Quote} value={journal['Total Cites (3years)']} label={t('CitationMetrics.totalCites3years')} />
        <MetricItem icon={BarChart2} value={journal['Cites / Doc. (2years)']} label={t('CitationMetrics.citesPerDoc2years')} />
      </div>
    </section>
  )
}