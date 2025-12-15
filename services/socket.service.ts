import { io, Socket } from "socket.io-client";

type SocketConnectionType = "chat" | "notification";

interface ConnectionConfig {
  url: string;
  authToken?: string;
}

class SocketService {
  private sockets: Map<SocketConnectionType, Socket> = new Map();
  private static instance: SocketService;

  private constructor() {}

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
    // Return existing socket if already connected
    const existingSocket = this.sockets.get(type);
    if (existingSocket?.connected) {
      return existingSocket;
    }

    // Default URLs for different connection types
    const defaultUrls: Record<SocketConnectionType, string> = {
      chat: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:8012",
      notification:
        process.env.NEXT_PUBLIC_NOTIFICATION_SOCKET_URL ||
        "http://localhost:8010",
    };

    const url = config?.url || defaultUrls[type];
    const authToken = config?.authToken || this.getAuthTokenFromStorage();

    const socket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: authToken ? { token: authToken } : undefined,
      query: authToken ? { token: authToken } : undefined,
    });

    socket.on("connect", () => {
      console.log(`[${type}] Socket connected:`, socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[${type}] Socket disconnected:`, reason);
    });

    socket.on("connect_error", (error) => {
      console.error(`[${type}] Socket connection error:`, error.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(
        `[${type}] Socket reconnected after ${attemptNumber} attempts`,
      );
    });

    this.sockets.set(type, socket);
    return socket;
  }

  /**
   * Get the auth token from storage (localStorage or cookie)
   */
  private getAuthTokenFromStorage(): string | null {
    if (typeof window === "undefined") return null;

    // Try to get token from localStorage
    const token = localStorage.getItem("accessToken");
    if (token) return token;

    // Try to get from cookies
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
      console.log(`[${type}] Socket disconnected`);
    }
  }

  /**
   * Disconnect all sockets
   */
  public disconnectAll(): void {
    this.sockets.forEach((socket, type) => {
      socket.disconnect();
      console.log(`[${type}] Socket disconnected`);
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
