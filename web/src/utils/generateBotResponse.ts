export const generateBotResponse = (userMessage: string): string => {
    const responses = [
      "Hello! How can I assist you?",
      "That's interesting! Tell me more.",
      "I'm here to chat!",
      "Could you clarify that?",
      "Let's talk about something fun!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
};