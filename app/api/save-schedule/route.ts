import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const filePath = path.join(process.cwd(), 'schedule-data.json');

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save schedule:', error);
        return NextResponse.json({ success: false, error: 'Failed to save data' }, { status: 500 });
    }
}
