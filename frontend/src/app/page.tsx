"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleTable } from "@/components/ui/simple-table";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { AggregationSelector, AggregationLevel } from "@/components/ui/aggregation-selector";

// Define the type for data items
interface DataItem {
  [key: string]: string | number | boolean | Set<String>;
}

export default function FileUploader() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataItem[]>([]);
  const [songData, setSongData] = useState<DataItem[]>([]);
  const [albumData, setAlbumData] = useState<DataItem[]>([]);
  const [artistData, setArtistData] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>("song");

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      // Upload and process at song level (original)
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      // Store song-level data
      setSongData(result.data);
      setData(result.data); // Default view shows song data

      // Now let's manually aggregate to album level for now
      // In a real implementation, you might have a backend endpoint for this
      const albumAggregation = aggregateToAlbumLevel(result.data);
      setAlbumData(albumAggregation);

      // And aggregate to artist level
      const artistAggregation = aggregateToArtistLevel(result.data);
      setArtistData(artistAggregation);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to change the aggregation level and update displayed data
  const handleAggregationChange = (level: AggregationLevel) => {
    setAggregationLevel(level);
    
    switch(level) {
      case "song":
        setData(songData);
        break;
      case "album":
        setData(albumData);
        break;
      case "artist":
        setData(artistData);
        break;
    }
  };

  // Helper function to aggregate data to album level
  const aggregateToAlbumLevel = (songData: DataItem[]): DataItem[] => {
    const albumMap = new Map<string, DataItem>();
    
    songData.forEach(song => {
      const albumName = String(song.Album || "Unknown Album");
      const artistName = String(song.Artist || "Unknown Artist");
      const plays = Number(song.Plays || 0);
      const minutes = Number(song["Minutes Played"] || 0);
      
      if (!albumMap.has(albumName)) {
        albumMap.set(albumName, {
          Album: albumName,
          Artist: artistName,
          Plays: plays,
          "Minutes Played": Number(minutes.toFixed(1)), // Format to 1 decimal place
          Songs: 1
        });
      } else {
        const album = albumMap.get(albumName)!;
        album.Plays = Number(album.Plays) + plays;
        // Format minutes to 1 decimal place after adding
        album["Minutes Played"] = Number((Number(album["Minutes Played"]) + minutes).toFixed(1));
        album.Songs = Number(album.Songs) + 1;
      }
    });
    
    return Array.from(albumMap.values()).sort((a, b) => Number(b.Plays) - Number(a.Plays));
  };
  
  // Helper function to aggregate data to artist level
  const aggregateToArtistLevel = (songData: DataItem[]): DataItem[] => {
    const artistMap = new Map<string, DataItem>();
    
    songData.forEach(song => {
      const artistName = String(song.Artist || "Unknown Artist");
      const plays = Number(song.Plays || 0);
      const minutes = Number(song["Minutes Played"] || 0);
      
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {
          Artist: artistName,
          Plays: plays,
          "Minutes Played": Number(minutes.toFixed(1)), // Format to 1 decimal place
          Albums: new Set([song.Album.toString()]),
          Songs: 1
        });
      } else {
        const artist = artistMap.get(artistName)!;
        artist.Plays = Number(artist.Plays) + plays;
        // Format minutes to 1 decimal place after adding
        artist["Minutes Played"] = Number((Number(artist["Minutes Played"]) + minutes).toFixed(1));
        (artist.Albums as Set<string>).add(String(song.Album));
        artist.Songs = Number(artist.Songs) + 1;
      }
    });
    
    // Convert album sets to counts and format the data
    return Array.from(artistMap.values()).map(artist => {
      const albumCount = (artist.Albums as Set<string>).size;
      return {
        Artist: artist.Artist,
        Plays: artist.Plays,
        "Minutes Played": artist["Minutes Played"],
        Albums: albumCount,
        Songs: artist.Songs
      };
    }).sort((a, b) => Number(b.Plays) - Number(a.Plays));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
  });

  // Render the upload area
  const UploadArea = (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Spotify ZIP File</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-spotify-medium-gray"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-spotify-off-white">Drop the file here...</p>
          ) : (
            <p className="text-spotify-off-white">Drag & drop a ZIP file, or click to select one</p>
          )}
        </div>

        {loading && <p className="text-center mt-4">Loading...</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </CardContent>
    </Card>
  );

  // Get columns and their widths based on aggregation level
  const getColumnsForAggregationLevel = (): { order: string[], widths: Record<string, string> } => {
    switch(aggregationLevel) {
      case "song":
        return {
          order: ["Song", "Artist", "Album", "Plays", "Minutes Played"],
          widths: {
            "Song": "30%",
            "Artist": "25%",
            "Album": "25%",
            "Plays": "10%",
            "Minutes Played": "10%"
          }
        };
      case "album":
        return {
          order: ["Album", "Artist", "Songs", "Plays", "Minutes Played"],
          widths: {
            "Album": "35%",
            "Artist": "35%",
            "Songs": "10%",
            "Plays": "10%",
            "Minutes Played": "10%"
          }
        };
      case "artist":
        return {
          order: ["Artist", "Albums", "Songs", "Plays", "Minutes Played"],
          widths: {
            "Artist": "30%",
            "Albums": "15%",
            "Songs": "15%",
            "Plays": "15%",
            "Minutes Played": "25%"
          }
        };
    }
  };

  // Get the appropriate table columns config
  const { order: columnOrder, widths: columnWidths } = getColumnsForAggregationLevel();

  // Render a DataTable if we have data
  const TracksTable = data.length > 0 ? (
    <Card>
      <CardHeader>
        <CardTitle>
          {aggregationLevel === "song" 
            ? "Your Top Tracks" 
            : aggregationLevel === "album" 
              ? "Your Top Albums" 
              : "Your Top Artists"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Aggregation selector - positioned BEFORE the stats cards for better visibility */}
        <div className="mb-6">
          <AggregationSelector 
            value={aggregationLevel}
            onChange={handleAggregationChange}
          />
        </div>
      
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-spotify-dark-gray p-4 rounded-lg">
            <p className="text-spotify-off-white text-sm">
              {aggregationLevel === "song" 
                ? "Total Tracks" 
                : aggregationLevel === "album" 
                  ? "Total Albums" 
                  : "Total Artists"}
            </p>
            <p className="text-spotify-green text-2xl font-bold">{data.length}</p>
          </div>
          <div className="bg-spotify-dark-gray p-4 rounded-lg">
            <p className="text-spotify-off-white text-sm">Total Plays</p>
            <p className="text-spotify-green text-2xl font-bold">
              {data.reduce((sum, item) => sum + (Number(item.Plays) || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-spotify-dark-gray p-4 rounded-lg">
            <p className="text-spotify-off-white text-sm">Total Minutes</p>
            <p className="text-spotify-green text-2xl font-bold">
              {data.reduce((sum, item) => sum + (Number(item["Minutes Played"]) || 0), 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>
        
        {/* Using the SimpleTable with appropriate columns for the aggregation level */}
        <SimpleTable 
          data={data} 
          columnOrder={columnOrder}
          columnWidths={columnWidths}
        />
      </CardContent>
    </Card>
  ) : (
    <div className="text-center text-spotify-off-white p-6">
      Upload your Spotify data to view your listening history
    </div>
  );

  // Stats view with more detailed insights
  const StatsView = (
    <Card>
      <CardHeader>
        <CardTitle>Listening Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-6">
            {/* Top stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-spotify-dark-gray p-4 rounded-lg">
                <p className="text-spotify-off-white text-sm">Total Tracks</p>
                <p className="text-spotify-green text-2xl font-bold">{songData.length}</p>
              </div>
              <div className="bg-spotify-dark-gray p-4 rounded-lg">
                <p className="text-spotify-off-white text-sm">Total Plays</p>
                <p className="text-spotify-green text-2xl font-bold">
                  {songData.reduce((sum, item) => sum + (Number(item.Plays) || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-spotify-dark-gray p-4 rounded-lg">
                <p className="text-spotify-off-white text-sm">Hours Listened</p>
                <p className="text-spotify-green text-2xl font-bold">
                  {(songData.reduce((sum, item) => sum + (Number(item["Minutes Played"]) || 0), 0) / 60).toLocaleString(undefined, {maximumFractionDigits: 1})}
                </p>
              </div>
            </div>

            {/* Top Artists */}
            <div className="bg-spotify-dark-gray p-4 rounded-lg">
              <h3 className="text-spotify-off-white font-semibold mb-3">Top Artists</h3>
              <div className="space-y-2">
                {artistData.slice(0, 5).map((artist, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-spotify-off-white">{artist.Artist}</span>
                    <span className="text-spotify-green font-medium">{Number(artist.Plays).toLocaleString()} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Albums */}
            <div className="bg-spotify-dark-gray p-4 rounded-lg">
              <h3 className="text-spotify-off-white font-semibold mb-3">Top Albums</h3>
              <div className="space-y-2">
                {albumData.slice(0, 5).map((album, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-spotify-off-white">{album.Album}</span>
                    <span className="text-spotify-green font-medium">{Number(album.Plays).toLocaleString()} plays</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-spotify-off-white p-6">
            Upload your Spotify data to view statistics
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: "upload", label: "Upload", content: UploadArea },
    { id: "tracks", label: "Top Tracks", content: TracksTable },
    { id: "stats", label: "Statistics", content: StatsView },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-black text-spotify-off-white font-sans">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-spotify-green mb-6 text-center">Spotify Data Explorer</h1>
        <TabNavigation tabs={tabs} defaultTab="upload" />
      </div>
    </div>
  );
}