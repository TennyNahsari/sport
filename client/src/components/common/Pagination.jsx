import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange } from '../../utils/pagination';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
  label = 'data'
}) {
  if (totalPages <= 1 && totalItems === undefined) return null;

  const pages = getPaginationRange(currentPage, totalPages, 2, 1);

  const calcStart = startIndex !== undefined ? startIndex + 1 : null;
  const calcEnd = endIndex !== undefined ? endIndex : null;

  return (
    <div className="bg-white p-4 rounded-card border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      {/* Items counter summary */}
      {totalItems !== undefined && (
        <div className="text-slate-500 font-semibold">
          Menampilkan <span className="text-navy font-bold">{calcStart || 1}</span> -{' '}
          <span className="text-navy font-bold">{calcEnd || totalItems}</span> dari{' '}
          <span className="text-navy font-bold">{totalItems}</span> {label}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-1.5 ml-auto">
          {/* Prev Button */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-button border border-slate-200 hover:bg-slate-100 text-navy font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          {pages.map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 font-bold select-none">
                  ...
                </span>
              );
            }

            const pageNum = item;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-button text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'border border-slate-200 hover:bg-slate-100 text-navy'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-button border border-slate-200 hover:bg-slate-100 text-navy font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
