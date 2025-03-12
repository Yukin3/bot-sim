const conversationContexts = new Map();
const MAX_CONTEXT_MESSAGES = 5;

export const getContext = (roomId) => {
  if (!conversationContexts.has(roomId)) {
    conversationContexts.set(roomId, []);
  }
  return conversationContexts.get(roomId);
};

export const updateContext = (roomId, senderType, message, botId = null) => {
  const context = getContext(roomId);
  context.push({ senderType, message, botId });

  if (context.length > MAX_CONTEXT_MESSAGES) {
    context.shift();
  }
};
