"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleTable } from "@/components/ui/simple-table";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { AggregationSelector, AggregationLevel } from "@/components/ui/aggregation-selector";
import { SearchBar } from "@/components/ui/search-bar";
import { DetailModal } from "@/components/ui/detail-modal";

// Define the type for data items
interface DataItem {
  [key: string]: any;
}

// Spotify logo SVG component
const SpotifyLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168" width="32" height="32" className="inline-block mr-2 align-middle">
    <path fill="#1ED760" d="M83.996 0C37.747 0 0 37.746 0 84c0 46.251 37.747 84 83.996 84 46.254 0 84.004-37.749 84.004-84 0-46.254-37.75-84-84.004-84zm38.326 120.831c-1.503 2.466-4.7 3.24-7.151 1.737-19.597-11.991-44.296-14.7-73.346-8.047-2.788.637-5.583-1.118-6.22-3.905-.636-2.787 1.118-5.583 3.905-6.22 31.9-7.293 59.263-4.154 81.337 9.334 2.451 1.503 3.225 4.7 1.724 7.101zm10.234-22.799c-1.894 3.073-5.912 4.037-8.981 2.15-22.42-13.797-56.596-17.797-83.076-9.732-3.434 1.041-7.062-.902-8.097-4.337-1.037-3.434.908-7.055 4.341-8.091 30.32-9.209 68.006-4.75 94.071 11.039 3.068 1.887 4.033 5.906 2.142 8.97zm.88-23.744c-26.887-15.967-71.338-17.434-97.058-9.658-4.122 1.242-8.477-1.095-9.722-5.219-1.245-4.122 1.096-8.476 5.22-9.723 29.581-8.968 78.757-7.245 109.821 11.201 3.732 2.213 4.962 7.012 2.744 10.733-2.214 3.732-7.01 4.964-10.734 2.746-.212-.127-.427-.234-.634-.367l-.637.017z"/>
  </svg>
);

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
  
  // New state for search and detail modal
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [detailType, setDetailType] = useState<"album" | "artist">("album");
  const [detailName, setDetailName] = useState<string>("");

  // Use memoized current data to prevent unnecessary recalculations
  const currentData = useMemo(() => {
    switch(aggregationLevel) {
      case "song": return songData;
      case "album": return albumData;
      case "artist": return artistData;
      default: return [];
    }
  }, [aggregationLevel, songData, albumData, artistData]);

  // Memoized filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    if (!currentData.length) return [];
    
    // First filter by search term
    let filtered = [...currentData];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        // Search in relevant columns based on aggregation level
        if (aggregationLevel === "song") {
          return (
            (item.Song && item.Song.toLowerCase().includes(term)) ||
            (item.Artist && item.Artist.toLowerCase().includes(term)) ||
            (item.Album && item.Album.toLowerCase().includes(term))
          );
        } else if (aggregationLevel === "album") {
          return (
            (item.Album && item.Album.toLowerCase().includes(term)) ||
            (item.Artist && item.Artist.toLowerCase().includes(term))
          );
        } else { // artist
          return item.Artist && item.Artist.toLowerCase().includes(term);
        }
      });
    }
    
    // Then sort
    if (!sortColumn) return filtered;
    
    // Only sort client-side if the data is small enough
    if (filtered.length <= 300) {
      return [...filtered].sort((a, b) => {
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
    
    return filtered; // For large datasets, we rely on the backend sorting
  }, [currentData, searchTerm, sortColumn, sortDirection, aggregationLevel]);

  // Memoized statistics for better performance
  const stats = useMemo(() => {
    if (!filteredAndSortedData || filteredAndSortedData.length === 0) {
      return { count: 0, plays: 0, minutes: 0 };
    }
    
    const count = filteredAndSortedData.length;
    const plays = filteredAndSortedData.reduce((sum, item) => sum + (Number(item.Plays) || 0), 0);
    const minutes = filteredAndSortedData.reduce((sum, item) => sum + (Number(item["Minutes Played"]) || 0), 0);
    
    return { count, plays, minutes };
  }, [filteredAndSortedData]);

  // Handler for album clicks
  const handleAlbumClick = useCallback((album: string) => {
    setDetailType("album");
    setDetailName(album);
    setDetailModalOpen(true);
  }, []);

  // Handler for artist clicks
  const handleArtistClick = useCallback((artist: string) => {
    setDetailType("artist");
    setDetailName(artist);
    setDetailModalOpen(true);
  }, []);

  // Close the detail modal
  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
  }, []);

  // Add the handler for row clicks

  const handleRowClick = useCallback((row: any) => {
    // Handle the row click based on the current aggregation level
    if (aggregationLevel === "album" && row.Album) {
      handleAlbumClick(row.Album);
    } else if (aggregationLevel === "artist" && row.Artist) {
      handleArtistClick(row.Artist);
    }
    // For song level, we don't need to do anything since the row itself doesn't
    // directly represent an album or artist
  }, [aggregationLevel, handleAlbumClick, handleArtistClick]);

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
            "Album": "20%",
            "Plays": "10%",
            "Minutes Played": "15%"
          }
        };
      case "album":
        return {
          columnOrder: ["Album", "Artist", "Songs", "Plays", "Minutes Played"],
          columnWidths: {
            "Album": "35%",
            "Artist": "30%",
            "Songs": "10%",
            "Plays": "10%",
            "Minutes Played": "15%"
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
        
        {/* Search bar */}
        <div className="mb-4">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${aggregationLevel === "song" ? "songs, artists or albums" : 
                      aggregationLevel === "album" ? "albums or artists" : "artists"}...`}
          />
          {searchTerm && (
            <div className="mt-2 text-sm text-spotify-light-gray">
              Showing {filteredAndSortedData.length} results for "{searchTerm}"
            </div>
          )}
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
            data={filteredAndSortedData} 
            columnOrder={columnOrder}
            columnWidths={columnWidths}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            initialRowCount={100}
            rowIncrement={50}
            onAlbumClick={handleAlbumClick}
            onArtistClick={handleArtistClick}
            onRowClick={handleRowClick}
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
                      <button 
                        onClick={() => handleArtistClick(artist.Artist)}
                        className="text-spotify-off-white hover:text-spotify-green hover:underline text-left"
                      >
                        {artist.Artist}
                      </button>
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
                      <button 
                        onClick={() => handleAlbumClick(album.Album)}
                        className="text-spotify-off-white hover:text-spotify-green hover:underline text-left"
                      >
                        {album.Album}
                      </button>
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
  ), [isDataLoaded, songData, albumData, artistData, handleAlbumClick, handleArtistClick]);

  const tabs = [
    { id: "upload", label: "Upload", content: UploadArea },
    { id: "tracks", label: "Top Tracks", content: TracksTable },
    { id: "stats", label: "Statistics", content: StatsView },
  ];

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-black text-spotify-off-white font-sans">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold text-spotify-green mb-6 text-center">
          <SpotifyLogo />
          Spotify Data Explorer
        </h1>
        <TabNavigation tabs={tabs} defaultTab="upload" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Detail Modal */}
      {detailModalOpen && (
        <DetailModal
          detailType={detailType}
          detailName={detailName}
          isOpen={detailModalOpen}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}