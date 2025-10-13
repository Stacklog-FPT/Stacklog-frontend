import React from 'react';
import './Document.scss';
import { FaPlus } from 'react-icons/fa';
import UploadFile from './UploadFile/UploadFile';
const Document = () => {
  const [isShowUpload, setIsShowUpload] = React.useState(false);

  const handleCloseModal = () => {
    setIsShowUpload(false);
  };
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
        </div>
      </div>
      {isShowUpload && <UploadFile onClose={handleCloseModal} />}
    </>
  );
};

export default Document;
