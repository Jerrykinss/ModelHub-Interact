from flask import Blueprint, request, jsonify
from .model import generate_response

chatbot = Blueprint('chatbot', __name__)

@chatbot.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    response = generate_response(user_message)
    return jsonify(response)