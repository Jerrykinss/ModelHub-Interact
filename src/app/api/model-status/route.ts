import { NextRequest, NextResponse } from 'next/server';
import { readLocalModelDataFile, writeLocalModelDataFile } from '@/utils/local-model-data-manager';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const modelName = searchParams.get('modelName');
    
    if (!modelName) {
        return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }
    const modelData = readLocalModelDataFile();

    if (modelData[modelName.toLowerCase()]) {
        return NextResponse.json({ status: modelData[modelName.toLowerCase()].status });
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

    const modelData = readLocalModelDataFile();

    if (modelData[modelName.toLowerCase()]) {
        delete modelData[modelName.toLowerCase()];
        writeLocalModelDataFile(modelData);
        return NextResponse.json({ message: 'Model deleted successfully' }, { status: 200 });
    } else {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
}