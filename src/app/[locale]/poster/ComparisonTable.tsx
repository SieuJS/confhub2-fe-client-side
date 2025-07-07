'use client'

import React from 'react'

const ComparisonTable: React.FC = () => {
  // Data remains the same
  const competitors = [
    'WIKICFP',
    'ICORE\nCONFERENCE\nPORTAL',
    'WORLD\nCONFERENCE\nALERTS',
    'INTERNATIONAL\nCONFERENCE\nALERTS',
    '10TIMES',
    'CONFHUB',
    'GLOBAL\nCONFERENCE & JOURNAL HUB'
  ]

  const comparisonData = [
    {
      category: 'Tìm kiếm hội nghị',
      features: [
        {
          name: 'Theo lĩnh vực',
          values: [true, true, true, true, true, true, true]
        },
        {
          name: 'Theo hình thức tổ chức',
          values: [true, false, false, false, true, true, true]
        },
        {
          name: 'Theo địa điểm',
          values: [true, false, true, true, true, true, true]
        },
        {
          name: 'Theo ngày nộp bài',
          values: [false, false, true, true, true, true, true]
        },
        {
          name: 'Theo ngày tổ chức',
          values: [true, false, true, true, true, true, true]
        },
        {
          name: 'Theo rank core portal',
          values: [false, true, false, false, false, true, true]
        }
      ]
    },
    {
      category: 'Cập nhật thông tin hội nghị',
      features: [
        { name: '', values: [false, false, false, false, false, true, true] }
      ]
    },
    {
      category: 'Nhận thông báo',
      features: [
        { name: '', values: [false, false, false, false, true, true, true] }
      ]
    },
    {
      category: 'Theo dõi hội nghị',
      features: [
        { name: '', values: [true, false, true, true, true, true, true] }
      ]
    },
    {
      category: 'Bình luận, đánh giá hội nghị',
      features: [
        { name: '', values: [false, false, false, false, true, true, true] }
      ]
    },
    {
      category: 'Đăng hội nghị',
      features: [
        { name: '', values: [true, false, true, true, true, true, true] }
      ]
    },
    {
      category: 'Định vị hội nghị',
      features: [
        { name: '', values: [false, false, true, false, true, false, true] }
      ]
    },
    {
      category: 'Chia sẻ hội nghị',
      features: [
        { name: '', values: [false, false, false, false, true, false, true] }
      ]
    },
    {
      category: 'Blacklist',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Tìm kiếm tạp chí khoa học',
      features: [
        {
          name: 'Theo quốc gia',
          values: [false, false, false, true, false, false, true]
        },
        {
          name: 'Theo lĩnh vực',
          values: [false, false, false, true, false, false, true]
        },
        {
          name: 'Theo nhà xuất bản',
          values: [false, false, false, false, false, false, true]
        }
      ]
    },
    {
      category: 'Theo dõi tạp chí',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Chatbot',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    },
    {
      category: 'Vẽ biểu đồ',
      features: [
        { name: '', values: [false, false, false, false, false, false, true] }
      ]
    }
  ]

  const CheckMark = ({ isOurProduct }: { isOurProduct: boolean }) => (
    <span
      className={`font-black ${isOurProduct ? 'text-blue-700' : 'text-purple-600'}`}
    >
      ✓
    </span>
  )

  return (
    <div className=' overflow-hidden rounded-[31px] border-[3px] border-gray-300'>
      <table
        className=' w-full border-collapse text-center'
        style={{ fontSize: '65px' }}
      >
        <thead className='font-bold'>
          <tr>
            <th className='bg-purple-300 px-2 py-2' colSpan={2}></th>
            {competitors.map((name, index) => (
              <th
                key={index}
                // THAY ĐỔI 1: Giảm padding dọc của header
                className={`whitespace-pre-line border-l-2 border-white px-3 py-2 align-middle text-white ${
                  index === competitors.length - 1
                    ? 'bg-purple-600'
                    : 'bg-sky-500'
                }`}
                style={{ fontSize: '40px' }}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='text-gray-800'>
          {comparisonData.map(group => (
            <React.Fragment key={group.category}>
              {group.features.map((feature, featureIndex) => (
                <tr
                  key={`${group.category}-${feature.name || featureIndex}`}
                  className='border-t-2 border-white'
                >
                  {featureIndex === 0 && (
                    <td
                      rowSpan={group.features.length}
                      // THAY ĐỔI 2: Giảm padding dọc của ô category
                      className='w-[20%] border-r-2 border-white bg-purple-300 px-3 py-2 font-semibold text-purple-900'
                    >
                      {group.category}
                    </td>
                  )}
                  <td
                    // THAY ĐỔI 3: Giảm padding dọc của ô feature name
                    className='w-[25%] border-r-2 border-white bg-purple-300 px-3 py-2 text-left font-medium text-purple-900'
                  >
                    {feature.name}
                  </td>
                  {feature.values.map((hasFeature, valueIndex) => (
                    <td
                      key={valueIndex}
                      // THAY ĐỔI 4: Tăng kích thước dấu tick và giảm padding dọc
                      className={`border-l-2 border-white py-0 align-middle text-9xl ${
                        valueIndex === competitors.length - 1
                          ? 'bg-purple-300'
                          : 'bg-sky-100'
                      }`}
                    >
                      {hasFeature ? (
                        <CheckMark
                          isOurProduct={valueIndex === competitors.length - 1}
                        />
                      ) : (
                        ''
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
