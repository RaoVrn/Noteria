import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleRichTextEditor from '../components/SimpleRichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';

const NoteEditor: React.FC = () => {
  const { roomId, noteId } = useParams<{ roomId: string; noteId: string }>();
  const navigate = useNavigate();
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load note content here
    // For now, using placeholder content
    setNoteTitle(`Note ${noteId}`);
    setNoteContent('<p>Start writing your note here...</p>');
  }, [noteId]);

  const handleSave = async (content: string) => {
    setIsSaving(true);
    try {
      // Save note content to backend
      console.log('Saving note:', { roomId, noteId, content });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNoteContent(content);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Room</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{noteTitle}</h1>
              <p className="text-sm text-gray-500">Room: {roomId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Saving...
              </span>
            )}
            <button
              onClick={() => handleSave(noteContent)}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto py-6 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <SimpleRichTextEditor
            content={noteContent}
            onChange={setNoteContent}
            onSave={handleSave}
            placeholder="Start writing your note here... Use # for headings, * for lists, and explore the toolbar for more features!"
            className="min-h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
