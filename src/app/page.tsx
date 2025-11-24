'use client';

import SessionList from '@/components/SessionList';

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        MindPool
                    </h1>
                    <p className="text-lg text-gray-600">
                        Platform kolaborasi real-time untuk meeting.
                    </p>
                </div>

                <SessionList />
            </div>
        </main>
    );
}
