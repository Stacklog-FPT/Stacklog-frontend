import React from 'react';
import './DocumentList.scss';
import { FaPlus } from 'react-icons/fa';
import DocumentCard from './DocumentCard/DocumentCard';
import UploadFile from '../../ClassComponent/CheckTaskByType/Documents/UploadFile/UploadFile';
const DocumentList = () => {
  const [isOpenUpload, setIsOpenUpload] = React.useState(false);
  console.log(isOpenUpload);
  const [documents, setDocuments] = React.useState([
    {
      _id: 1,
      title: 'Feature',
      data: [
        {
          _id: 1,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 2,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 3,
          title: 'Tech requirement.pdf',
          size: 200,
        },
      ],
    },
    {
      _id: 2,
      title: 'Favorite',
      data: [
        {
          _id: 1,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 2,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 3,
          title: 'Tech requirement.pdf',
          size: 200,
        },
      ],
    },
    {
      _id: 3,
      title: 'By me',
      data: [
        {
          _id: 1,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 2,
          title: 'Tech requirement.pdf',
          size: 200,
        },
        {
          _id: 3,
          title: 'Tech requirement.pdf',
          size: 200,
        },
      ],
    },
  ]);

  const handleCloseModal = () => {
    setIsOpenUpload(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpenUpload(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <div className="document__list">
        <div className="document__list__container">
          <div className="document__list__heading d-flex align-items-center justify-content-between">
            <div className="document__list__container__heading">
              <h2>Document</h2>
            </div>
            <div className="main__component__container__heading__btn__add">
              <button onClick={() => setIsOpenUpload(!isOpenUpload)}>
                <FaPlus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="document__list__container__main__content">
            {documents.length > 0 ? (
              documents.map((item) => (
                <DocumentCard key={item._id} title={item.title} data={item.data} />
              ))
            ) : (
              <h2>The documents is empty</h2>
            )}
          </div>
        </div>
      </div>
      {isOpenUpload && <UploadFile onClose={handleCloseModal} />}
    </>
  );
};

export default DocumentList;
