// src/components/ui/simple-table.tsx

import { ReactNode, useState } from "react";

interface SimpleTableProps {
  data: any[];
  // Optional prop to specify column order
  columnOrder?: string[];
  // Optional prop to specify column widths
  columnWidths?: { [key: string]: number | string };
}

export const SimpleTable = ({ data, columnOrder, columnWidths = {} }: SimpleTableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // If no data, show message
  if (!data || data.length === 0) {
    return <div className="text-spotify-off-white p-4">No data available</div>;
  }

  // Get all available columns from data
  const availableColumns = Object.keys(data[0] || {});

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

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to descending (for most played first)
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Sort the data based on current sort settings
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) {
      return 0; // No sorting
    }

    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle nulls/undefined
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Convert to numbers for numeric columns
    if (typeof aValue === "number" || !isNaN(Number(aValue))) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    // Do the comparison based on sort direction
    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Format cell value for display
  const formatCellValue = (column: string, value: any): string => {
    if (value === undefined || value === null) return "";
    
    // Format numbers
    if (typeof value === "number" || !isNaN(Number(value))) {
      // Format "Minutes Played" with one decimal place
      if (column === "Minutes Played") {
        return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
      }
      // Format other numbers with standard locale formatting
      return Number(value).toLocaleString();
    }
    
    return String(value);
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse bg-spotify-dark-gray text-spotify-off-white" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="border-b border-spotify-medium-gray">
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
                onClick={() => handleSort(column)}
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
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={rowIndex % 2 === 0 ? "bg-spotify-dark-gray" : "bg-black/30 hover:bg-spotify-medium-gray"}
            >
              {displayColumns.map((column) => (
                <td 
                  key={`${rowIndex}-${column}`} 
                  className="p-3 border-t border-spotify-dark-gray"
                  style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {formatCellValue(column, row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};