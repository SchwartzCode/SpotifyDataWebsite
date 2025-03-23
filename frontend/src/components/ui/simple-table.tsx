// src/components/ui/simple-table.tsx

import { ReactNode, useState, useEffect, useRef, useCallback } from "react";

interface SimpleTableProps {
  data: any[];
  // Specify column order
  columnOrder?: string[];
  // Specify column widths - allow undefined properties
  columnWidths?: { [key: string]: string | number | undefined };
  // Props for external sorting control
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  // Initial row count to display
  initialRowCount?: number;
  // Number of additional rows to add when scrolling
  rowIncrement?: number;

  onAlbumClick?: (album: string) => void;
  onArtistClick?: (artist: string) => void;
  onRowClick?: (row: any) => void; // Add this new prop
}

export const SimpleTable = ({ 
  data, 
  columnOrder, 
  columnWidths = {}, 
  sortColumn, 
  sortDirection = "desc", 
  onSort,
  initialRowCount = 100,
  rowIncrement = 50,
  onAlbumClick,
  onArtistClick,
  onRowClick,
}: SimpleTableProps) => {
  // State for number of rows to display
  const [visibleRows, setVisibleRows] = useState(initialRowCount);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const endObserverRef = useRef<HTMLDivElement>(null);

  // If no data, show message
  if (!data || data.length === 0) {
    return <div className="text-spotify-off-white p-4">No data available</div>;
  }

  // Get all available columns from data
  const availableColumns = Object.keys(data[0] || {});

  console.log("availableColumns: ", availableColumns);

  // Determine the columns to display and their order
  let displayColumns: string[] = [];
  
  if (columnOrder && columnOrder.length > 0) {
    // Use specified order, but only include columns that exist in the data
    displayColumns = columnOrder.filter(col => availableColumns.includes(col));
    
    // Add any columns from the data that weren't in the columnOrder
    availableColumns.forEach(col => {
      if (!displayColumns.includes(col)) {
        displayColumns.push(col);
      }
    });
  } else {
    // No column order specified, use the order from the data
    displayColumns = availableColumns;
  }

  // If no columns, show message
  if (displayColumns.length === 0) {
    return <div className="text-spotify-off-white p-4">No columns found in data</div>;
  }

  const formatCellValue = (column: string, value: any, row: any): ReactNode => {
    if (value === undefined || value === null) return "";
    
    // Make album and artist cells clickable
    if (column === "Album" && onAlbumClick) {
      return (
        <span className="hover:text-spotify-green hover:underline">
          {String(value)}
        </span>
      );
    }
    
    if (column === "Artist" && onArtistClick) {
      return (
        <span className="hover:text-spotify-green hover:underline">
          {String(value)}
        </span>
      );
    }
    
    // Format numbers
    if (typeof value === "number" || !isNaN(Number(value))) {
      // ... existing number formatting code
    }
    
    return String(value);
  };

  // Function to load more rows when scrolling
  const loadMoreRows = useCallback(() => {
    if (visibleRows < data.length) {
      setVisibleRows(prevCount => Math.min(prevCount + rowIncrement, data.length));
    }
  }, [visibleRows, data.length, rowIncrement]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRows();
        }
      },
      { threshold: 0.1 }
    );

    const currentEndObserver = endObserverRef.current;
    if (currentEndObserver) {
      observer.observe(currentEndObserver);
    }

    return () => {
      if (currentEndObserver) {
        observer.unobserve(currentEndObserver);
      }
    };
  }, [loadMoreRows]);

  // Reset visible rows when data changes
  useEffect(() => {
    setVisibleRows(initialRowCount);
  }, [data, initialRowCount]);

  // Get only the visible rows
  const visibleData = data.slice(0, visibleRows);
  const hasMoreRows = visibleRows < data.length;

  return (
    <div className="overflow-x-auto w-full" ref={tableContainerRef}>
      <table className="w-full border-collapse bg-spotify-dark-gray text-spotify-off-white" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="border-b border-spotify-medium-gray sticky top-0 bg-spotify-dark-gray z-10">
            {/* Row number column */}
            <th 
              className="p-3 text-left font-semibold w-16"
              style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              #
            </th>
            {displayColumns.map((column) => (
              <th 
                key={column} 
                className="p-3 text-left font-semibold cursor-pointer hover:bg-spotify-medium-gray"
                style={{ 
                  width: columnWidths[column] || `${100 / displayColumns.length}%`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => onSort && onSort(column)}
              >
                <div className="flex items-center">
                  <span>{column}</span>
                  {sortColumn === column && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? " ▲" : " ▼"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`${rowIndex % 2 === 0 ? "bg-spotify-dark-gray" : "bg-black/30"} hover:bg-spotify-medium-gray cursor-pointer`}
              onClick={() => {
                // Handle row click based on available data
                if (onRowClick) {
                  onRowClick(row);
                }
              }}
            >
              {/* Row number cell */}
              <td 
                className="p-3 border-t border-spotify-dark-gray text-spotify-light-gray"
                style={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={(e) => e.stopPropagation()} // Prevent row click for the row number
              >
                {rowIndex + 1}
              </td>
              {displayColumns.map((column) => (
                <td 
                  key={`${rowIndex}-${column}`} 
                  className="p-3 border-t border-spotify-dark-gray"
                  style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onClick={(e) => {
                    // For Album and Artist cells, use their specific click handlers
                    // This prevents double-triggering of both the cell click and row click
                    if (column === "Album" && onAlbumClick) {
                      e.stopPropagation();
                      onAlbumClick(row[column]);
                    } else if (column === "Artist" && onArtistClick) {
                      e.stopPropagation();
                      onArtistClick(row[column]);
                    }
                    // For other cells, let the event bubble to trigger the row click
                  }}
                >
                  {formatCellValue(column, row[column], row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Loading indicator and intersection observer target */}
      {hasMoreRows && (
        <div 
          ref={endObserverRef}
          className="py-4 text-center text-spotify-off-white"
        >
          Loading more...
        </div>
      )}
      
      {/* Show counts */}
      <div className="text-right text-sm text-spotify-medium-gray p-2">
        Showing {visibleData.length} of {data.length} rows
      </div>
    </div>
  );
};
