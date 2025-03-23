// frontend/src/components/ui/detail-modal.tsx
import { useState, useEffect, useMemo } from "react";
import { SimpleTable } from "@/components/ui/simple-table";

interface DetailModalProps {
  detailType: "album" | "artist";
  detailName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailData {
  data: any[];
  summary: {
    total_plays: number;
    total_minutes: number;
    song_count: number;
  };
  name: string;
  type: string;
}

export const DetailModal = ({ detailType, detailName, isOpen, onClose }: DetailModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && detailName) {
      fetchDetailData();
    }
  }, [isOpen, detailName, detailType]);

  const fetchDetailData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/data/detail/${detailType}/${encodeURIComponent(detailName)}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch detail data");
      }
      
      const result = await response.json();
      setDetailData(result);
    } catch (err) {
      console.error("Error fetching detail data:", err);
      setError("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  // Process data to filter out redundant columns
  const processedData = useMemo(() => {
    if (!detailData || !detailData.data) return [];
    
    return detailData.data.map(item => {
      const newItem = {...item};
      
      // Remove redundant columns based on detail type
      if (detailType === "album") {
        // For album view, remove both Album and Artist columns
        delete newItem.Album;
        delete newItem.Artist;
      } else if (detailType === "artist") {
        // For artist view, remove just the Artist column
        delete newItem.Artist;
      }
      
      return newItem;
    });
  }, [detailData, detailType]);

  if (!isOpen) return null;

  // Column configuration based on detail type
  const columnOrder = detailType === "album" 
    ? ["Song", "Plays", "Minutes Played"]  // Only relevant columns for album view
    : ["Song", "Album", "Plays", "Minutes Played"];  // Keep Album for artist view
    
  const columnWidths = detailType === "album"
    ? {
        "Song": "60%",
        "Plays": "20%",
        "Minutes Played": "20%"
      }
    : {
        "Song": "40%",
        "Album": "30%",
        "Plays": "15%",
        "Minutes Played": "15%"
      };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-spotify-dark-gray rounded-lg w-full max-w-[70%] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-spotify-medium-gray flex justify-between items-center">
          <h2 className="text-xl font-semibold text-spotify-off-white">
            {detailType === "album" ? "Album" : "Artist"}: {detailName}
          </h2>
          <button 
            onClick={onClose}
            className="text-spotify-off-white hover:text-spotify-green"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : detailData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-spotify-medium-gray p-3 rounded">
                  <p className="text-sm text-spotify-off-white">Songs</p>
                  <p className="text-lg font-semibold text-spotify-green">{detailData.summary.song_count}</p>
                </div>
                <div className="bg-spotify-medium-gray p-3 rounded">
                  <p className="text-sm text-spotify-off-white">Total Plays</p>
                  <p className="text-lg font-semibold text-spotify-green">{detailData.summary.total_plays.toLocaleString()}</p>
                </div>
                <div className="bg-spotify-medium-gray p-3 rounded">
                  <p className="text-sm text-spotify-off-white">Minutes Played</p>
                  <p className="text-lg font-semibold text-spotify-green">{detailData.summary.total_minutes.toLocaleString(undefined, {maximumFractionDigits: 1})}</p>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[50vh]">
                <SimpleTable 
                  data={processedData}
                  columnOrder={columnOrder}
                  columnWidths={columnWidths}
                  sortColumn="Plays"
                  sortDirection="desc"
                  initialRowCount={100}
                  rowIncrement={50}
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-4">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};