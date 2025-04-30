import io from "socket.io-client";
class ChatService {
  constructor() {
    this.socket = null;
    this.baseUrl = "https://skillswapserver.onrender.com/api";
  }
  connect() {
    this.socket = io("https://skillswapserver.onrender.com");
    this.socket.on("connect", () => {});
    return this.socket;
  }
  joinChat(chatId) {
    if (!this.socket) this.connect();
    this.socket.emit("join-chat", chatId);
  }
  listenForMessages(callback) {
    if (!this.socket) this.connect();
    this.socket.on("receive-message", (message) => {
      callback(message);
    });
  }
  sendMessage(chatId, message) {
    if (!this.socket) this.connect();
    this.socket.emit("send-message", { chatId, message });
  }
}
export default new ChatService();
