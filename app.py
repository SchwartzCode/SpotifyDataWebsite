import os
import json
import zipfile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pandas as pd

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
        dfs = []
        # Implement your data parsing logic here
        for (key, value) in self.data.items():
            print(f"key: {key}, value size: {len(value)}")

            # Convert to Pandas DataFrame
            df = pd.DataFrame(value)

            # Aggregate by 'spotify_track_uri' at this step
            grouped_df = df.groupby(['master_metadata_track_name', 'master_metadata_album_artist_name']).agg(
                total_ms_played=pd.NamedAgg(column='ms_played', aggfunc='sum'),
                play_count=pd.NamedAgg(column='spotify_track_uri', aggfunc='count'),
                track_name=pd.NamedAgg(column='master_metadata_track_name', aggfunc='first'),
                artist_name=pd.NamedAgg(column='master_metadata_album_artist_name', aggfunc='first'),
                album_name=pd.NamedAgg(column='master_metadata_album_album_name', aggfunc='first')
            ).reset_index()
            dfs.append(grouped_df)

        # Combine all DataFrames into one
        combined_df = pd.concat(dfs, ignore_index=True)
        print(f"Columns in combined_df before groupby: {combined_df.columns}")

        # Perform grouping after combining
        final_grouped_df = combined_df.groupby(
            ['album_name', 'track_name']
        ).agg(
            total_ms_played=pd.NamedAgg(column='total_ms_played', aggfunc='sum'),
            play_count=pd.NamedAgg(column='play_count', aggfunc='sum'),
            artist_name=pd.NamedAgg(column='artist_name', aggfunc='first'),
        ).reset_index()

        return final_grouped_df


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
                print(f"Loading in: {file}")
                if file.endswith('.json'):
                    json_path = os.path.join(root, file)
                    try:
                        with open(json_path, 'r', encoding='utf-8') as f:  # Safe loading with UTF-8
                            print("Adding data!")
                            json_data[file] = json.load(f)
                    except json.JSONDecodeError:
                        print("error error error\n\n")
                        return jsonify({'message': f'Error reading {file}, invalid JSON format'}), 400

        dataParser = DataParser(json_data)
        combined_df = dataParser.parse()
        # json_data = combined_df.astype(str).to_dict(orient="records")
        json_data = combined_df.map(lambda x: x.item() if hasattr(x, "item") else x).to_dict(orient="records")
        return jsonify({'message': 'Files processed successfully!', 'data': json_data}), 200
    
    return jsonify({'message': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True)