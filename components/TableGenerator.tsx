'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
} from '@heroui/table';
import Link from 'next/link';
import { CirclePlus } from 'lucide-react';

type Props = {
  data: any;
  label: string;
  className: string;
  link: string;
};

export default function TableGenerator({
  data,
  label,
  className,
  link,
}: Props) {
  if (data) {
    const columnArr = Object.keys(data[0]);
    const tableColumns = [];
    for (let i = 0; i < columnArr.length; i++) {
      if (columnArr[i] === 'id') {
        tableColumns.push({ id: 'details', label: 'Details' });
        continue;
      }
      tableColumns.push({ id: columnArr[i], label: columnArr[i] });
    }
    const rows = [];
    const linkStr = `/dashboard/${link}/`;
    for (const row of data) {
      const rowCells = [];
      const vals = Object.values(row);
      for (let i = 0; i < vals.length; i++) {
        if (i === vals.length - 1) {
          const rowLinkStr = linkStr + `${row.id}`;
          rowCells.push(
            <TableCell>
              <Link href={rowLinkStr}>
                <CirclePlus size={16} />
              </Link>
            </TableCell>,
          );
          continue;
        } else if (typeof vals[i] === 'boolean') {
          rowCells.push(<TableCell>{vals[i] ? 'Yes' : 'No'}</TableCell>);
          continue;
        }
        rowCells.push(<TableCell>{vals[i]}</TableCell>);
      }
      rows.push(<TableRow key={row.id}>{rowCells}</TableRow>);
    }
    return (
      <Table aria-label={label} className={className}>
        <TableHeader columns={tableColumns}>
          {(column) => (
            <TableColumn key={column.id}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data} emptyContent={'No rows to display'}>
          {rows}
        </TableBody>
      </Table>
    );
  } else {
    return <div>No data available</div>;
  }
}
