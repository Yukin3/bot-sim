import { io } from "../server";

export const emitNewMessage = (message) => {
  io.to(`room-${message.roomId}`).emit("receive_message", message);
};

export const emitBotMessage = (roomId, message) => {
  io.to(`room-${roomId}`).emit("receive_message", message);
};

export const emitBotTypingEvent = (roomId, bot, isTyping) => {
  io.to(`room-${roomId}`).emit(isTyping ? "bot_typing" : "bot_stopped_typing", {
    botId: bot.id,
    avatar: bot.avatar,
  });
};
