import React from 'react';
import Image from 'next/image';
import { JournalResponse } from '../../../../models/response/journal.response'; // Import your JournalResponse type
import Button from '../utils/Button';
import {Link} from '@/src/navigation'; // Import next/link

interface EventJournalCardProps {
  journal: JournalResponse; // Sử dụng JournalResponse type
}

const EventJournalCard: React.FC<EventJournalCardProps> = ({ journal }) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden bg-gradient-to-r from-background to-background-secondary flex flex-row-reverse relative"> {/* Horizontal flex container và đảo ngược hướng, Thêm relative */}

    <div className=" flex flex-col relative  w-2/3 px-2 py-4"> {/* Content container, chiếm 2/3 chiều rộng */}
      <h3 className="text-lg font-semibold mb-1 text-left">{journal.Title}</h3> {/* Use journal.Title */}
      {journal.ISSN && (
        <p className="text-sm text-left">ISSN: {journal.ISSN}</p>
      )}
    </div>

    <div className="flex h-52 w-40 relative"> {/* Image container, chiếm 1/3 chiều rộng */}
      <img
      src={journal.Image || '/default-journal.jpg'}
      alt={journal.Title}
      style={{ objectFit: 'cover', position: 'absolute', width: '100%', height: '100%' }}
      className="rounded-lg"
      />
    </div>

    <div className="absolute bottom-4 right-4"> {/* Thêm nút bấm */}
      <Link href={{ pathname: '/tabs/journals/detail', query: { id: journal.id } }}>
      
        <Button
          variant="primary"
          size="small"
          rounded
          className={` px-3 py-1 mr-2`} // Nút bấm
        >
          Details
        </Button>
      </Link>
      <Button
        variant="primary"
        size="small"
        rounded
        className={` px-3 py-1`} // Nút bấm
      >
        Submit
      </Button>
    </div>

  </div>
  );
};

export default EventJournalCard;