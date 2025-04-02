// src/components/ui/monthly-top-songs.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api-config";

interface MonthlyTopSong {
  month: string;
  song: string;
  artist: string;
  album: string;
  plays: number;
  minutes_played: number;
}

export const MonthlyTopSongs = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [topSongs, setTopSongs] = useState<MonthlyTopSong[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyTopSongs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/monthly-top-songs`);
        
        if (response.status === 404) {
          // This is the "No data available" response from the server
          // We'll handle this as a normal case, not an error
          setTopSongs([]);
        } else if (!response.ok) {
          // For other error codes, we'll still throw an error
          throw new Error("Failed to fetch monthly top songs");
        } else {
          // Success case
          const result = await response.json();
          setTopSongs(result.data || []);
        }
      } catch (err) {
        console.error("Error fetching monthly top songs:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyTopSongs();
  }, []);

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
            <div className="text-spotify-off-white">Loading your monthly favorites...</div>
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

  if (topSongs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Top Songs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-spotify-dark-gray p-4 rounded-lg text-center">
            <div className="mt-2 text-spotify-light-gray">
              Upload your data to see your most played song for each month
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Monthly Top Songs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSongs.map((item, index) => (
            <div key={index} className="bg-spotify-dark-gray rounded-lg p-4 hover:bg-spotify-medium-gray transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-spotify-green font-semibold text-lg">{formatMonth(item.month)}</h3>
                <div className="text-spotify-off-white bg-spotify-medium-gray px-3 py-1 rounded-full text-sm">
                  {item.plays} plays
                </div>
              </div>
              
              <div className="mb-1 text-lg font-medium text-spotify-off-white truncate">
                {item.song}
              </div>
              
              <div className="flex justify-between">
                <div className="text-spotify-light-gray truncate">
                  {item.artist}
                </div>
                <div className="text-spotify-light-gray text-sm">
                  {Math.round(item.minutes_played)} minutes
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};