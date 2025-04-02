// src/components/ui/monthly-top-songs.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api-config";

interface MonthlyTopSongsProps {
  isDataLoaded: boolean;
}

interface Song {
  song: string;
  artist: string;
  album: string;
  plays: number;
  minutes_played: number;
  rank: number;
}

interface MonthData {
  month: string;
  songs: Song[];
}

export const MonthlyTopSongs = ({ isDataLoaded }: MonthlyTopSongsProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyTopSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/monthly-top-songs`);
        
        if (response.status === 404) {
          // This is the "No data available" response from the server
          // We'll handle this as a normal case, not an error
          setMonthlyData([]);
        } else if (!response.ok) {
          // For other error codes, we'll still throw an error
          throw new Error("Failed to fetch monthly top songs");
        } else {
          // Success case
          const result = await response.json();
          setMonthlyData(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching monthly top songs:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we know data has been loaded
    if (isDataLoaded) {
      fetchMonthlyTopSongs();
    } else {
      // Reset state when no data is loaded
      setMonthlyData([]);
      setError(null);
      setLoading(false);
    }
  }, [isDataLoaded]);

  // Helper function to format the month
  const formatMonth = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long'
      });
    } catch (e) {
      return monthStr; // Return as-is if parsing fails
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Top Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-spotify-off-white">Loading your top songs by month...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Top Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-spotify-dark-gray p-4 rounded-lg text-center">
            <div className="text-red-500 mb-2">Error loading data</div>
            <div className="text-spotify-off-white">{error}</div>
            <div className="mt-4 text-spotify-light-gray">Try uploading your data again or check if you're connected to the server.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Top Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-spotify-dark-gray p-4 rounded-lg text-center">
            <div className="text-spotify-off-white">Upload your Spotify data to view your top songs by month</div>
            <div className="mt-2 text-spotify-light-gray">
              Once you upload your data, you'll see your most played songs for each month
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Top 5 Songs By Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {monthlyData.map((monthData, monthIndex) => (
            <div key={monthIndex} className="bg-spotify-darker-gray rounded-lg overflow-hidden">
              {/* Month header */}
              <div className="bg-spotify-dark-gray p-4 border-b border-spotify-medium-gray">
                <h3 className="text-spotify-green font-semibold text-lg">
                  {formatMonth(monthData.month)}
                </h3>
              </div>
              
              <div className="p-4">
                {/* Top song - featured prominently */}
                {monthData.songs && monthData.songs.length > 0 && (
                  <div className="bg-spotify-dark-gray rounded-lg p-4 mb-4 hover:bg-spotify-medium-gray transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-spotify-green text-black w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3">
                        1
                      </div>
                      <div className="text-lg font-medium text-spotify-off-white truncate">
                        {monthData.songs[0].song}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="text-spotify-light-gray truncate ml-11">
                        {monthData.songs[0].artist}
                      </div>
                      <div className="flex space-x-10 text-spotify-light-gray text-sm whitespace-nowrap">
                        <span>{monthData.songs[0].plays.toLocaleString()} plays</span>
                        <span>{Math.round(monthData.songs[0].minutes_played).toLocaleString()} minutes</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Songs 2-5 in a more compact format */}
                {monthData.songs && monthData.songs.length > 1 && (
                  <div className="space-y-2">
                    {monthData.songs.slice(1).map((song, songIndex) => (
                      <div 
                        key={songIndex}
                        className="flex items-center p-2 rounded hover:bg-spotify-dark-gray transition-colors"
                      >
                        <div className="bg-spotify-medium-gray text-spotify-off-white w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3 text-sm">
                          {song.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-spotify-off-white truncate">
                            {song.song}
                          </div>
                          <div className="text-spotify-light-gray text-sm truncate">
                            {song.artist}
                          </div>
                        </div>
                        <div className="text-spotify-light-gray text-sm whitespace-nowrap ml-4">
                          {song.plays.toLocaleString()} plays
                        </div>
                        <div className="ml-11 flex justify-between">
                        <div className="text-spotify-light-gray text-sm">
                            {Math.round(song.minutes_played).toLocaleString()} minutes
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};