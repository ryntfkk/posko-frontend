export interface ChatUser {
    _id: string;
    fullName: string;
    profilePictureUrl: string;
}

export interface Attachment {
    url: string;
    type: 'image' | 'video' | 'document';
    originalName?: string;
}

export interface Message {
    _id: string;
    content: string;
    attachment?: Attachment;
    sender: string | { _id: string, fullName: string };
    sentAt: string;
}

export interface ChatRoom {
    _id: string;
    participants: ChatUser[];
    messages: Message[];
    updatedAt: string;
}
