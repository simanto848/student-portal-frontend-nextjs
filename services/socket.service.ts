import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(url: string = "http://localhost:8012"): Socket {
    if (!this.socket) {
      this.socket = io(url, {
        transports: ["websocket"],
        reconnection: true,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();
