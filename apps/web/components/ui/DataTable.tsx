'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = '暫無數據',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--panel)',
        borderWidth: '1px',
        borderColor: 'var(--border)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead style={{ backgroundColor: 'var(--panel-soft)' }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)', width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderTopWidth: '1px', borderColor: 'var(--border)' }}>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center"
                  style={{ color: 'var(--muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={String(item[keyField])}
                  className={onRowClick ? 'cursor-pointer hover:opacity-80' : ''}
                  style={{
                    borderBottomWidth: '1px',
                    borderColor: 'var(--border)',
                  }}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-sm"
                      style={{ color: 'var(--text)' }}
                    >
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
