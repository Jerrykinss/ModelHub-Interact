import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    MODEL_DIRECTORY = os.path.join(BASE_DIR, 'modelhub', 'models')