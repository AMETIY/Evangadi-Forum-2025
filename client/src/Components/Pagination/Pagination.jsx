import React from 'react'
import styles from './Pagination.module.css'
import { Button } from 'react-bootstrap'

const Pagination = ({currentPage, totalPages, onPageChange, totalItems, itemsPerPage, loading = false}) => {

     //We Don't render pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) return null;

  // Generate page numbers to display (show max 5 page numbers)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic for larger page counts
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate display info
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.paginationContainer}>
      {/* Results info */}
      <div className={styles.resultsInfo}>
        Showing {startItem}-{endItem} of {totalItems} questions
      </div>

      {/* Pagination controls */}
      <div className={styles.paginationControls}>
        {/* Previous button */}
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          className={styles.navButton}
        >
          Previous
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={styles.ellipsis}>...</span>
            ) : (
              <Button
                variant={page === currentPage ? 'primary' : 'outline-primary'}
                size="sm"
                disabled={loading}
                onClick={() => onPageChange(page)}
                className={`${styles.pageButton} ${
                  page === currentPage ? styles.active : ''
                }`}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <Button
          variant="outline-primary"
          size="sm"
          disabled={currentPage === totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          className={styles.navButton}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default Pagination