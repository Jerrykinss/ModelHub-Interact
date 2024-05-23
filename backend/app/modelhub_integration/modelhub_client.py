import requests
import subprocess
import shlex
from flask import current_app as app
import json
from urllib.request import urlopen
from operator import itemgetter
import time
import os
import sys
import socket

def get_model_index():
    index_url = "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json"
    return json.loads(urlopen(index_url).read().decode("utf-8"))

def list_models():
    model_index = sorted(get_model_index(), key=itemgetter("name"))
    model_names = [element["name"] for element in model_index]
    descriptions = [element["task_extended"] for element in model_index]
    return {model_names[i]: descriptions[i] for i in range(len(model_names))}

def get_init_value(model_name, key):
    model_directory = app.config['MODEL_DIRECTORY']
    init_file_path = os.path.join(model_directory, model_name, "init/init.json")
    with open(init_file_path) as f:
        init = json.load(f)
    return init[key]

def get_container_id(image_name):
    # Capture the Docker container ID using the correct image name
    for _ in range(5):
        # Capture the Docker container ID using the correct image name
        docker_ps_command = f"docker ps -q --filter ancestor={image_name}"
        docker_ps_process = subprocess.Popen(docker_ps_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        container_id, _ = docker_ps_process.communicate()
        container_id = container_id.strip()
        if container_id:
            return container_id
        time.sleep(2)
    return None

def get_docker_port(container_id):
    try:
        # Run the docker inspect command
        docker_inspect_command = f"docker inspect {container_id}"
        docker_inspect_process = subprocess.Popen(docker_inspect_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, shell=True)
        stdout, stderr = docker_inspect_process.communicate()

        if docker_inspect_process.returncode != 0:
            raise Exception(f"Error inspecting Docker container: {stderr}")

        # Parse the JSON output
        container_info = json.loads(stdout)

        # Extract the port mappings
        ports = container_info[0]['NetworkSettings']['Ports']

        # Extract the host port for the desired container port (e.g., 80/tcp)
        host_port = None
        for container_port, port_bindings in ports.items():
            if port_bindings:
                host_port = port_bindings[0]['HostPort']
                break

        if not host_port:
            raise Exception("No port bindings found for the Docker container")

        # Return the URL using localhost
        return f"http://localhost:{host_port}"
    except Exception as e:
        print(f"Error getting Docker container info: {e}")
        return None

def run_modelhub_model(model_name):
    try:
        model_directory = app.config['MODEL_DIRECTORY']
        # Prepare the command
        command = f"modelhub-run {model_name}"
        # Use shlex to ensure the command is properly escaped
        command = shlex.split(command)

        # Run the command in a subprocess
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=model_directory, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0)

        # Return the process and model name
        return process
    
    except subprocess.CalledProcessError as e:
        # Handle errors in the subprocess
        return None, {
            "error": str(e),
            "stdout": e.stdout,
            "stderr": e.stderr,
            "exit_code": e.returncode
        }
    
def stop_modelhub_model(process, container_id):
    try:
        # Stop the Docker container
        docker_stop_command = f"docker stop {container_id}"
        subprocess.run(docker_stop_command, shell=True, check=True)

        # Wait for the process to terminate
        stdout, stderr = process.communicate()

        # Return stdout, stderr, and the exit code
        return {
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": process.returncode
        }
    
    except subprocess.CalledProcessError as e:
        # Handle errors in the subprocess
        return {
            "error": str(e),
            "stdout": e.stdout,
            "stderr": e.stderr,
            "exit_code": e.returncode
        }

def predict(port, filepath):
    """
    Make a prediction using the Modelhub API.

    Args:
        api_url (str): The base URL of the Modelhub API (e.g., "http://localhost:80/api/predict").
        input_data (str or dict): The input data. For single input, it's a file URL or path.
                                  For multiple inputs, it's a dictionary describing the JSON payload.
        is_multiple (bool): Flag indicating whether the input_data is for multiple inputs.

    Returns:
        dict: The API response containing the prediction.
    """
    api_url = f"{port}/api/predict?fileurl={filepath}"
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()