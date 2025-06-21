// src/app/[locale]/utils/Footer.tsx

import { getTranslations } from 'next-intl/server';

// Import component client mà chúng ta sẽ tạo ở bước 2
import FooterClientContent from './footer/FooterClientContent';
import type { FooterLink } from './footer/types'; // Import kiểu dữ liệu dùng chung

// Đây là một Server Component, nó chạy trên server!
export default async function Footer() {
    // 1. Lấy bản dịch trên server
    const t = await getTranslations('');

    // 2. Chuẩn bị sẵn dữ liệu (props) để truyền xuống client component
    // Dữ liệu này được xử lý một lần trên server, client không cần làm lại.
    const quickLinks: FooterLink[] = [
        { href: '/support', label: t('Support') },
        { href: '/conferences', label: t('Conferences') },
        { href: '/visualization', label: t('Visualization.Visualization') },
        { href: '/addconference', label: t('Add_Conference') },
        { href: '/chatbot/landing', label: t('Chatbot.Chatbot') },
    ];

    const popularTopics: FooterLink[] = [
        { href: { pathname: '/conferences', query: { topics: 'Business' } }, label: t('Business') },
        { href: { pathname: '/conferences', query: { topics: 'Banking and Economics' } }, label: t('Banking_and_Economics') },
        { href: { pathname: '/conferences', query: { topics: 'Engineering' } }, label: t('Engineering') },
        { href: { pathname: '/conferences', query: { topics: 'Education' } }, label: t('Education') },
        { href: { pathname: '/conferences', query: { topics: 'Health' } }, label: t('Health') },
    ];

    const popularCountries: FooterLink[] = [
        { href: { pathname: '/conferences', query: { country: 'Australia' } }, label: t('Australia') },
        { href: { pathname: '/conferences', query: { country: 'Germany' } }, label: t('Germany') },
        { href: { pathname: '/conferences', query: { country: 'India' } }, label: t('India') },
        { href: { pathname: '/conferences', query: { country: 'United States' } }, label: t('United_States') },
        { href: { pathname: '/conferences', query: { country: 'United Kingdom' } }, label: t('United_Kingdom') },
    ];

    // THAY ĐỔI Ở ĐÂY: Truyền tên icon dưới dạng chuỗi
    const linkColumns = [
        { title: t('Quick_link'), links: quickLinks, icon: 'LinkIcon' as const },
        { title: t('Popular_topics'), links: popularTopics, icon: 'BookOpenIcon' as const },
        { title: t('Popular_countries'), links: popularCountries, icon: 'GlobeAltIcon' as const },
    ];

    const socialLinks = [
        { href: 'https://www.facebook.com/VNUHCM.US', label: 'Facebook' },
        { href: 'https://www.youtube.com/channel/UCYtIjCGvl-VNizt_XWk9Uzg', label: 'YouTube' },
        { href: 'https://www.linkedin.com/school/vnuhcm---university-of-science/', label: 'LinkedIn' },
        { href: 'https://www.tiktok.com/@tvts.hcmus', label: 'TikTok' },
    ];

    const translatedTexts = {
        footerDescription: t('Footer_Description'),
        newsletterTitle: t('Newsletter_Title'),
        newsletterSubtitle: t('Newsletter_Subtitle'),
        enterYourEmail: t('Enter_your_email'),
        copyrights: t('Copyrights', { year: new Date().getFullYear() }),
    };

    // 3. Render Client Component và truyền tất cả dữ liệu đã xử lý xuống làm props
    return (
        <FooterClientContent
            linkColumns={linkColumns}
            socialLinks={socialLinks}
            texts={translatedTexts}
        />
    );
}