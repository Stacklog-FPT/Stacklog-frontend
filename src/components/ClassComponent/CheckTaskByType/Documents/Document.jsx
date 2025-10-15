import React from 'react';
import './Document.scss';
import { FaPlus } from 'react-icons/fa';
import UploadFile from './UploadFile/UploadFile';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthProvider';
import { getDocumentById } from '../../../../service/DocumentService';
import { useDispatch } from 'react-redux';
import DocumentRecent from '../../../DocumentComponents/DocumentRecent/DocumentRecent';
const Document = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { documents } = useSelector((state) => state.document);
  const dispatch = useDispatch();
  const [isShowUpload, setIsShowUpload] = React.useState(false);

  const handleCloseModal = () => {
    setIsShowUpload(false);
  };

  const handleGetDocuments = async () => {
    await getDocumentById(groupId, user.token, dispatch);
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
          <DocumentRecent title={'Documents'} data={documents} />
        </div>
      </div>
      {isShowUpload && <UploadFile onClose={handleCloseModal} />}
    </>
  );
};

export default Document;
