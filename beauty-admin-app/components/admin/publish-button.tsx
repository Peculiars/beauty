import React from 'react';

interface PublishButtonProps {
  documentId: string;
  documentType: string;
}

const PublishButton: React.FC<PublishButtonProps> = ({ documentId, documentType }) => {
  const handlePublish = async () => {
    // Logic to publish the document
    console.log(`Publishing ${documentType} with ID: ${documentId}`);
    // Add your publish logic here
  };

  return (
    <button
      onClick={handlePublish}
      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Publish
    </button>
  );
};

export default PublishButton;