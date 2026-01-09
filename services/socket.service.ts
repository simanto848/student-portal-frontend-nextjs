import { io, Socket } from "socket.io-client";

type SocketConnectionType = "chat" | "notification";

interface ConnectionConfig {
  url: string;
  authToken?: string;
}

class SocketService {
  private sockets: Map<SocketConnectionType, Socket> = new Map();
  private static instance: SocketService;

  private constructor() { }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Connect to a socket server
   * @param type - The type of socket connection (chat or notification)
   * @param config - Connection configuration including URL and optional auth token
   */
  public connect(
    type: SocketConnectionType = "chat",
    config?: Partial<ConnectionConfig>,
  ): Socket {
    const existingSocket = this.sockets.get(type);
    if (existingSocket?.connected) {
      return existingSocket;
    }

    const defaultUrls: Record<SocketConnectionType, string> = {
      chat: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:8004",
      notification:
        process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL ||
        "http://localhost:8007",
    };

    const url = config?.url || defaultUrls[type];
    const authToken = config?.authToken || this.getAuthTokenFromStorage();

    const socket = io(url, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: authToken ? { token: authToken } : undefined,
      query: authToken ? { token: authToken } : undefined,
    });

    socket.on("connect", () => { });

    socket.on("disconnect", (reason) => { });

    socket.on("connect_error", (error) => { });

    socket.on("reconnect", (attemptNumber) => { });

    this.sockets.set(type, socket);
    return socket;
  }

  private getAuthTokenFromStorage(): string | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("accessToken");
    if (token) return token;

    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "accessToken" || name === "token") {
        return value;
      }
    }

    return null;
  }

  /**
   * Get a socket by type
   */
  public getSocket(type: SocketConnectionType = "chat"): Socket | null {
    return this.sockets.get(type) || null;
  }

  /**
   * Disconnect a specific socket
   */
  public disconnect(type: SocketConnectionType): void {
    const socket = this.sockets.get(type);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(type);
    }
  }

  /**
   * Disconnect all sockets
   */
  public disconnectAll(): void {
    this.sockets.forEach((socket, type) => {
      socket.disconnect();
    });
    this.sockets.clear();
  }

  /**
   * Update auth token for a connection (reconnect with new token)
   */
  public updateAuthToken(
    type: SocketConnectionType,
    token: string,
  ): Socket | null {
    this.disconnect(type);
    return this.connect(type, { authToken: token });
  }

  /**
   * Check if a socket is connected
   */
  public isConnected(type: SocketConnectionType): boolean {
    const socket = this.sockets.get(type);
    return socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
