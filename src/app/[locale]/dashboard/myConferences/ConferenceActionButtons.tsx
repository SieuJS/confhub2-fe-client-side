// src/app/[locale]/dashoard/myconferences/ConferenceActionButtons.tsx 
import React from 'react';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import { useTranslations } from 'next-intl';
import { ConferenceResponse } from '@/src/models/response/conference.response';

interface ConferenceActionButtonsProps {
    conference: ConferenceResponse;
    onViewReason: (message: string) => void;
    onViewSubmitted: (conference: ConferenceResponse) => void;
    onEdit: (conference: ConferenceResponse) => void;
}

const ConferenceActionButtons: React.FC<ConferenceActionButtonsProps> = ({
    conference,
    onViewReason,
    onViewSubmitted,
    onEdit,
}) => {
    const t = useTranslations('MyConferences');
    const status = conference.status.toUpperCase();

    const renderButtons = () => {
        switch (status) {
            case 'APPROVED':
                return (
                    <>
                        <Link href={{
                            pathname: '/conferences/detail',
                            query: { id: conference.id }
                        }}>
                            <Button variant="primary" size="small">{t('Action_View_Details')}</Button>
                        </Link>
                        {conference.message && (
                            <Button variant="secondary" size="small" onClick={() => onViewReason(conference.message!)}>
                                {t('Action_View_Approval_Reason')}
                            </Button>
                        )}
                    </>
                );
            case 'REJECTED':
                return (
                    <>
                        <Button variant="primary" size="small" onClick={() => onEdit(conference)}>
                            {t('Action_Edit')}
                        </Button>
                        {conference.message && (
                            <Button variant="danger" size="small" onClick={() => onViewReason(conference.message!)}>
                                {t('Action_View_Rejection_Reason')}
                            </Button>
                        )}
                    </>
                );
            case 'PENDING':
                return (
                    <>
                        <Button variant="primary" size="small" onClick={() => onEdit(conference)}>
                            {t('Action_Edit')}
                        </Button>
                        <Button variant="secondary" size="small" onClick={() => onViewSubmitted(conference)}>
                            {t('Action_View_Submitted_Info')}
                        </Button>
                    </>
                );
            default:
                return null;
        }
    };

    return <div className="flex flex-wrap items-center gap-2">{renderButtons()}</div>;
};

export default ConferenceActionButtons;