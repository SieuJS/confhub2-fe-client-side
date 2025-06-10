// src/app/[locale]/dashboard/note/AuthViews.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';

interface AuthViewsProps {
  loading: boolean;
  initialLoad: boolean;
  loggedIn: boolean;
  isBanned: boolean;
  error: string | null;
  children: React.ReactNode;
}

const renderLoading = (t: any) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{t('MyConferences.Loading_your_calendar')}</p>
  </div>
);

const AuthViews: React.FC<AuthViewsProps> = ({
  loading,
  initialLoad,
  loggedIn,
  isBanned,
  error,
  children
}) => {
  const t = useTranslations('');
  const { logout } = useAuth();

  if (loading && initialLoad) {
    return <div className="container mx-auto p-4">{renderLoading(t)}</div>;
  }

  if (!loggedIn) {
    if (isBanned) {
      logout({ callApi: true, preventRedirect: true });
      return (
        <div className="container mx-auto p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{t('MyConferences.Account_Banned_Title')}</h2>
          <p className="mb-4">{t('MyConferences.Account_Banned_Message')}</p>
          <Link href="/auth/login">
            <Button variant="primary">{t('Sign_In')}</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-xl font-semibold mb-2">{t('MyConferences.Login_Required_Title')}</h2>
        <p className="mb-4">{t('MyConferences.Login_Required_Message')}</p>
        <Link href="/auth/login">
          <Button variant="primary">{t('Sign_In')}</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return <>{children}</>;
};

export default AuthViews;