import { NextRequest, NextResponse } from 'next/server';
import { readModelDataFile, writeModelDataFile } from '@/utils/local-model-data-manager';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('modelName');
    
    if (!modelName) {
        return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    const modelData = readModelDataFile();

    if (modelData[modelName]) {
        return NextResponse.json({ status: modelData[modelName].status });
    } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('modelName');
    
    if (!modelName) {
        return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    const modelData = readModelDataFile();

    if (modelData[modelName]) {
        delete modelData[modelName];
        writeModelDataFile(modelData);
        return NextResponse.json({ message: 'Model deleted successfully' }, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
}