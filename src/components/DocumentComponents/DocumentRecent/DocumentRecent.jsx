import React from 'react';
import './DocumentRecent.scss';
import { FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { formatFileSize } from '../../../helper/calculateByte';

const DocumentRecent = ({ title, data }) => {
  const { documents } = useSelector((state) => state.document);
  const [recentDocuments, setRecentDocuments] = React.useState([
    {
      _id: 1,
      title: 'Tech requirement.pdf',
      description: "I read but didn't understand anything",
    },
    {
      _id: 2,
      title: 'Project guideline.docx',
      description: 'Need to review this with team',
    },
    {
      _id: 3,
      title: 'UI design.png',
      description: 'Uploaded design draft for feedback',
    },
    {
      _id: 4,
      title: 'README.md',
      description: 'Contains environment setup instructions',
    },
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(documents?.length / itemsPerPage);
  const [currentPage, setCurrentPage] = React.useState(1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = documents?.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDelete = (id) => {
    setRecentDocuments((prev) => prev.filter((doc) => doc._id !== id));
  };

  return (
    <div className="document__recent">
      <div className="document__recent__container">
        <div className="document__recent__container__heading">
          <h2>{title}</h2>
        </div>

        <div className="document__recent__container__main__content">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div
                className="document__recent__container__main__content__item d-flex align-items-center justify-content-between"
                key={item.documentId}
              >
                <div className="document__recent__container__main__content__item__content">
                  <span className="document__recent__container__main__content__item__content__title">
                    {item.documentTitle}
                  </span>
                  <span className="document__recent__container__main__content__item__content__description">
                    {formatFileSize(item.documentSize)}
                  </span>
                </div>
                <div
                  className="document__recent__container__main__content__item__bin"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash />
                </div>
              </div>
            ))
          ) : (
            <h2>No document recent</h2>
          )}
        </div>

        {recentDocuments.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="pagination__button"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="pagination__info">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination__button"
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentRecent;
