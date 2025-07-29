// app/[locale]/conferences/ConferencesPageClient.tsx

'use client'

import { useTranslations } from 'next-intl'
import SearchSection from '@/src/app/[locale]/conferences/SearchSection' // Cập nhật đường dẫn
import ResultsSection from '@/src/app/[locale]/conferences/ResultsSection' // Cập nhật đường dẫn
import { useRouter, usePathname } from '@/src/navigation'
import { useCallback } from 'react'
import useUserBlacklist from '@/src/hooks/auth/useUserBlacklist'
import { ConferenceListResponse } from '@/src/models/response/conference.list.response'
import { AppPathname } from '@/src/navigation'

// Định nghĩa lại interface cho đúng
interface SearchParamsForURL {
  keyword?: string;
  title?: string;
  acronym?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  location?: string | null;
  type?: 'Online' | 'Offline' | 'Hybrid' | null;
  subFromDate?: Date | null;
  subToDate?: Date | null;
  rank?: string | null;
  source?: string | null;  
  publisher?: string | null;
  topics?: string[];
  fieldOfResearch?: string[];
}

interface ConferencesPageClientProps {
  locale: string;
  initialData: ConferenceListResponse; // Nhận dữ liệu ban đầu từ Server Component
}

export default function ConferencesPageClient({ locale, initialData }: ConferencesPageClientProps) {
  const t = useTranslations('')
  const { blacklistedEventIds } = useUserBlacklist()

  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = useCallback(
    (searchParamsFromComponent: SearchParamsForURL) => {
      const newParams = new URLSearchParams()
      if (searchParamsFromComponent.keyword) newParams.set('keyword', searchParamsFromComponent.keyword);
      if (searchParamsFromComponent.title) newParams.set('title', searchParamsFromComponent.title);
      if (searchParamsFromComponent.acronym) newParams.set('acronym', searchParamsFromComponent.acronym);
      if (searchParamsFromComponent.location) newParams.set('country', searchParamsFromComponent.location);
      if (searchParamsFromComponent.type) newParams.set('type', searchParamsFromComponent.type);
      if (searchParamsFromComponent.fromDate) newParams.set('fromDate', searchParamsFromComponent.fromDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.toDate) newParams.set('toDate', searchParamsFromComponent.toDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.rank) newParams.set('rank', searchParamsFromComponent.rank);
      if (searchParamsFromComponent.source) newParams.set('source', searchParamsFromComponent.source);
      if (searchParamsFromComponent.publisher) newParams.set('publisher', searchParamsFromComponent.publisher);
      if (searchParamsFromComponent.subFromDate) newParams.set('subFromDate', searchParamsFromComponent.subFromDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.subToDate) newParams.set('subToDate', searchParamsFromComponent.subToDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.topics && searchParamsFromComponent.topics.length > 0) {
        searchParamsFromComponent.topics.forEach(topic => newParams.append('topics', topic));
      }
      if (searchParamsFromComponent.fieldOfResearch && searchParamsFromComponent.fieldOfResearch.length > 0) {
        searchParamsFromComponent.fieldOfResearch.forEach(field => newParams.append('researchFields', field));
      }

      // ĐIỀU CHỈNH Ở ĐÂY:
      // Chuyển đổi URLSearchParams thành một object đơn giản
      const query: { [key: string]: string | string[] } = {};
      for (const [key, value] of newParams.entries()) {
        // Xử lý các param có thể có nhiều giá trị (như 'topics')
        if (query[key]) {
          if (Array.isArray(query[key])) {
            (query[key] as string[]).push(value);
          } else {
            query[key] = [query[key] as string, value];
          }
        } else {
          query[key] = value;
        }
      }
      // Sử dụng cú pháp object cho router.push
      router.push({
        pathname: pathname as AppPathname, // Ép kiểu pathname để TypeScript hiểu nó là một đường dẫn hợp lệ
        query: query,
      });
    },
    [pathname, router]
  );


  const handleClear = useCallback(() => {
    // Cách clear này vẫn đúng
    router.push(pathname as AppPathname);
  }, [pathname, router]);

  return (
     <>
      <div className='text-center text-2xl mb-10'>
        <div className='w-full bg-background py-4'></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className='container mx-auto mt-4 px-0 md:px-4'>
          <ResultsSection
            userBlacklist={blacklistedEventIds}
            initialData={initialData}
          />
        </div>
      </div>
    </>
  )
}