import HeaderClient from './HeaderClient';

// Đây là một Server Component. Nó không có 'use client'.
// Nó chỉ đơn giản là render ra component client.
// Chúng ta có thể truyền các props từ server xuống đây nếu cần, ví dụ locale.
export default function Header({ locale }: { locale: string }) {
  return <HeaderClient locale={locale} />;
}