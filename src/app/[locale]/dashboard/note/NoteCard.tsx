// src/app/[locale]/dashboard/note/NoteCard.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import { ProcessedNote } from '@/src/hooks/dashboard/note/useNoteData';
import { getEventTypeColor, NoteType } from './utils/noteUtils';

// 1. Cập nhật interface: Bỏ `style` và thêm `className` (optional)
interface NoteCardProps {
  note: ProcessedNote;
  className?: string; 
}

// 2. Cập nhật function signature để nhận `className`
const NoteCard: React.FC<NoteCardProps> = ({ note, className }) => {
  const t = useTranslations('');

  return (
    // 3. Bỏ `style={style}` và ghép `className` được truyền vào với các class có sẵn
    <div
      className={`rounded-md border p-4 shadow-md ${getEventTypeColor(note.type as NoteType)} ${className || ''}`}
    >
      <div className="flex h-full flex-col text-gray-700">
        {/* Phần thân trên của card, chiếm không gian chính */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold">{note.conference}</h3>
          {/* <div className="mt-1 flex items-center">
            <span className="text-sm">{note.location}</span>
          </div> */}
          <p className="mt-1 text-sm font-semibold">
            {note.name ? `${note.name}: ` : ''} {note.date}
          </p>
          <p className="mt-1 text-xs">({note.typeText})</p>
        </div>
        
        {/* Phần chân của card, luôn ở dưới cùng */}
        <div className="flex-shrink-0">
          <div className="mt-2 flex w-full items-center justify-between">
            <div className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              {note.countdown}
            </div>
            <Link href={{ pathname: '/conferences/detail', query: { id: note.id } }}>
              <Button className="hover: text-xs text-button">{t('More_details')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;