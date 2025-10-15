import React from 'react';
import './DocumentPage.scss';
import DocumentList from '../../components/DocumentComponents/DocumentList/DocumentList';
import DocumentRecent from '../../components/DocumentComponents/DocumentRecent/DocumentRecent';
const DocumentPage = () => {
  return (
    <div className="document__page">
      <DocumentList />
      <DocumentRecent title={'Recent'} />
    </div>
  );
};

export default DocumentPage;
