from flask import Blueprint, request, jsonify
from app.modelhub_integration import modelhub_client

api = Blueprint('api', __name__)

#list models route
@api.route('/list_models', methods=['GET'])
def list_models():
    response = modelhub_client.list_models()
    return jsonify(response)

@api.route('/run_model', methods=['POST'])
def run_model():
    data = request.json
    model_name = data.get('model_name')
    if not model_name:
        return jsonify({'error': 'Model name must be provided'}), 400
    result = modelhub_client.run_modelhub_model(model_name)
    return jsonify(result)
    
@api.route('/predict', methods=['POST'])
def predict():
    if 'file' in request.files:
        file = request.files['file']
        response = modelhub_client.predict(file, file.content_type)
    elif 'data' in request.form:
        data = request.form['data']
        response = modelhub_client.predict(data, 'application/json')
    else:
        return jsonify({'error': 'No valid input provided'}), 400

    return jsonify(response)