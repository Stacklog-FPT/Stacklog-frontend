import React, { useState } from "react";
import "./Document.scss";
import filterList from "../../../assets/home/planDocument/filter_list.png";
import filterUpload from "../../../assets/home/planDocument/file_upload.png";
import deleteOutline from "../../../assets/home/planDocument/delete_outline.png";
import CardDocument from "./CardDocument/CardDocument";

const Document = () => {
  // This is list of document from API
  const documents = [
    {
      id: 1,
      title: "Tech requirements",
      lastUpdated: "Jan 24, 2025",
      size: "200KB",
    },
    { id: 2, title: "File code", lastUpdated: "Jan 24, 2025", size: "200KB" },
    {
      id: 3,
      title: "File draw ERD",
      lastUpdated: "Jan 24, 2025",
      size: "200KB",
    },
    {
      id: 4,
      title: "Business requirements",
      lastUpdated: "Jan 24, 2025",
      size: "200KB",
    },
    {
      id: 5,
      title: "Code base file",
      lastUpdated: "Jan 24, 2025",
      size: "200KB",
    },
    {
      id: 6,
      title: "Java core and enviroment",
      lastUpdated: "Jan 24, 2025",
      size: "200KB",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = documents.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(documents.length / itemsPerPage);

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
    <div className="document__container">
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
              key={item.id}
              title={item.title}
              lastUpdated={item.lastUpdated}
              size={item.size}
            />
          ))
        ) : (
          <h2>No task for today!</h2>
        )}
      </div>

      <div className="pagination__controls">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="pagination__button"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`button_index ${
              currentPage === index + 1 ? "active" : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="pagination__button"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default Document;
