import React from "react";
import "./Document.scss";
import { FaPlus } from "react-icons/fa";
import UploadFile from "./UploadFile/UploadFile";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthProvider";
import {
  deleteDocumentApi,
  getDocumentById,
} from "../../../../service/DocumentService";
import { useDispatch } from "react-redux";
import { FaTrash } from "react-icons/fa";
import DocumentDetail from "../../../DocumentComponents/DocumentDetail/DocumentDetail";
import Swal from "sweetalert2";
import { formatFileSize } from "../../../../helper/calculateByte";

const Document = () => {
  // Get id from param
  const { groupId } = useParams();
  // Get user in auth context
  const { user } = useAuth();
  // Get data from Redux and dispatch if have anything changes
  const { documents } = useSelector((state) => state.document);
  const dispatch = useDispatch();

  // State to control show detail file
  const [isShowDetail, setIsShowDetail] = React.useState({
    documentId: "",
    status: false,
  });

  // Show upload variable
  const [isShowUpload, setIsShowUpload] = React.useState(false);

  // Variable for pagination
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = React.useState(1);

  const filteredDocuments = (documents || []).filter(
    (item) =>
      item &&
      Array.isArray(item.documentLocations) &&
      item.documentLocations.some((loc) => loc.groupId === groupId)
  );

  const currentItems = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

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

  // Get documents by group id
  const handleGetDocuments = async () => {
    const res = await getDocumentById(groupId, user.token, dispatch);
  };

  // Handle delete document
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
      console.log(res);
      if (res) {
        Swal.fire("Deleted!", "This doc was removed successfully.", "success");
      } else {
        Swal.fire("Error!", "Something went wrong during deletion.", "error");
      }
    }
  };

  // Handle see detail
  const handleSeeDetail = (documentId) => {
    setIsShowDetail({ documentId: documentId, status: true });
  };

  React.useEffect(() => {
    handleGetDocuments();
    // Event listener for esc key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setIsShowUpload(false);
      }
    });
  }, [groupId]);

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
                    key={item.documentId}
                    onClick={() => handleSeeDetail(item.documentId)}
                  >
                    <div className="document__recent__container__main__content__item__content">
                      <span className="document__recent__container__main__content__item__content__title">
                        {item.documentTitle}
                      </span>
                      <span className="document__recent__container__main__content__item__content__description">
                        {formatFileSize(item.documentSize)}
                      </span>
                    </div>
                    <div className="document__recent__container__main__content__item__bin">
                      <FaTrash
                        onClick={(e) =>
                          handleDeleteDocument(e, item.documentId)
                        }
                      />
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
      {isShowUpload && <UploadFile onClose={handleCloseModal} isGroup={true} />}
      {isShowDetail && (
        <DocumentDetail
          id={isShowDetail.documentId}
          onClose={() => setIsShowDetail({ documentId: "", status: false })}
        />
      )}
    </>
  );
};

export default Document;
