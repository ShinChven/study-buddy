import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5140';

class ApiService {
    private connection: signalR.HubConnection | null = null;
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (this.connection) {
            this.stopConnection();
        }
    }

    async startConnection() {
        if (this.connection) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/chat`, {
                accessTokenFactory: () => this.token || ""
            })
            .withAutomaticReconnect()
            .build();

        await this.connection.start();
    }

    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    async sendMessage(
        conversationId: string, 
        content: string, 
        onChunk: (chunk: string) => void, 
        onThinking: (thinking: string) => void,
        onFinished: (messageId: string) => void, 
        onError: (error: string) => void
    ) {
        try {
            await this.startConnection();
            
            this.connection?.on("ReceiveChunk", onChunk);
            this.connection?.on("ReceiveThinking", onThinking);
            this.connection?.on("Finished", (id) => {
                this.off();
                onFinished(id);
            });
            this.connection?.on("Error", (err) => {
                this.off();
                onError(err);
            });

            await this.connection?.invoke("SendMessage", conversationId, content);
        } catch (err: any) {
            onError(err.message);
        }
    }

    private off() {
        this.connection?.off("ReceiveChunk");
        this.connection?.off("ReceiveThinking");
        this.connection?.off("Finished");
        this.connection?.off("Error");
    }

    async login(email: string, password: string) {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    }

    async register(email: string, password: string, displayName: string) {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName })
        });
        if (!res.ok) throw new Error("Registration failed");
        return res.json();
    }

    async createConversation(title: string) {
        const res = await fetch(`${API_URL}/api/conversation`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify({ title })
        });
        if (!res.ok) throw new Error("Failed to create conversation");
        return res.json();
    }

    async getConversations() {
        const res = await fetch(`${API_URL}/api/conversation`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch conversations");
        return res.json();
    }

    async getThread(conversationId: string) {
        const res = await fetch(`${API_URL}/api/conversation/${conversationId}/thread`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch thread");
        return res.json();
    }

    async getFollowUp(assistantContent: string, onResult: (followUp: any) => void) {
        try {
            await this.startConnection();
            this.connection?.on("ReceiveFollowUp", (json) => {
                this.connection?.off("ReceiveFollowUp");
                onResult(JSON.parse(json));
            });
            await this.connection?.invoke("GetFollowUp", assistantContent);
        } catch (err) {
            console.error("Failed to get follow up", err);
        }
    }
}

export const apiService = new ApiService();
