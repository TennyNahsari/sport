/**
 * Calculates page numbers array for truncated pagination display:
 * Next, Prev, several initial pages, ellipsis (...), current page range, ellipsis (...), several end pages.
 *
 * @param {number} currentPage Current active page (1-indexed)
 * @param {number} totalPages Total number of pages
 * @param {number} boundaryCount Number of initial/end pages to display (default: 2)
 * @param {number} siblingCount Number of pages to display on each side of currentPage (default: 1)
 * @returns {Array<number|string>} Array containing page numbers and '...' strings
 */
export function getPaginationRange(currentPage, totalPages, boundaryCount = 2, siblingCount = 1) {
  if (totalPages <= 1) return [1];

  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 2;
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const startPages = Array.from({ length: Math.min(boundaryCount, totalPages) }, (_, i) => i + 1);
  const endPages = Array.from(
    { length: Math.min(boundaryCount, totalPages) },
    (_, i) => totalPages - Math.min(boundaryCount, totalPages) + i + 1
  );

  const startSibling = Math.max(currentPage - siblingCount, boundaryCount + 1);
  const endSibling = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

  const showStartEllipsis = startSibling > boundaryCount + 1;
  const showEndEllipsis = endSibling < totalPages - boundaryCount;

  const result = [...startPages];

  if (showStartEllipsis) {
    result.push('...');
  } else {
    for (let i = boundaryCount + 1; i < startSibling; i++) {
      if (!result.includes(i)) result.push(i);
    }
  }

  for (let i = startSibling; i <= endSibling; i++) {
    if (i > boundaryCount && i <= totalPages - boundaryCount) {
      if (!result.includes(i)) result.push(i);
    }
  }

  if (showEndEllipsis) {
    result.push('...');
  } else {
    for (let i = endSibling + 1; i <= totalPages - boundaryCount; i++) {
      if (!result.includes(i)) result.push(i);
    }
  }

  endPages.forEach((p) => {
    if (!result.includes(p)) result.push(p);
  });

  return result;
}
