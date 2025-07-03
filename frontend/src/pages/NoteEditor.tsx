import React from 'react';
import { useParams } from 'react-router-dom';

const NoteEditor: React.FC = () => {
  const { roomId, noteId } = useParams<{ roomId: string; noteId: string }>();

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold mb-4">
        Editing Note: {noteId} in Room: {roomId}
      </h2>
      <textarea
        className="w-full h-96 border p-4 rounded"
        placeholder="Write your markdown note here..."
      ></textarea>
    </div>
  );
};

export default NoteEditor;
