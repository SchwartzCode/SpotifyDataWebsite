// src/components/ui/table.tsx

import { ReactNode, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => (
  <div className="overflow-x-auto w-full">
    <table className="min-w-full table-auto bg-spotify-dark-gray" style={{ fontWeight: 250 }}>{children}</table>
  </div>
);

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export const TableBody = ({ children, className }: TableBodyProps) => (
  <tbody className={className}>{children}</tbody>
);

interface TableHeaderProps {
  children: ReactNode;
}

export const TableHeader = ({ children }: TableHeaderProps) => (
  <thead>{children}</thead>
);

interface TableRowProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TableRow = ({ children, className, style, onClick }: TableRowProps) => (
  <tr className={className} style={style} onClick={onClick}>
    {children}
  </tr>
);

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const TableCell = ({ children, className }: TableCellProps) => (
  <td className={`py-2 px-4 ${className || ''}`}>{children}</td>
);

interface TableHeadProps {
  children: ReactNode;
  onClick?: () => void;
  isSorted?: boolean;
  isAscending?: boolean;
  className?: string;
}

export const TableHead = ({ children, onClick, isSorted, isAscending }: TableHeadProps) => (
  <th 
    className="py-2 px-4 text-center whitespace-nowrap hover:bg-spotify-medium-gray"
    style={{ fontWeight: 400 }}
    onClick={onClick}
  >
    <div className="flex items-center justify-center gap-2">
      {children}
      {isSorted && (isAscending ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />)}
    </div>
  </th>
);

interface DataTableProps {
  data: { [key: string]: any }[];
}

export const DataTable = ({ data }: DataTableProps) => {
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Simple, robust approach to get all columns from data
  const getAllColumns = () => {
    // If no data, return empty array
    if (!data || data.length === 0) return [];
    
    // Collect all possible column names from all objects
    const columnSet = new Set<string>();
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => columnSet.add(key));
      }
    });
    
    return Array.from(columnSet);
  };

  // Get columns and order them in a sensible way
  const getOrderedColumns = () => {
    const allColumns = getAllColumns();
    
    // Define known important columns to show first
    const priorityColumns = ['Song', 'Artist', 'Album', 'Plays', 'Minutes Played'];
    
    // Sort by priority first, then alphabetically
    return allColumns.sort((a, b) => {
      const aIndex = priorityColumns.indexOf(a);
      const bIndex = priorityColumns.indexOf(b);
      
      if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
      if (aIndex >= 0) return -1;
      if (bIndex >= 0) return 1;
      return a.localeCompare(b);
    });
  };

  const columnOrder = getOrderedColumns();

  const handleRowClick = (index: number) => {
    setSelectedRowIndexes((prevSelectedIndexes) =>
      prevSelectedIndexes.includes(index)
        ? prevSelectedIndexes.filter((i) => i !== index)
        : [...prevSelectedIndexes, index]
    );
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setSelectedRowIndexes([]);
  };

  // Format cell value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") {
      // Format numbers with commas for thousands
      return value.toLocaleString();
    }
    return String(value);
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    // Handle undefined/null values
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // Compare values
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // If no data or no columns, show message
  if (data.length === 0 || columnOrder.length === 0) {
    return <div className="text-spotify-off-white p-4">No data available</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnOrder.map((column) => (
            <TableHead
              key={column}
              onClick={() => handleSort(column)}
              isSorted={sortColumn === column}
              isAscending={sortDirection === "asc"}
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            onClick={() => handleRowClick(rowIndex)}
            className={`
              ${selectedRowIndexes.includes(rowIndex) ? "bg-spotify-light-gray" : "hover:bg-spotify-medium-gray"} 
              transition-colors duration-50
            `}
          >
            {columnOrder.map((column) => (
              <TableCell
                key={`${rowIndex}-${column}`}
                className="px-4 py-2 truncate overflow-hidden"
              >
                {formatValue(row[column])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};