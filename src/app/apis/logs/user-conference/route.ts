import { PrismaClient

 } from "@/prisma/generated/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, conferenceId, action, trustCredit } = body;

        if (!userId || !conferenceId || !action) {
        return new Response(JSON.stringify({ message: 'Missing parameters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
        }

        const logs = await prisma.userConferenceLogs.create({
        data: {
            userId,
            conferenceId,
            action,
            trustCredit,
        },
        });
    
        return new Response(JSON.stringify(logs), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching user conference logs:', error);
        return new Response(
        JSON.stringify({ message: 'Internal server error' }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        }
        );
    }
}
