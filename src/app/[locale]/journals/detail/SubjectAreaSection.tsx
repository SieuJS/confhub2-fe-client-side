// src/app/[locale]/journal/detail/SubjectAreaSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const SubjectAreaSection: React.FC<Props> = ({ journal, t }) => {
  // 1. Xử lý chuỗi Areas thành một mảng, loại bỏ khoảng trắng thừa
  const areaList = journal.Areas
    ? journal.Areas.split(';').map(area => area.trim()).filter(area => area) // filter(area => area) để loại bỏ các chuỗi rỗng
    : []

  return (
    <section id='subject-area-category' className='scroll-mt-28 py-8 md:py-12'>
      <h2 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
        {t('JournalTabs.subjectAreaTitle')}
      </h2>
      <div className='rounded-lg bg-muted/50 p-6'>
        {/* Kiểm tra xem có dữ liệu nào để hiển thị không */}
        {areaList.length > 0 || (journal['Subject Area and Category']?.Topics?.length ?? 0) > 0 ? (
          <div className='space-y-6'> {/* Tăng khoảng cách giữa các mục */}
            {/* 2. Hiển thị danh sách Areas nếu có */}
            {areaList.length > 0 && (
              <div>
                <h4 className='font-semibold text-foreground'>
                  {t('JournalTabs.areasLabel')} {/* Sử dụng key dịch cho Areas */}
                </h4>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {areaList.map((area, index) => (
                    <span
                      key={index}
                      // Sử dụng màu secondary để phân biệt với Categories
                      className='rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground'
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Hiển thị danh sách Categories nếu có */}
            {journal['Subject Area and Category']?.Topics?.length > 0 && (
              <div>
                <h4 className='font-semibold text-foreground'>
                  {t('JournalTabs.categories')}
                </h4>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {journal.Categories.map((topic, index) => (
                    <span
                      key={index}
                      className='rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className='text-muted-foreground'>{t('JournalTabs.noSubjectArea')}</p>
        )}
      </div>
    </section>
  )
}