import { NextRequest, NextResponse } from 'next/server';
import {
  listModels,
  getInstalledModels,
  deleteModel,
  runModel,
  stopModel,
  downloadModel
} from '../services/modelService';

export async function GET(req: NextRequest) {
  try {
    const models = await listModels();
    const installedModels = getInstalledModels();
    return NextResponse.json({ models, installedModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { message: 'Failed to fetch model index', error },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get('modelName');

  if (!modelName) {
    return NextResponse.json(
      { message: 'Model name is required' },
      { status: 400 }
    );
  }

  try {
    const success = deleteModel(modelName);
    if (success) {
      return NextResponse.json({ message: 'Model deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Model not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete model', error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { action, modelName, containerId } = await req.json();

  try {
    if (action === 'run') {
      const result = await runModel(modelName);
      console.log(result);
      return NextResponse.json({ result }, { status: 200 });
    } else if (action === 'stop') {
      stopModel(containerId);
      return NextResponse.json({ message: 'Model stopped successfully' });
    } else if (action === 'install') {
      const modelDirectory = process.env.MODEL_DIRECTORY;
      if (!modelDirectory) {
        throw new Error('MODEL_DIRECTORY environment variable is not set');
      }
      await downloadModel(modelName, modelDirectory);
      return NextResponse.json({ message: 'Model installed successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.log('Error:', error);
    return NextResponse.json(
      { message: `Failed to ${action} model`, error },
      { status: 500 }
    );
  }
}
