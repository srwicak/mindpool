import { Note, ColumnType } from '@/types';
import NoteCard from './NoteCard';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send } from 'lucide-react';

interface ColumnProps {
    title: string;
    type: ColumnType;
    boardId: string;
    notes: Note[];
    isFacilitator: boolean;
    authorName: string;
}

export default function Column({ title, type, boardId, notes, isFacilitator, authorName }: ColumnProps) {
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim() || !authorName) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('notes').insert({
                board_id: boardId,
                column_type: type,
                content: newNoteContent.trim(),
                author_name: authorName,
            });

            if (error) {
                console.error('Error adding note:', error);
                alert('Gagal menambahkan catatan. Silakan coba lagi.');
            } else {
                setNewNoteContent('');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-semibold text-gray-700 text-center">{title}</h3>
                <div className="text-xs text-center text-gray-400 mt-1 font-medium">
                    {notes.length} Catatan
                </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                {notes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm italic">
                        <p>Belum ada catatan</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            isFacilitator={isFacilitator}
                        />
                    ))
                )}
            </div>

            {/* Add Note Form */}
            <div className="p-3 border-t border-gray-200 bg-white">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Tulis catatan..."
                        className="w-full p-3 pr-10 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 bg-gray-50 focus:bg-white transition-colors"
                        maxLength={300}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newNoteContent.trim()}
                        className="absolute bottom-3 right-3 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Tambah Catatan"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
