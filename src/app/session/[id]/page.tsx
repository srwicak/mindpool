'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session, Board as BoardType } from '@/types';
import Board from '@/components/Board';
import { cn } from '@/lib/utils';
import { User, Briefcase, ChevronLeft, Settings } from 'lucide-react';

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id: sessionId } = use(params);

    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [boards, setBoards] = useState<BoardType[]>([]);
    const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // User Identity State
    const [displayName, setDisplayName] = useState('');
    const [userType, setUserType] = useState<'Student-Track' | 'Early-stage'>('Student-Track');
    const [isIdentitySet, setIsIdentitySet] = useState(false);
    const [isFacilitator, setIsFacilitator] = useState(false);
    const [showIdentityModal, setShowIdentityModal] = useState(false);

    useEffect(() => {
        // Load identity from localStorage
        const savedName = localStorage.getItem('workshop_user_name');
        const savedType = localStorage.getItem('workshop_user_type');

        if (savedName) {
            setDisplayName(savedName);
            setIsIdentitySet(true);
        } else {
            setShowIdentityModal(true);
        }

        if (savedType) {
            setUserType(savedType as 'Student-Track' | 'Early-stage');
        }

        fetchSessionData();
    }, [sessionId]);

    const fetchSessionData = async () => {
        try {
            // Fetch Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;
            setSession(sessionData);

            // Fetch Boards
            const { data: boardsData, error: boardsError } = await supabase
                .from('boards')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true }); // Order by creation to keep consistent

            if (boardsError) throw boardsError;

            setBoards(boardsData || []);

            // Set default active board (Gojek usually first)
            if (boardsData && boardsData.length > 0) {
                // Try to find "Gojek" first, otherwise first one
                const defaultBoard = boardsData.find(b => b.name === 'Gojek') || boardsData[0];
                setActiveBoardId(defaultBoard.id);
            }
        } catch (error) {
            console.error('Error loading session:', error);
            // Handle 404 or error
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveIdentity = (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        localStorage.setItem('workshop_user_name', displayName);
        localStorage.setItem('workshop_user_type', userType);
        setIsIdentitySet(true);
        setShowIdentityModal(false);
    };

    const toggleFacilitator = () => {
        setIsFacilitator(!isFacilitator);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Memuat...</div>;
    }

    if (!session) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Sesi tidak ditemukan.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Identity Modal */}
            {showIdentityModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Selamat Datang!</h2>
                        <p className="text-gray-600 mb-6">Silakan masukkan nama Anda untuk mulai berkolaborasi.</p>

                        <form onSubmit={handleSaveIdentity} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tampilan</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nama Anda"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahap Startup</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setUserType('Student-Track')}
                                        className={cn(
                                            "p-3 rounded-lg border text-sm font-medium transition-all",
                                            userType === 'Student-Track'
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                        )}
                                    >
                                        Student Track
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('Early-stage')}
                                        className={cn(
                                            "p-3 rounded-lg border text-sm font-medium transition-all",
                                            userType === 'Early-stage'
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                        )}
                                    >
                                        Early Stage
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 mt-2"
                            >
                                Masuk ke Sesi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        title="Kembali ke Beranda"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-800 text-lg leading-tight">{session.title}</h1>
                        {session.description && <p className="text-xs text-gray-500 hidden sm:block">{session.description}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    {/* User Info */}
                    <button
                        onClick={() => setShowIdentityModal(true)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
                    >
                        <User size={16} />
                        <span className="font-medium max-w-[100px] truncate">{displayName || 'Tamu'}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-500">{userType}</span>
                    </button>

                    {/* Facilitator Toggle */}
                    <button
                        onClick={toggleFacilitator}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isFacilitator ? "bg-yellow-100 text-yellow-600" : "text-gray-400 hover:bg-gray-100"
                        )}
                        title="Mode Fasilitator"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            {/* Board Navigation */}
            <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
                <div className="flex space-x-1 min-w-max py-2">
                    {boards.map((board) => (
                        <button
                            key={board.id}
                            onClick={() => setActiveBoardId(board.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeBoardId === board.id
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {board.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 overflow-hidden">
                {activeBoardId && (
                    <Board
                        key={activeBoardId} // Force re-render when switching boards
                        board={boards.find(b => b.id === activeBoardId)!}
                        isFacilitator={isFacilitator}
                        authorName={displayName}
                    />
                )}
            </main>
        </div>
    );
}
