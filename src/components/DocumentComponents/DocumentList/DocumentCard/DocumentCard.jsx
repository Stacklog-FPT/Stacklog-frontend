import React from 'react';
import './DocumentCard.scss';
import DocumentDetail from '../../DocumentDetail/DocumentDetail';
import { formatFileSize } from '../../../../helper/calculateByte';
const DocumentCard = ({ title, data }) => {
  const [isOpenDetail, showOpenDetail] = React.useState(false);
  const [documentId, setDocumentId] = React.useState('');

  const handleShowDetail = (id) => {
    setDocumentId(id);
    showOpenDetail(true);
  };

  const handleCloseDetail = () => {
    showOpenDetail(false);
  };
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        showOpenDetail(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  });
  return (
    <>
      <div className="document__card">
        <div className="document__card__container">
          <div className="document__card__container__heading">
            <h2>{title}</h2>
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
                      {item.documentTitle}
                    </span>
                    <span className="document__card__container__list__data__item__content__size">
                      {formatFileSize(item.documentSize)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <h2>No data here!</h2>
            )}
          </div>
        </div>
      </div>
      {isOpenDetail && <DocumentDetail id={documentId} onClose={handleCloseDetail} />}
    </>
  );
};

export default DocumentCard;
