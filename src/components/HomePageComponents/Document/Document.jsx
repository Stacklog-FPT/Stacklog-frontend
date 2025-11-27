import React, { useEffect, useState } from "react";
import "./Document.scss";
import filterList from "../../../assets/home/planDocument/filter_list.png";
import filterUpload from "../../../assets/home/planDocument/file_upload.png";
import deleteOutline from "../../../assets/home/planDocument/delete_outline.png";
import CardDocument from "./CardDocument/CardDocument";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useDispatch } from "react-redux";
import { getDocumentByUserId } from "../../../service/DocumentService";
import { useSelector } from "react-redux";
const Document = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { documentPerson } = useSelector((state) => state.document);
  console.log(documentPerson);
  useEffect(() => {
    if (user?.token) {
      getDocumentByUserId(user.token, dispatch);
    }
  }, [user?.token, dispatch]);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = documentPerson.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(documentPerson.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="document__container" onClick={() => navigate("/documents")}>
      <div className="document__heading">
        <div className="document__heading_title">
          <p className="text-center pt-3">Document</p>
        </div>

        <div className="document__heading__icon">
          <img src={filterList} alt="filter list icon" />
          <img src={filterUpload} alt="file upload icon" />
          <img src={deleteOutline} alt="delete outline icon" />
        </div>
      </div>
      <div className="document__body">
        <div className="document_name_column">
          <div className="wrapper__input__title__document">
            <input type="checkbox" />
            <p className="title">Title</p>
          </div>
          <p className="owner">Owner</p>
          <p className="last-update">Last updated</p>
        </div>
      </div>
      <div className="document__list">
        {currentDocuments.length > 0 ? (
          currentDocuments.map((item) => (
            <CardDocument
              key={item.documentId}
              title={item.documentTitle}
              lastUpdated={item.updateAt}
              size={item.documentSize}
            />
          ))
        ) : (
          <h2>Documents are not available!</h2>
        )}
      </div>

      <div className="pagination__controls">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination__button"
        >
          ←
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`button_index ${currentPage === i + 1 ? "active" : ""}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination__button"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default Document;
