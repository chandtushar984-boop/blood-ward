import { io } from "socket.io-client";

let socket = null;

export const socketService = {
  connect() {
    if (socket && socket.connected) return socket;
    if (socket && socket.active) return socket;
    if (socket) {
      // Re-use existing socket instance to preserve registered listeners
      socket.connect();
      return socket;
    }

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "") ||
      window.location.origin;

    socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      window.dispatchEvent(new CustomEvent("bloodward:socket-connected"));
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection error:", err.message);
    });

    if (socket.io) {
      socket.io.on("reconnect", (attempt) => {
        window.dispatchEvent(
          new CustomEvent("bloodward:reconnect", { detail: { attempt } })
        );
      });
    }

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
    }
  },

  getSocket() {
    return socket;
  },

  on(event, callback) {
    if (!socket || !socket.connected) this.connect();
    if (socket) {
      socket.off(event, callback);
      socket.on(event, callback);
    }
  },

  off(event, callback) {
    if (socket) {
      socket.off(event, callback);
    }
  },

  onReconnect(callback) {
    if (!socket) this.connect();
    if (socket && socket.io) {
      socket.io.on("reconnect", callback);
    }
  },

  offReconnect(callback) {
    if (socket && socket.io) {
      socket.io.off("reconnect", callback);
    }
  },
};

// Lifecycle management for Back-Forward Cache (BFCache)
if (typeof window !== "undefined") {
  // Gracefully close WebSocket transport when page enters BFCache or unloads
  window.addEventListener("pagehide", (_event) => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });

  // Re-establish connection cleanly when page is restored from BFCache
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && socket) {
      socket.connect();
      window.dispatchEvent(
        new CustomEvent("bloodward:reconnect", { detail: { bfcache: true } })
      );
    }
  });
}

export default socketService;
