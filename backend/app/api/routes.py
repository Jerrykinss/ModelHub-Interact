from flask import Blueprint, jsonify

api = Blueprint('api', __name__)

@api.route('/info')
def info():
    return jsonify({"info": "This is the API endpoint"})