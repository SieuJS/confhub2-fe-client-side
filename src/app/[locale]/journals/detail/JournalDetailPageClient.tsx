// src/app/[locale]/journals/detail/JournalDetailPageClient.tsx (TẠO FILE MỚI)

'use client'

import { JournalData } from '../../../../models/response/journal.response'
import JournalReport from './JournalReport'
import { JournalTabs } from './JournalTabs'
import SubjectAreasJournals from './SubjectAreasJournals'

interface JournalDetailPageClientProps {
  initialData: JournalData;
}

const JournalDetailPageClient: React.FC<JournalDetailPageClientProps> = ({ initialData }) => {
  // Dữ liệu đã có sẵn, chỉ cần truyền xuống các component con
  const journal = initialData;

  return (
    <div>
      <div className='w-full bg-background py-10'></div>
      <JournalReport journal={journal} />
      <JournalTabs journal={journal} />
      <SubjectAreasJournals />
    </div>
  );
};

export default JournalDetailPageClient;