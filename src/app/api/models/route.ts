import { NextRequest, NextResponse } from 'next/server';
import { startModel, stopModel } from '@/services/modelManager';

export async function POST(req: NextRequest) {
  const { action, modelName } = await req.json();

  try {
    if (action === 'run') {
      await startModel(modelName);
      return NextResponse.json({ message: 'Model started successfully' });
    } else if (action === 'stop') {
      await stopModel(modelName);
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
