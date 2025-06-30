// src/app/[locale]/journal/detail/SubjectAreaSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const SubjectAreaSection: React.FC<Props> = ({ journal, t }) => {
  console.log('Journal Data:', journal) // Kiểm tra dữ liệu đã được truyền đúng chưa
  // 1. Xử lý chuỗi Areas thành một mảng, loại bỏ khoảng trắng thừa
  const areaList = journal.Areas
    ? journal.Areas.split(';')
        .map(area => area.trim())
        .filter(area => area) // filter(area => area) để loại bỏ các chuỗi rỗng
    : []

  // Xử lý để lấy danh sách Categories duy nhất
  const uniqueCategories = journal.Categories
    ? [...new Set(journal.Categories)]
    : []

  return (
    <section id='subject-area-category' className='scroll-mt-28 py-8 md:py-12'>
      <h2 className='text-foreground mb-4 text-2xl font-bold md:text-3xl'>
        {t('JournalTabs.subjectAreaTitle')}
      </h2>
      <div className='bg-muted/50 rounded-lg p-6'>
        {/* Sửa điều kiện kiểm tra, sử dụng mảng đã xử lý */}
        {areaList.length > 0 || uniqueCategories.length > 0 ? (
          <div className='space-y-6'>
            {' '}
            {/* Tăng khoảng cách giữa các mục */}
            {/* 2. Hiển thị danh sách Areas nếu có */}
            {areaList.length > 0 && (
              <div>
                <h4 className='text-foreground font-semibold'>
                  {t('JournalTabs.areasLabel')}{' '}
                  {/* Sử dụng key dịch cho Areas */}
                </h4>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {areaList.map((area, index) => (
                    <span
                      key={index}
                      // Sử dụng màu secondary để phân biệt với Categories
                      className='bg-secondary/10 text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium'
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 3. Hiển thị danh sách Categories duy nhất nếu có */}
            {uniqueCategories.length > 0 && (
              <div>
                <h4 className='text-foreground font-semibold'>
                  {t('JournalTabs.categories')}
                </h4>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {/* Lặp qua mảng categories đã được loại bỏ trùng lặp */}
                  {uniqueCategories.map(topic => (
                    <span
                      // Sử dụng chính topic làm key vì nó đã là duy nhất
                      key={topic}
                      className='bg-primary/10 rounded-full px-3 py-1 text-sm font-medium text-primary'
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className='text-muted-foreground'>
            {t('JournalTabs.noSubjectArea')}
          </p>
        )}
      </div>
    </section>
  )
}
