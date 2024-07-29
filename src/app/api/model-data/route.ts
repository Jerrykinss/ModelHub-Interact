import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs'

export async function GET(req: NextRequest) {
    try {
      const filePath = './public/model-data.json';
      const jsonData = fs.readFileSync(filePath, 'utf8');
      let modelInfo = JSON.parse(jsonData);
      return NextResponse.json(modelInfo);
    } catch (error) {
      console.error('Error fetching models:', error);
      return NextResponse.json(
        { message: 'Failed to fetch models', error },
        { status: 500 }
      );
    }
  }