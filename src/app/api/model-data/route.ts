import { NextRequest, NextResponse } from 'next/server';
import { readModelDataFile } from '@/utils/model-data-manager';

export async function GET(req: NextRequest) {
    try {
      const modelInfo = readModelDataFile()
      return NextResponse.json(modelInfo);
    } catch (error) {
      console.error('Error fetching models:', error);
      return NextResponse.json(
        { message: 'Failed to fetch models', error },
        { status: 500 }
      );
    }
  }