'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
  TableHeader,
  getKeyValue,
} from '@heroui/table';

export default function TableGenerator({ data, label, className }) {
  if (data) {
    const columnArr = Object.keys(data[0]);
    const tableColumns = [];
    for (let i = 0; i < columnArr.length; i++)
      tableColumns.push({ id: columnArr[i], label: columnArr[i] });
    return (
      <Table aria-label={label} className={className}>
        <TableHeader columns={tableColumns}>
          {(column) => (
            <TableColumn key={column.id}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data} emptyContent={'No rows to display'}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  } else {
    return <div>No data available</div>;
  }
}
