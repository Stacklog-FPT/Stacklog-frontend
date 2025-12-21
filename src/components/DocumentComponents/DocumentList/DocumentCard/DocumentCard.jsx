import React from "react";
import "./DocumentCard.scss";
import DocumentDetail from "../../DocumentDetail/DocumentDetail";
import { formatFileSize } from "../../../../helper/calculateByte";
import { deleteDocumentApi } from "../../../../service/DocumentService";
import { useAuth } from "../../../../context/AuthProvider";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { upperCaseFirstChart } from "../../../../helper/upperCaseFirstChart";
import { useParams } from "react-router-dom";
import decodeToken from "../../../../service/DecodeJwt";
const DocumentCard = ({ title, data }) => {
  const [isOpenDetail, showOpenDetail] = React.useState(false);
  const [documentId, setDocumentId] = React.useState("");
  const { groupId } = useParams();
  const { user } = useAuth();
  const userDecode = decodeToken(user.token);
  const dispatch = useDispatch();
  const isOwner = data?.createdBy === userDecode.id;
  console.log(isOwner);

  console.log(data);
  const handleShowDetail = (id) => {
    setDocumentId(id);
    showOpenDetail(true);
  };

  const handleCloseDetail = () => {
    showOpenDetail(false);
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

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        showOpenDetail(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  });
  return (
    <>
      <div
        className="document__card"
        style={{ width: groupId ? "50%" : "456px" }}
      >
        <div className="document__card__container">
          <div className="document__card__container__heading">
            <h2>{upperCaseFirstChart(title)}</h2>
            <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </div>

          <div className="document__card__container__list__data">
            {data?.length > 0 ? (
              data?.map((item) => (
                <div
                  key={item.documentId}
                  className="document__card__container__list__data__item"
                  onClick={() => handleShowDetail(item.documentId)}
                >
                  <i className="fa-solid fa-file"></i>
                  <div className="document__card__container__list__data__item__content">
                    <span className="document__card__container__list__data__item__content__title">
                      {upperCaseFirstChart(item.documentTitle)}
                    </span>
                    <span className="document__card__container__list__data__item__content__size">
                      {formatFileSize(item.documentSize)}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      className="btn-delete"
                      onClick={(e) => handleDeleteDocument(e, item.documentId)}
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <h2 className="text-heading">Documents are not available!</h2>
            )}
          </div>
        </div>
      </div>
      {isOpenDetail && (
        <DocumentDetail id={documentId} onClose={handleCloseDetail} />
      )}
    </>
  );
};

export default DocumentCard;
