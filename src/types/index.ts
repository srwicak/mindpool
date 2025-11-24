export type ColumnType = 'CX' | 'GTM' | 'SPRINT';

export interface Note {
    id: string;
    board_id: string;
    column_type: ColumnType;
    author_name: string;
    content: string;
    highlighted: boolean;
    created_at: string;
}

export interface Board {
    id: string;
    session_id: string;
    name: string;
    created_at: string;
}

export interface Session {
    id: string;
    title: string;
    description: string | null;
    created_at: string;
}
