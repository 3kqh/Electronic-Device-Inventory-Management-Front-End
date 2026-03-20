import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const styles = {
  container: {
    position: 'relative',
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #e0e0e0',
    backgroundColor: '#f5f5f5',
    fontWeight: 600,
    fontSize: 14,
    color: '#333',
    userSelect: 'none',
  },
  thSortable: {
    cursor: 'pointer',
  },
  td: {
    padding: '10px 16px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: 14,
    color: '#555',
  },
  row: {
    transition: 'background-color 0.15s',
  },
  rowClickable: {
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
    color: '#999',
    fontSize: 15,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #e0e0e0',
    fontSize: 14,
    color: '#555',
  },
  paginationButtons: {
    display: 'flex',
    gap: 8,
  },
  pageButton: {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageButtonActive: {
    backgroundColor: '#1976d2',
    color: '#fff',
    borderColor: '#1976d2',
  },
  sortArrow: {
    marginLeft: 4,
    fontSize: 12,
  },
};

export default function DataTable({
  columns = [],
  data = [],
  pagination,
  onPageChange,
  onSort,
  onRowClick,
  loading = false,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;
    const newDirection = sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(column.key);
    setSortDirection(newDirection);
    onSort(column.key, newDirection);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;
  const currentPage = pagination ? pagination.page : 1;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...styles.th,
                  ...(col.sortable ? styles.thSortable : {}),
                }}
                onClick={() => handleSort(col)}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (
                  <span style={styles.sortArrow}>
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && !loading ? (
            <tr>
              <td colSpan={columns.length} style={styles.emptyState}>
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || row.id || rowIndex}
                style={{
                  ...styles.row,
                  ...(onRowClick ? styles.rowClickable : {}),
                }}
                onClick={() => onRowClick && onRowClick(row)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9f9f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={styles.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && totalPages > 0 && (
        <div style={styles.pagination}>
          <span>
            Trang {currentPage} / {totalPages} (Tổng: {pagination.total})
          </span>
          <div style={styles.paginationButtons}>
            <button
              style={{
                ...styles.pageButton,
                ...(currentPage <= 1 ? styles.pageButtonDisabled : {}),
              }}
              disabled={currentPage <= 1}
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
            >
              ‹
            </button>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                style={{
                  ...styles.pageButton,
                  ...(pageNum === currentPage ? styles.pageButtonActive : {}),
                }}
                onClick={() => onPageChange && onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              style={{
                ...styles.pageButton,
                ...(currentPage >= totalPages ? styles.pageButtonDisabled : {}),
              }}
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
