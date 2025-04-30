import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import chatService from "../../client/client";
import { useLocation } from "react-router-dom";
import "./box.css";
import {
  addIncomingMessage,
  fetchMessages,
  startChat,
} from "../../store/chat-store/chat.store";

const Chat = () => {
  const [messageInput, setMessageInput] = useState("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const location = useLocation();

  const selectedUser = location.state?.selectedUser;
  const skillMatch = location.state?.skillMatch;

  const { chatId, messages, loading } = useSelector(
    (state) => state.chatReducer
  );

  const currentUserId = useSelector((state) => state.authReducer.user.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUser) {
      setIsLoadingLocal(true);
      const socket = chatService.connect();

      const initChat = async () => {
        try {
          const startChatResult = await dispatch(
            startChat({
              otherUserId: selectedUser.id,
            })
          ).unwrap();
          const chatId = startChatResult.id;

          chatService.joinChat(chatId);
          await dispatch(fetchMessages(chatId)).unwrap();
          setIsLoadingLocal(false);
        } catch (error) {
          console.error("Error initializing chat:", error);
          setIsLoadingLocal(false);
        }
      };

      initChat();

      chatService.listenForMessages((message) => {
        dispatch(addIncomingMessage(message));
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [selectedUser, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (messageInput.trim() === "" || !chatId) return;

    chatService.sendMessage(chatId, {
      content: messageInput,
      timestamp: new Date().toISOString(),
      sender: {
        id: currentUserId.id,
        name: currentUserId.name,
      },
    });

    setMessageInput("");
  };

  const normalizedMessages = messages.map((msg) => ({
    ...msg,
    sender: {
      id: msg.sender?.id?._id || msg.sender?.id || msg.sender || null,
      name: msg.sender?.name || null,
    },
  }));

  return (
    <div className="main">
    <div className="chat-container">
      <div className="chat-header">
        <h3>{selectedUser ? selectedUser.name : "Loading..."}</h3>
      </div>

      <div className="messages-container">
        {isLoadingLocal || loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length > 0 ? (
          normalizedMessages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender.id === currentUserId.id
                  ? "own-message"
                  : "other-message"
              }`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            No messages yet. Say hello to {selectedUser?.name}!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={
            selectedUser ? `Message ${selectedUser.name}...` : "Loading..."
          }
          disabled={!selectedUser || isLoadingLocal}
        />
        <button
          type="submit"
          disabled={
            !selectedUser || messageInput.trim() === "" || isLoadingLocal
          }
        >
          Send
        </button>
      </form>
    </div>
    </div>
  );
};

export default Chat;
