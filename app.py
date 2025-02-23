import os
import json
import zipfile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
# TODO: what is this doing?
CORS(app)  # Enable CORS for frontend requests

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
ALLOWED_EXTENSIONS = {'zip'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EXTRACT_FOLDER'] = EXTRACT_FOLDER

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

# TODO: different file
class DataParser:
    # TODO: more specific type
    data: dict

    def __init__(self, data):
        self.data = data

    def parse(self):
        # Implement your data parsing logic here
        print(f"json data size: ", len(self.data))
        for (key, value) in self.data.items():
            print(f"key: {key}, value size: {len(value)}")
            print(f"first element: {value[0]}")
            print(f"key type {type(key)}, value elem type {type(value[0])}")
        return self.data

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Extract the ZIP file
        extract_path = os.path.join(app.config['EXTRACT_FOLDER'], filename.replace('.zip', ''))
        os.makedirs(extract_path, exist_ok=True)

        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        # Load JSON files
        json_data = {}
        for root, _, files in os.walk(extract_path):
            for file in files:
                if file.endswith('.json'):
                    json_path = os.path.join(root, file)
                    try:
                        with open(json_path, 'r', encoding='utf-8') as f:  # Safe loading with UTF-8
                            json_data[file] = json.load(f)
                    except json.JSONDecodeError:
                        return jsonify({'message': f'Error reading {file}, invalid JSON format'}), 400

        dataParser = DataParser(json_data)
        dataParser.parse()
        return jsonify({'message': 'Files processed successfully!', 'data': json_data}), 200
    
    return jsonify({'message': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)