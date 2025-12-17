import React from "react";
import "./DocumentRecent.scss";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { formatFileSize } from "../../../helper/calculateByte";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch } from "react-redux";
import { deleteDocumentApi } from "../../../service/DocumentService";
import DocumentDetail from "../DocumentDetail/DocumentDetail";

const DocumentRecent = ({ title, data }) => {
  const { user } = useAuth();
  const { documents } = useSelector((state) => state.document);
  const [documentId, setDocumentId] = React.useState("");
  const dispatch = useDispatch();
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

  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: "Are you sure to delete this doc?",
      text: "This action can't completed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#045745",
      cancelButtonColor: "#c8cad4",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      const res = await deleteDocumentApi(id, user.token, dispatch);
      if (res) {
        Swal.fire("Deleted!", "This doc was removed successfully.", "success");
      } else {
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  return (
    <>
      <div className="document__recent">
        <div className="document__recent__container">
          <div className="document__recent__container__heading">
            <p>{title}</p>
          </div>

          <div className="document__recent__container__main__content">
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div
                  className="document__recent__container__main__content__item d-flex align-items-center justify-content-between"
                  key={item.documentId}
                  onClick={() => setDocumentId(item.documentId)}
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
                    onClick={(e) => handleDeleteDocument(e, item.documentId)}
                  >
                    <FaTrash />
                  </div>
                </div>
              ))
            ) : (
              <h2>No document recent</h2>
            )}
          </div>

          {currentItems.length > itemsPerPage && (
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
      {documentId && (
        <DocumentDetail id={documentId} onClose={() => setDocumentId("")} />
      )}
    </>
  );
};

export default DocumentRecent;
