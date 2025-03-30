import os
import json
import zipfile
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pandas as pd

app = Flask(__name__, static_folder='static', static_url_path='/')
CORS(app)  # Enable CORS for frontend requests

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted'
ALLOWED_EXTENSIONS = {'zip'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['EXTRACT_FOLDER'] = EXTRACT_FOLDER

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

class DataParser:
    def __init__(self, data=None):
        self.data = data
        # Each instance has its own processed data
        # This prevents caching issues between different uploads
        self.processed_data = None
        # Cache for aggregated data
        self.album_data = None
        self.artist_data = None
        # Cache for sorted data
        self.song_data_sorted = {}
        self.album_data_sorted = {}
        self.artist_data_sorted = {}

    def parse(self):
        """Parse the raw Spotify data and return song-level DataFrame"""
        # If this instance already has processed data, return it
        if self.processed_data is not None:
            return self.processed_data
            
        # No data to process
        if self.data is None:
            return pd.DataFrame()  # Return empty DataFrame
            
        dfs = []
        # Implement your data parsing logic here
        for (key, value) in self.data.items():
            print(f"key: {key}, value size: {len(value)}")

            # Convert to Pandas DataFrame
            df = pd.DataFrame(value)

            # Aggregate by track name and artist name at this step
            grouped_df = df.groupby(['master_metadata_track_name', 'master_metadata_album_artist_name']).agg(
                total_ms_played=pd.NamedAgg(column='ms_played', aggfunc='sum'),
                play_count=pd.NamedAgg(column='spotify_track_uri', aggfunc='count'),
                track_name=pd.NamedAgg(column='master_metadata_track_name', aggfunc='first'),
                artist_name=pd.NamedAgg(column='master_metadata_album_artist_name', aggfunc='first'),
                album_name=pd.NamedAgg(column='master_metadata_album_album_name', aggfunc='first')
            ).reset_index()
            dfs.append(grouped_df)

        # Combine all DataFrames into one
        if not dfs:
            return pd.DataFrame()  # Return empty DataFrame
            
        combined_df = pd.concat(dfs, ignore_index=True)
        print(f"Columns in combined_df before groupby: {combined_df.columns}")

        # Perform final grouping by track_name and artist_name to properly aggregate different URIs
        final_grouped_df = combined_df.groupby(
            ['track_name', 'artist_name']
        ).agg(
            total_ms_played=pd.NamedAgg(column='total_ms_played', aggfunc='sum'),
            play_count=pd.NamedAgg(column='play_count', aggfunc='sum'),
            album_name=pd.NamedAgg(column='album_name', aggfunc='first'),
        ).reset_index()

        # Convert milliseconds to minutes and round to nearest hundredths place
        final_grouped_df['Minutes Played'] = (final_grouped_df['total_ms_played'] / 60000).round(2)
        final_grouped_df.drop(columns=['total_ms_played'], inplace=True)
        final_grouped_df.rename(columns={
            "play_count": "Plays",
            "artist_name": "Artist",
            "album_name": "Album",
            "track_name": "Song"
        }, inplace=True)
        
        # Store the processed data in this instance
        self.processed_data = final_grouped_df
        
        return final_grouped_df
    
    def get_album_aggregation(self, song_df=None):
        """Aggregate data to album level"""
        # Return cached data if available
        if self.album_data is not None:
            return self.album_data
            
        if song_df is None:
            song_df = self.parse()
            
        if song_df.empty:
            return pd.DataFrame()
        
        # Group by Album and Artist
        album_df = song_df.groupby(['Album', 'Artist']).agg(
            Plays=pd.NamedAgg(column='Plays', aggfunc='sum'),
            Minutes_Played=pd.NamedAgg(column='Minutes Played', aggfunc='sum'),
            Songs=pd.NamedAgg(column='Song', aggfunc='count')
        ).reset_index()
        
        # Round minutes to 1 decimal place
        album_df['Minutes Played'] = album_df['Minutes_Played'].round(1)
        album_df.drop(columns=['Minutes_Played'], inplace=True)
        
        # Sort by plays descending
        album_df = album_df.sort_values('Plays', ascending=False)
        
        # Cache the result
        self.album_data = album_df
        
        return album_df
    
    def get_artist_aggregation(self, song_df=None):
        """Aggregate data to artist level"""
        # Return cached data if available
        if self.artist_data is not None:
            return self.artist_data
            
        if song_df is None:
            song_df = self.parse()
            
        if song_df.empty:
            return pd.DataFrame()
        
        # First, create album aggregation to count albums per artist
        album_count = song_df.groupby('Artist')['Album'].nunique().reset_index()
        album_count.columns = ['Artist', 'Albums']
        
        # Now aggregate other metrics
        artist_df = song_df.groupby(['Artist']).agg(
            Plays=pd.NamedAgg(column='Plays', aggfunc='sum'),
            Minutes_Played=pd.NamedAgg(column='Minutes Played', aggfunc='sum'),
            Songs=pd.NamedAgg(column='Song', aggfunc='count')
        ).reset_index()
        
        # Merge with album count
        artist_df = artist_df.merge(album_count, on='Artist')
        
        # Round minutes to 1 decimal place
        artist_df['Minutes Played'] = artist_df['Minutes_Played'].round(1)
        artist_df.drop(columns=['Minutes_Played'], inplace=True)
        
        # Sort by plays descending
        artist_df = artist_df.sort_values('Plays', ascending=False)
        
        # Cache the result
        self.artist_data = artist_df
        
        return artist_df

    def get_sorted_data(self, data_type, sort_column, direction="desc"):
        """Get pre-sorted data for faster client-side rendering"""
        # Get the appropriate data set
        if data_type == 'song':
            if self.processed_data is None:
                self.parse()
            df = self.processed_data
            cache = self.song_data_sorted
        elif data_type == 'album':
            if self.album_data is None:
                self.get_album_aggregation()
            df = self.album_data
            cache = self.album_data_sorted
        elif data_type == 'artist':
            if self.artist_data is None:
                self.get_artist_aggregation()
            df = self.artist_data
            cache = self.artist_data_sorted
        else:
            return []
            
        if df is None or df.empty:
            return []
            
        # Check if we already have this sort cached
        cache_key = f"{sort_column}_{direction}"
        if cache_key in cache:
            return cache[cache_key]
            
        # Sort the data
        try:
            ascending = direction.lower() != "desc"
            
            # Make sure the column exists in the dataframe
            if sort_column not in df.columns:
                # Try to find a close match (case-insensitive)
                possible_columns = [col for col in df.columns if col.lower() == sort_column.lower()]
                if possible_columns:
                    sort_column = possible_columns[0]
                else:
                    # Default to "Plays" if column doesn't exist
                    sort_column = "Plays"
                    
            sorted_df = df.sort_values(by=sort_column, ascending=ascending)
            sorted_data = sorted_df.to_dict(orient="records")
            
            # Cache the result
            cache[cache_key] = sorted_data
            return sorted_data
        except Exception as e:
            print(f"Error during sorting: {e}")
            # Fallback if sorting fails
            return df.to_dict(orient="records")

# Store the most recent parser for the /api/data endpoints
current_parser = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return app.send_static_file('index.html')  # Serve the frontend

@app.route('/api/upload', methods=['POST'])
def upload_file():
    global current_parser
    
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

        # Create new parser and process the data
        data_parser = DataParser(json_data)
        current_parser = data_parser  # Update the current parser
        
        # Process all data at once for faster subsequent access
        song_df = data_parser.parse()
        album_df = data_parser.get_album_aggregation(song_df)
        artist_df = data_parser.get_artist_aggregation(song_df)
        
        # Convert to records format for JSON serialization
        song_data = song_df.to_dict(orient="records")
        album_data = album_df.to_dict(orient="records")
        artist_data = artist_df.to_dict(orient="records")
        
        # Pre-sort data by plays for common use case
        data_parser.get_sorted_data('song', 'Plays', 'desc')
        data_parser.get_sorted_data('album', 'Plays', 'desc')
        data_parser.get_sorted_data('artist', 'Plays', 'desc')
        
        # Return all three aggregation levels
        response_data = {
            'song': song_data,
            'album': album_data,
            'artist': artist_data
        }
        
        return jsonify({'message': 'Files processed successfully!', 'data': response_data}), 200
    
    return jsonify({'message': 'Invalid file type'}), 400

@app.route('/api/data/<aggregation_level>', methods=['GET'])
def get_data(aggregation_level):
    """Endpoint to get data at specific aggregation level without reuploading"""
    global current_parser
    
    if current_parser is None:
        return jsonify({'message': 'No data available. Please upload a file first.'}), 404
    
    if aggregation_level == 'song':
        data = current_parser.parse().to_dict(orient="records")
    elif aggregation_level == 'album':
        data = current_parser.get_album_aggregation().to_dict(orient="records")
    elif aggregation_level == 'artist':
        data = current_parser.get_artist_aggregation().to_dict(orient="records")
    else:
        return jsonify({'message': 'Invalid aggregation level'}), 400
    
    return jsonify({'data': data}), 200

@app.route('/api/data/<aggregation_level>/sort', methods=['GET'])
def get_sorted_data(aggregation_level):
    """Endpoint to get pre-sorted data for faster rendering"""
    global current_parser
    
    if current_parser is None:
        return jsonify({'message': 'No data available. Please upload a file first.'}), 404
        
    sort_column = request.args.get('column', 'Plays')
    direction = request.args.get('direction', 'desc')
    
    # Ensure the column name exists in the data
    data = current_parser.get_sorted_data(aggregation_level, sort_column, direction)
    
    # If empty result, check if column may have a different case
    if not data and sort_column not in ['Plays', 'Minutes Played', 'Albums', 'Songs']:
        # Try with first letter capitalized 
        sort_column_cap = sort_column.capitalize()
        data = current_parser.get_sorted_data(aggregation_level, sort_column_cap, direction)
    
    return jsonify({'data': data}), 200

@app.route('/api/data/detail/<detail_type>/<detail_name>', methods=['GET'])
def get_detail_data(detail_type, detail_name):
    """Get detailed data for a specific album or artist"""
    global current_parser
    
    if current_parser is None:
        return jsonify({'message': 'No data available. Please upload a file first.'}), 404
    
    # Get the base data
    song_data = current_parser.parse()
    
    if song_data.empty:
        return jsonify({'message': 'No data available'}), 404
    
    # Filter based on the detail type
    if detail_type == 'album':
        filtered_data = song_data[song_data['Album'] == detail_name]
    elif detail_type == 'artist':
        filtered_data = song_data[song_data['Artist'] == detail_name]
    else:
        return jsonify({'message': 'Invalid detail type'}), 400
    
    # Sort by plays descending
    filtered_data = filtered_data.sort_values('Plays', ascending=False)
    
    # Convert to records format for JSON serialization
    detail_data = filtered_data.to_dict(orient="records")
    
    # Get some summary statistics
    summary = {
        'total_plays': int(filtered_data['Plays'].sum()),
        'total_minutes': float(filtered_data['Minutes Played'].sum()),
        'song_count': len(filtered_data)
    }
    
    return jsonify({
        'data': detail_data,
        'summary': summary,
        'name': detail_name,
        'type': detail_type
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)