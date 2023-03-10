import type { Message, Session } from "@/recoil/chat";

export async function completionApi(sessionId: number, prompt: string): Promise<ReadableStreamDefaultReader> {
    return (
        await fetch("/cosy/completion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId,
                prompt
            }),
        })
    ).body.getReader()
}


export async function getChatSessionsApi(): Promise<Result<Session[]>> {
    return (
        await fetch("/cosy/getChatSessions", {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
        })
    ).json();
}


export async function getChatRecordsApi(id: number): Promise<Result<Message[]>> {
    return (
        await fetch("/cosy/getChatRecords?sessionId=" + id, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
        })
    ).json();
}


export async function loginApi(userId?: number): Promise<Result<number>> {
    return (
        await fetch("/cosy/loginChat", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId
            }),
        })
    ).json();
}

