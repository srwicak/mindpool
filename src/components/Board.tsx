import { Board as BoardType, Note } from '@/types';
import { useEffect, useState } from 'react';
import Column from './Column';
import { supabase } from '@/lib/supabaseClient';

interface BoardProps {
    board: BoardType;
    isFacilitator: boolean;
    authorName: string;
}

export default function Board({ board, isFacilitator, authorName }: BoardProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        const fetchNotes = async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('board_id', board.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notes:', error);
            } else {
                setNotes(data || []);
            }
            setIsLoading(false);
        };

        fetchNotes();

        // Realtime subscription
        const channel = supabase
            .channel(`board-${board.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notes',
                    filter: `board_id=eq.${board.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotes((prev) => [payload.new as Note, ...prev]);
                    } else if (payload.eventType === 'DELETE') {
                        setNotes((prev) => prev.filter((n) => n.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setNotes((prev) =>
                            prev.map((n) => (n.id === payload.new.id ? (payload.new as Note) : n))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [board.id]);

    const cxNotes = notes.filter((n) => n.column_type === 'CX');
    const gtmNotes = notes.filter((n) => n.column_type === 'GTM');
    const sprintNotes = notes.filter((n) => n.column_type === 'SPRINT');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[calc(100vh-200px)]">
            <Column
                title="Customer Experience (Value Prop)"
                type="CX"
                boardId={board.id}
                notes={cxNotes}
                isFacilitator={isFacilitator}
                authorName={authorName}
            />
            <Column
                title="GTM & Early Adopters"
                type="GTM"
                boardId={board.id}
                notes={gtmNotes}
                isFacilitator={isFacilitator}
                authorName={authorName}
            />
            <Column
                title="Sprint / MVP Experiment"
                type="SPRINT"
                boardId={board.id}
                notes={sprintNotes}
                isFacilitator={isFacilitator}
                authorName={authorName}
            />
        </div>
    );
}
