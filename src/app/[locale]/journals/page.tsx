// Journals.tsx
"use client";

import { useTranslations } from 'next-intl';
import SearchJournalSection from './SearchJournalSection';
import ResultsJournalSection from './ResultsJournalSection';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function Journals({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('');
    const router = useRouter();
    // const searchParams = useSearchParams(); // Tạm thời không cần vì không giữ lại sortBy

    const handleSearch = useCallback(async (searchParamsFromComponent: {
        search?: string;
        country?: string | null;
        region?: string | null;
        publisher?: string | null;
    }) => {
        const newParams = new URLSearchParams();

        // Tạm thời comment phần giữ lại sortBy
        // const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        // if (currentParams.has('sortBy')) {
        //     newParams.set('sortBy', currentParams.get('sortBy')!);
        // }
        
        // Thêm các tham số tìm kiếm mới từ component
        if (searchParamsFromComponent.search) {
            newParams.set('search', searchParamsFromComponent.search);
        }
        
        if (searchParamsFromComponent.country) {
            newParams.set('country', searchParamsFromComponent.country);
        }
        
        if (searchParamsFromComponent.region) {
            newParams.set('region', searchParamsFromComponent.region);
        }

        if (searchParamsFromComponent.publisher) {
            newParams.set('publisher', searchParamsFromComponent.publisher);
        }
        
        // Khi thực hiện một tìm kiếm mới, luôn reset về trang 1
        newParams.set('page', '1');

        const paramsString = newParams.toString();
        router.push(`/${locale}/journals?${paramsString}`);

    }, [locale, router]); // Bỏ searchParams khỏi dependency array

    const handleClear = useCallback(() => {
        const newParams = new URLSearchParams();

        // Tạm thời comment phần giữ lại sortBy
        // const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
        // if (currentParams.has('sortBy')) {
        //     newParams.set('sortBy', currentParams.get('sortBy')!);
        // }
        
        const paramsString = newParams.toString();
        router.push(`/${locale}/journals?${paramsString}`);
    }, [locale, router]); // Bỏ searchParams khỏi dependency array

    return (
        <>
            <Header locale={locale} />
            <div className="text-center text-2xl">
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
        </>
    );
}