import { NextRequest, NextResponse } from 'next/server';
import { getInstalledModels, deleteModel, installModel } from '../services/modelService';

export async function GET(req: NextRequest) {
    try {
      const installedModels = getInstalledModels();
      return NextResponse.json(installedModels);
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
    try {
      const { searchParams } = new URL(req.url);
      const modelName = searchParams.get('modelName');
      const modelDirectory = process.env.MODEL_DIRECTORY;
      if (!modelDirectory || !modelName) {
        throw new Error('Incorrect parameters provided');
      }
      await installModel(modelName, modelDirectory);
      return NextResponse.json({ message: 'Model installed successfully' });
    } catch (error) {
      console.error('Error installing models:', error);
      return NextResponse.json(
        { message: 'Failed to install model', error },
        { status: 500 }
      );
    }
  }