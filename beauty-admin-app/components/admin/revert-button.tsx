import React from 'react';

interface RevertButtonProps {
  documentId: string;
  documentType: string;
}

const RevertButton: React.FC<RevertButtonProps> = ({ documentId, documentType }) => {
  const handleRevert = async () => {
    // Logic to revert changes for the specified document
    console.log(`Reverting changes for ${documentType} with ID: ${documentId}`);
    // Add your API call or logic here
  };

  return (
    <button
      onClick={handleRevert}
      className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      Revert Changes
    </button>
  );
};

export default RevertButton;