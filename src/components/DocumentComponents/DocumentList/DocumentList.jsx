import React from 'react';
import './DocumentList.scss';
import { FaPlus } from 'react-icons/fa';
import DocumentCard from './DocumentCard/DocumentCard';
import UploadFile from '../../ClassComponent/CheckTaskByType/Documents/UploadFile/UploadFile';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../../context/AuthProvider';
import { getDocumentById, getDocumentByUserId } from '../../../service/DocumentService';
const DocumentList = () => {
  const [isOpenUpload, setIsOpenUpload] = React.useState(false);
  const { documentPerson } = useSelector((state) => state.document);
  console.log('Debug documentPerson: ', documentPerson);
  const { documents } = useSelector((state) => state.document);
  const documentReport = documents.filter((doc) => doc.documentType === 'REPORT');
  console.log('Document Report: ', documentReport);
  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleCloseModal = () => {
    setIsOpenUpload(false);
  };

  const handleGetUserDocument = async () => {
    const res = await getDocumentByUserId(user.token, dispatch);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpenUpload(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    handleGetUserDocument();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user.token, dispatch]);

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
            <DocumentCard title={'By me'} data={documentPerson} />
            <DocumentCard title={'Report'} data={documentReport} />
          </div>
        </div>
      </div>
      {isOpenUpload && <UploadFile onClose={handleCloseModal} isGroup={false} />}
    </>
  );
};

export default DocumentList;
