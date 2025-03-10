import { ReactNode, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto table-fixed bg-spotify-dark-gray font-sans" style={{ fontWeight: 250 }}>{children}</table>
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
  style?: React.CSSProperties; // Update this to use the correct type for inline styles
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
    className="py-2 px-4 text-center whitespace-nowrap"
    // className="whitespace-nowrap text-white border-b border-gray-300 px-4 py-2 bg-gray-400 flex items-center"
    style={{ fontWeight: 400 }}
    onClick={onClick}
  >
    {children}
    {isSorted && (isAscending ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />)}
  </th>
);

interface DataTableProps {
  data: { [key: string]: string | number | boolean }[]; // Replace with the actual structure of your data rows
}

export const DataTable = ({ data }: DataTableProps) => {
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);

  const handleRowClick = (index: number) => {
    setSelectedRowIndexes((prevSelectedIndexes) =>
      prevSelectedIndexes.includes(index)
        ? prevSelectedIndexes.filter((i) => i !== index) // Deselect the row if clicked again
        : [...prevSelectedIndexes, index] // Select the row
    );
  };

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortColumn === null) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Object.keys(data[0]).map((key) => (
            <TableHead
              key={key}
              onClick={() => handleSort(key)}
              isSorted={sortColumn === key}
              isAscending={sortDirection === "asc"}
            >
              {key}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((row, index) => (
          <TableRow
            key={index}
            onClick={() => handleRowClick(index)}
            className={`
              ${selectedRowIndexes.includes(index) ? "bg-spotify-light-gray" : "hover:bg-spotify-medium-gray"} 
              transition-colors duration-50
            `}
          >
            {Object.keys(row).map((key) => (
              <TableCell
                key={key}
                className="px-4 py-2"
              >
                {row[key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
