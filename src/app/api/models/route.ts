import { NextRequest, NextResponse } from 'next/server';
import {
  runModel,
  stopModel,
} from '../services/modelService';
import fs from 'fs';

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

export async function POST(req: NextRequest) {
  const { action, modelName, containerId } = await req.json();

  try {
    if (action === 'run') {
      const containerId = await runModel(modelName);
      console.log(`Container started with ID: ${containerId}`);
      return NextResponse.json({ containerId }, { status: 200 });
    } else if (action === 'stop') {
      await stopModel(containerId);
      return NextResponse.json({ message: 'Model stopped successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.log('Error:', error);
    return NextResponse.json(
      { message: `Failed to ${action} model`, error: error.message },
      { status: 500 }
    );
  }
}
