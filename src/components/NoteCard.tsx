import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Indonesian locale
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface NoteCardProps {
    note: Note;
    isFacilitator: boolean;
}

export default function NoteCard({ note, isFacilitator }: NoteCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleHighlight = async () => {
        if (!isFacilitator || isUpdating) return;
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('notes')
                .update({ highlighted: !note.highlighted })
                .eq('id', note.id);

            if (error) console.error('Error updating note:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div
            className={cn(
                "p-4 rounded-lg shadow-sm border transition-all duration-200 bg-white relative group",
                note.highlighted
                    ? "border-yellow-400 ring-2 ring-yellow-100 bg-yellow-50/30"
                    : "border-gray-200 hover:border-gray-300"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {note.author_name}
                </span>
                {isFacilitator && (
                    <button
                        onClick={toggleHighlight}
                        disabled={isUpdating}
                        className={cn(
                            "p-1 rounded-full hover:bg-gray-100 transition-colors",
                            note.highlighted ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                        )}
                        title={note.highlighted ? "Hapus sorotan" : "Sorot catatan ini"}
                    >
                        <Star size={16} fill={note.highlighted ? "currentColor" : "none"} />
                    </button>
                )}
            </div>

            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                {note.content}
            </p>

            <div className="mt-3 text-[10px] text-gray-400 text-right">
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: id })}
            </div>
        </div>
    );
}
