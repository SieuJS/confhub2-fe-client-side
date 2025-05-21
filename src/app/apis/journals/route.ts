// src/app/api/journals/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { JournalResponse } from '@/src/models/response/journal.response'; // Điều chỉnh đường dẫn nếu cần

// Hàm đọc và parse một file JSONL
async function readJsonlFile(filePath: string): Promise<JournalResponse[]> {
    try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const lines = fileContent.trim().split('\n');
        const journals: JournalResponse[] = lines
            .map((line) => {
                if (!line.trim()) return null; // Bỏ qua dòng trống
                try {
                    return JSON.parse(line) as JournalResponse;
                } catch (parseError) {
                    console.error(`Error parsing line in ${filePath}:`, line, parseError);
                    return null; // Bỏ qua dòng lỗi
                }
            })
            .filter((journal): journal is JournalResponse => journal !== null); // Loại bỏ các giá trị null
        return journals;
    } catch (readError) {
        console.error(`Error reading file ${filePath}:`, readError);
        return []; // Trả về mảng rỗng nếu lỗi đọc file
    }
}

export async function GET() {
    try {
        const cwd = process.cwd();
        console.log(`Current working directory: ${cwd}`); // Log CWD
        const dataDir = path.join(cwd, 'src', 'models', 'journalData');
        console.log(`Calculated data directory: ${dataDir}`); // Log dataDir

        let allFiles: string[] = [];
        try {
            allFiles = await fs.promises.readdir(dataDir);
            console.log(`Files found in ${dataDir}:`, allFiles); // Log found files
        } catch (readDirError: any) {
            console.error(`Error reading directory ${dataDir}:`, readDirError.message);
            if (readDirError.code === 'ENOENT') {
                console.error(`Directory not found! Path: ${dataDir}`); // Specific log for directory not found
            }
            throw readDirError; // Rethrow to catch in main catch block
        }


        const jsonlFiles = allFiles.filter(file => file.endsWith('.jsonl'));
        console.log(`Filtered .jsonl files:`, jsonlFiles); // Log filtered files

        if (jsonlFiles.length === 0) {
            console.warn("No .jsonl files found in", dataDir);
            // Vẫn trả về 200 OK với mảng rỗng, vì API hoạt động nhưng không có data.
            // Lỗi 404 ở client có thể do front-end xử lý khi nhận mảng rỗng.
            // Nếu bạn muốn 404 khi không có file, thay dòng dưới bằng:
            // return NextResponse.json({ message: 'No data files found' }, { status: 404 });
            return NextResponse.json([]);
        }

        let allJournals: JournalResponse[] = [];

        // Đọc từng file và gộp kết quả
        for (const file of jsonlFiles) {
            const filePath = path.join(dataDir, file);
            const journalsFromFile = await readJsonlFile(filePath);
            allJournals = allJournals.concat(journalsFromFile);
            console.log(`Read ${journalsFromFile.length} journals from ${file}. Total: ${allJournals.length}`);
        }

        console.log(`Successfully loaded a total of ${allJournals.length} journals from ${jsonlFiles.length} files.`);
        return NextResponse.json(allJournals);

    } catch (error: any) {
        console.error('Failed to load journals:', error.message, error); // Log đầy đủ lỗi
        // Trả về lỗi 500 nếu có lỗi xảy ra trong quá trình xử lý (đọc thư mục, file, parse)
        return NextResponse.json({ message: 'Internal Server Error: Failed to load journals', error: error.message }, { status: 500 });
    }
}