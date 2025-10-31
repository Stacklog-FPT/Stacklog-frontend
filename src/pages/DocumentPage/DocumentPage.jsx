import React from 'react';
import './DocumentPage.scss';
import DocumentList from '../../components/DocumentComponents/DocumentList/DocumentList';
import DocumentRecent from '../../components/DocumentComponents/DocumentRecent/DocumentRecent';
import { getDocumentByUserId } from '../../service/DocumentService';
import { useAuth } from '../../context/AuthProvider';
import { useDispatch } from 'react-redux';
const DocumentPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const handleGetDocuments = async () => {
    await getDocumentByUserId(user.token, dispatch);
  };

  React.useEffect(() => {
    handleGetDocuments();
  }, [user.token]);
  return (
    <div className="document__page">
      <DocumentList />
      <DocumentRecent title={'Document Access'} />
    </div>
  );
};

export default DocumentPage;
