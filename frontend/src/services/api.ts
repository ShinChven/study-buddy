import * as signalR from "@microsoft/signalr";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5293'; // Update with your actual backend port

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

    async syncConversations(sessions: any[]) {
        const payload = sessions.map(s => ({
            id: s.id,
            title: s.title,
            createdAt: s.lastUpdated, // Map roughly
            lastUpdated: s.lastUpdated,
            messages: s.messages.map((m: any) => ({
                id: m.id,
                role: m.role === 'user' ? 0 : 1, // MessageRole enum index
                content: m.content,
                createdAt: m.timestamp,
                parentMessageId: null // Local storage doesn't track this strictly
            }))
        }));

        const res = await fetch(`${API_URL}/api/conversation/sync`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Sync failed");
    }
}

export const apiService = new ApiService();
