export default function TypingIndicator() {
    return (
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce delay-100" />
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce delay-200" />
        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce delay-300" />
      </div>
    )
  }
  