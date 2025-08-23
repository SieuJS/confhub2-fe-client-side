import { PrismaClient
 } from "@/prisma/generated/client";

 const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, action, trustCredit, content } = body;

        if (!userId || !action) {
            return new Response(JSON.stringify({ message: 'Missing parameters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        console.log('Received body:', body); // Log the received body for debugging

        const logs = await prisma.userInteractLogs.create({
            data: {
                userId,
                action,
                trustCredit,
                content
            },
        });

        return new Response(JSON.stringify(logs), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching user interaction logs:', error);
        return new Response(
            JSON.stringify({ message: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
