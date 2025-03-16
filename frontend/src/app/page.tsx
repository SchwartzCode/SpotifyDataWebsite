"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleTable } from "@/components/ui/simple-table";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { AggregationSelector, AggregationLevel } from "@/components/ui/aggregation-selector";

// Define the type for data items
interface DataItem {
  [key: string]: any;
}

export default function FileUploader() {
  // State management
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [songData, setSongData] = useState<DataItem[]>([]);
  const [albumData, setAlbumData] = useState<DataItem[]>([]);
  const [artistData, setArtistData] = useState<DataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aggregationLevel, setAggregationLevel] = useState<AggregationLevel>("song");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [sortColumn, setSortColumn] = useState<string | null>("Plays");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Use memoized current data to prevent unnecessary recalculations
  const currentData = useMemo(() => {
    switch(aggregationLevel) {
      case "song": return songData;
      case "album": return albumData;
      case "artist": return artistData;
      default: return [];
    }
  }, [aggregationLevel, songData, albumData, artistData]);

  // Memoized statistics for better performance
  const stats = useMemo(() => {
    if (!currentData || currentData.length === 0) {
      return { count: 0, plays: 0, minutes: 0 };
    }
    
    const count = currentData.length;
    const plays = currentData.reduce((sum, item) => sum + (Number(item.Plays) || 0), 0);
    const minutes = currentData.reduce((sum, item) => sum + (Number(item["Minutes Played"]) || 0), 0);
    
    return { count, plays, minutes };
  }, [currentData]);

  // Handle file drop and processing
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);

    try {
      // Upload and process data at all levels at once
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      // Ensure we have arrays for each data type
      const songDataArray = Array.isArray(result.data.song) ? result.data.song : [];
      const albumDataArray = Array.isArray(result.data.album) ? result.data.album : [];
      const artistDataArray = Array.isArray(result.data.artist) ? result.data.artist : [];

      // Store data for all aggregation levels
      setSongData(songDataArray);
      setAlbumData(albumDataArray);
      setArtistData(artistDataArray);
      
      setIsDataLoaded(songDataArray.length > 0);
      
      // Automatically switch to the "Top Tracks" tab after data is loaded
      if (songDataArray.length > 0) {
        setActiveTab("tracks");
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error during file upload:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to change the aggregation level 
  const handleAggregationChange = useCallback((level: AggregationLevel) => {
    setAggregationLevel(level);
  }, []);

  // Function to handle sorting
  const handleSort = useCallback(async (column: string) => {
    // Toggle direction if clicking the same column
    const newDirection = sortColumn === column && sortDirection === "desc" ? "asc" : "desc";
    
    setSortColumn(column);
    setSortDirection(newDirection);
    
    // Use the backend sorting endpoint if data is too large (to avoid UI freezing)
    if (currentData.length > 300) {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/data/${aggregationLevel}/sort?column=${column}&direction=${newDirection}`
        );
        const result = await response.json();
        
        if (response.ok && Array.isArray(result.data)) {
          // Update the appropriate data set
          switch(aggregationLevel) {
            case "song":
              setSongData(result.data);
              break;
            case "album":
              setAlbumData(result.data);
              break;
            case "artist":
              setArtistData(result.data);
              break;
          }
        }
      } catch (err) {
        console.error("Error during sorting:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [aggregationLevel, sortColumn, sortDirection, currentData.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/zip": [".zip"] },
  });

  // Get columns and their widths based on aggregation level - memoized
  const { columnOrder, columnWidths } = useMemo(() => {
    switch(aggregationLevel) {
      case "song":
        return {
          columnOrder: ["Song", "Artist", "Album", "Plays", "Minutes Played"],
          columnWidths: {
            "Song": "30%",
            "Artist": "25%",
            "Album": "25%",
            "Plays": "10%",
            "Minutes Played": "10%"
          }
        };
      case "album":
        return {
          columnOrder: ["Album", "Artist", "Songs", "Plays", "Minutes Played"],
          columnWidths: {
            "Album": "35%",
            "Artist": "35%",
            "Songs": "10%",
            "Plays": "10%",
            "Minutes Played": "10%"
          }
        };
      case "artist":
        return {
          columnOrder: ["Artist", "Albums", "Songs", "Plays", "Minutes Played"],
          columnWidths: {
            "Artist": "30%",
            "Albums": "15%",
            "Songs": "15%",
            "Plays": "15%",
            "Minutes Played": "25%"
          }
        };
    }
  }, [aggregationLevel]);

  // Memoized sorted data to prevent unnecessary sorts on each render
  const sortedData = useMemo(() => {
    if (!sortColumn || !currentData.length) return currentData;
    
    // Only sort client-side if the data is small enough
    if (currentData.length <= 300) {
      return [...currentData].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        
        // Handle null/undefined
        if (valueA === undefined || valueA === null) return 1;
        if (valueB === undefined || valueB === null) return -1;
        
        // Convert to numbers for numeric columns
        if (typeof valueA === "number" || !isNaN(Number(valueA))) {
          valueA = Number(valueA);
          valueB = Number(valueB);
        }
        
        if (valueA < valueB) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    
    return currentData; // For large datasets, we rely on the backend sorting
  }, [currentData, sortColumn, sortDirection]);

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

  // Render a DataTable if we have data
  const TracksTable = isDataLoaded ? (
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
        {/* Aggregation selector */}
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
            <p className="text-spotify-green text-2xl font-bold">{stats.count}</p>
          </div>
          <div className="bg-spotify-dark-gray p-4 rounded-lg">
            <p className="text-spotify-off-white text-sm">Total Plays</p>
            <p className="text-spotify-green text-2xl font-bold">
              {stats.plays.toLocaleString()}
            </p>
          </div>
          <div className="bg-spotify-dark-gray p-4 rounded-lg">
            <p className="text-spotify-off-white text-sm">Total Minutes</p>
            <p className="text-spotify-green text-2xl font-bold">
              {stats.minutes.toLocaleString(undefined, {maximumFractionDigits: 0})}
            </p>
          </div>
        </div>
        
        {/* Table with loading indicator overlay when sorting large datasets */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded">
              <div className="bg-spotify-dark-gray px-4 py-2 rounded">Sorting data...</div>
            </div>
          )}
          <SimpleTable 
            data={sortedData} 
            columnOrder={columnOrder}
            columnWidths={columnWidths}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </CardContent>
    </Card>
  ) : (
    <div className="text-center text-spotify-off-white p-6">
      Upload your Spotify data to view your listening history
    </div>
  );

  // Stats view with more detailed insights - memoized to prevent unnecessary renders
  const StatsView = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle>Listening Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isDataLoaded ? (
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

            {/* Top Artists - only show if data exists */}
            {artistData.length > 0 && (
              <div className="bg-spotify-dark-gray p-4 rounded-lg">
                <h3 className="text-spotify-off-white font-semibold mb-3">Top Artists</h3>
                <div className="space-y-2">
                  {artistData.slice(0, 5).map((artist, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-spotify-off-white">{artist.Artist}</span>
                      <span className="text-spotify-green font-medium">
                        {Number(artist.Plays || 0).toLocaleString()} plays
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Albums - only show if data exists */}
            {albumData.length > 0 && (
              <div className="bg-spotify-dark-gray p-4 rounded-lg">
                <h3 className="text-spotify-off-white font-semibold mb-3">Top Albums</h3>
                <div className="space-y-2">
                  {albumData.slice(0, 5).map((album, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-spotify-off-white">{album.Album}</span>
                      <span className="text-spotify-green font-medium">
                        {Number(album.Plays || 0).toLocaleString()} plays
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-spotify-off-white p-6">
            Upload your Spotify data to view statistics
          </div>
        )}
      </CardContent>
    </Card>
  ), [isDataLoaded, songData, albumData, artistData]);

  const tabs = [
    { id: "upload", label: "Upload", content: UploadArea },
    { id: "tracks", label: "Top Tracks", content: TracksTable },
    { id: "stats", label: "Statistics", content: StatsView },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-black text-spotify-off-white font-sans">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-spotify-green mb-6 text-center">Spotify Data Explorer</h1>
        <TabNavigation tabs={tabs} defaultTab="upload" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}