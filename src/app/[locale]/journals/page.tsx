// Journals.tsx
"use client";

import { useTranslations } from 'next-intl';
import SearchJournalSection from './SearchJournalSection';
import ResultsJournalSection from './ResultsJournalSection';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import { useRouter } from 'next/navigation'; // Không cần useSearchParams ở đây vì handleSearch sẽ tự tạo URLSearchParams mới
import { useCallback } from 'react';

// Định nghĩa interface cho tất cả các tham số tìm kiếm mà SearchJournalSection có thể gửi
interface SearchParamsFromComponent {
    search?: string;
    country?: string | null;
    areas?: string | null; // Thêm areas
    publisher?: string | null;
    region?: string | null;
    type?: string | null; // Thêm type
    quartile?: string | null; // Thêm quartile
    category?: string | null; // Thêm category
    issn?: string | null; // Thêm issn
    topic?: string | null; // Thêm topic
    hIndex?: string | null; // Thêm hIndex
}

export default function Journals({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('');
    const router = useRouter();

    const handleSearch = useCallback(async (searchParamsFromComponent: SearchParamsFromComponent) => {
        const newParams = new URLSearchParams();

        // Lặp qua tất cả các key trong searchParamsFromComponent
        // và thêm vào URLSearchParams nếu giá trị tồn tại và không rỗng
        for (const key in searchParamsFromComponent) {
            const value = searchParamsFromComponent[key as keyof SearchParamsFromComponent];
            if (value && value !== '') { // Kiểm tra cả null và chuỗi rỗng
                newParams.set(key, value);
            }
        }
        
        newParams.set('page', '1'); // Luôn reset về trang 1 khi tìm kiếm mới

        const paramsString = newParams.toString();
        router.push(`/${locale}/journals?${paramsString}`);

    }, [locale, router]);

    const handleClear = useCallback(() => {
        const newParams = new URLSearchParams();
        const paramsString = newParams.toString();
        router.push(`/${locale}/journals?${paramsString}`);
    }, [locale, router]);

    return (
        <div className="flex min-h-screen flex-col">
            <Header locale={locale} />
            <div className="flex-grow text-center text-2xl">
                <div className="py-10 bg-background w-full"></div>
                <SearchJournalSection
                    onSearch={handleSearch}
                    onClear={handleClear}
                />
                <div className="container mx-auto mt-4 px-4 ">
                    <ResultsJournalSection />
                </div>
            </div>
            <Footer />
        </div>
    );
}