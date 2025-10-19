import React from 'react';
import './Document.scss';
import { FaPlus } from 'react-icons/fa';
import UploadFile from './UploadFile/UploadFile';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthProvider';
import { deleteDocumentApi, getDocumentById } from '../../../../service/DocumentService';
import { useDispatch } from 'react-redux';
import { FaTrash } from 'react-icons/fa';

const Document = () => {
  // Get id from param
  const { groupId } = useParams();
  // Get user in auth contexr
  const { user } = useAuth();
  // Get data from Redux and dispatch if have anything changes
  const { documents } = useSelector((state) => state.document);
  const dispatch = useDispatch();

  // Show upload variable
  const [isShowUpload, setIsShowUpload] = React.useState(false);

  // Variable for pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = React.useState(1);

  // tính currentItems mỗi render
  const currentItems = documents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(documents.length / itemsPerPage);

  // reset page khi documents thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [documents]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleCloseModal = () => {
    setIsShowUpload(false);
  };

  const handleGetDocuments = async () => {
    await getDocumentById(groupId, user.token, dispatch);
  };

  const handleDeleteDocument = async (id) => {
    await deleteDocumentApi(deleteDocumentApi(id, user.token, dispatch));
  };

  React.useEffect(() => {
    handleGetDocuments();
  }, [groupId]);

  React.useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setIsShowUpload(false);
      }
    });
  }, []);
  return (
    <>
      <div className="document">
        <div className="document__container">
          <div className="document__header">
            <div className="main__component__container__heading__title">
              <h2>Documents</h2>
            </div>
            <div className="main__component__container__heading__btn__add">
              <button onClick={() => setIsShowUpload(!isShowUpload)}>
                <FaPlus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>
          {/* Document List */}
          <div className="document__recent__container__main__content">
            {currentItems?.length > 0 ? (
              currentItems.map((item) => {
                return (
                  <div
                    className="document__recent__container__main__content__item d-flex align-items-center justify-content-between"
                    key={item._id}
                  >
                    <div className="document__recent__container__main__content__item__content">
                      <span className="document__recent__container__main__content__item__content__title">
                        {item.documentTitle}
                      </span>
                      <span className="document__recent__container__main__content__item__content__description">
                        {item.documentSize} KB
                      </span>
                    </div>
                    <div className="document__recent__container__main__content__item__bin">
                      <FaTrash onClick={() => handleDeleteDocument(item.documentId)} />
                    </div>
                  </div>
                );
              })
            ) : (
              <h2>No document recent</h2>
            )}
          </div>

          <div className="pagination">
            {documents.length > itemsPerPage && (
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
      </div>
      {isShowUpload && <UploadFile onClose={handleCloseModal} />}
    </>
  );
};

export default Document;
