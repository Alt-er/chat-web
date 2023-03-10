import { atom } from "recoil";


export const CurrentChatSessionAtom = atom({
    key: "currentChatSessionAtom",
    default: null
})


export type Message = {
    role: "user" | "assistant"
    content: string
}

export type Session = {
    id: number
    title: string
}




export const ChatSessionsAtom = atom<Session[]>({
    key: "ChatSessionsAtom",
    default: []
})

export const CurrentChatSessionRecordAtom = atom<Message[]>({
    key: "CurrentChatSessionRecordAtom",
    default: []
})

export const RecordCompletingAtom = atom<boolean>({
    key: "RecordCompletingAtom",
    default: false
})