import { Session } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Plus, ArrowRight, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SessionList() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [newSessionDesc, setNewSessionDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching sessions:', error);
        else setSessions(data || []);
        setIsLoading(false);
    };

    const createSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSessionTitle.trim()) return;

        setIsCreating(true);
        try {
            // 1. Create Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .insert({
                    title: newSessionTitle.trim(),
                    description: newSessionDesc.trim() || null,
                })
                .select()
                .single();

            if (sessionError || !sessionData) throw sessionError;

            // 2. Create Default Boards
            const defaultBoards = [
                'Gojek',
                'Siklus',
                'SWAP Energi',
                'Better Place',
                'My Startup'
            ];

            const boardsToInsert = defaultBoards.map(name => ({
                session_id: sessionData.id,
                name
            }));

            const { error: boardsError } = await supabase
                .from('boards')
                .insert(boardsToInsert);

            if (boardsError) throw boardsError;

            // Refresh list
            await fetchSessions();
            setNewSessionTitle('');
            setNewSessionDesc('');
        } catch (error) {
            console.error('Error creating session:', JSON.stringify(error, null, 2));
            alert(`Gagal membuat sesi: ${(error as any)?.message || 'Unknown error'}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Create Session Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="text-blue-600" size={20} />
                    Buat Sesi Baru
                </h2>
                <form onSubmit={createSession} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Sesi</label>
                        <input
                            type="text"
                            value={newSessionTitle}
                            onChange={(e) => setNewSessionTitle(e.target.value)}
                            placeholder="Contoh: Workshop Minggu 3"
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                        <input
                            type="text"
                            value={newSessionDesc}
                            onChange={(e) => setNewSessionDesc(e.target.value)}
                            placeholder="Deskripsi singkat..."
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !newSessionTitle.trim()}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? 'Membuat...' : 'Buat Sesi'}
                    </button>
                </form>
            </div>

            {/* Session List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Daftar Sesi</h2>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Memuat sesi...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        Belum ada sesi yang dibuat.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Link
                                key={session.id}
                                href={`/session/${session.id}`}
                                className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {session.title}
                                        </h3>
                                        {session.description && (
                                            <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                            <Calendar size={12} />
                                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true, locale: id })}
                                        </div>
                                    </div>
                                    <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
