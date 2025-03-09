import { ReactNode, useState } from "react";
// import classNames from "classnames";

interface TableProps {
  children: ReactNode;
}

export const Table = ({ children }: TableProps) => (
  <div className="overflow-x-auto bg-sidebar">
    <table className="min-w-full table-auto table-fixed bg-sidebar border-collapse">{children}</table>
    {/* <table className="min-w-full table-auto bg-sidebar">{children}</table> */}
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
  <thead className="bg-sidebar">{children}</thead>
);

interface TableRowProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties; // Update this to use the correct type for inline styles
}

export const TableRow = ({ children, className, style }: TableRowProps) => (
  <tr className={className} style={style}>
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
    className="py-2 px-4 text-center border-4 border-spotify-green-darkest font-semibold whitespace-nowrap bg-spotify-green-darker"
    onClick={onClick}
  >
    {children}
    {isSorted && (isAscending ? " 🔼" : " 🔽")}
  </th>
);

interface DataTableProps {
  data: { [key: string]: string | number | boolean }[]; // Replace with the actual structure of your data rows
}

export const DataTable = ({ data }: DataTableProps) => {
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
            className={index % 2 === 0 ? "bg-spotify-green" : "bg-spotify-green-dark"}
          >
            {Object.keys(row).map((key) => (
              <TableCell
                key={key}
                className="border-2 border-spotify-green-darker px-4 py-2"
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
