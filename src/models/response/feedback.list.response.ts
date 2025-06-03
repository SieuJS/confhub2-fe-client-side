export type FeedbackResponse = {
    id: string;
    creatorId: string;
    conferenceId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    description: string;
    star: number;
    createdAt: string;
    updatedAt: string;
}