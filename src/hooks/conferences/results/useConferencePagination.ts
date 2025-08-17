// src/hooks/conferences/results/useConferencePagination.ts

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export const useConferencePagination = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paginate = (pageNumber: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(pageNumber));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleEventPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = event.target.value;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('perPage', newPerPage);
    newParams.delete('page'); // Reset to page 1 on perPage change
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return { paginate, handleEventPerPageChange };
};