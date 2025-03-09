import Cookies from "js-cookie"; 
import { useParams } from "react-router-dom";
import { ChatLayout } from "@/components/chat/chat-layout";

function ChatScene() {
  const { id } = useParams(); //Get room ID from URL
  const layoutCookie = Cookies.get("react-resizable-panels:layout"); //Read from cookies
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : [25, 50, 25]; // Fallback layout
  // console.log("Chat ID from URL:", id); 
  


  if (!id) {
    return <div className="h-screen flex justify-center items-center">Room not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full  h-[calc(100vh-4rem)]">
      {/* Main container */}
      <div className="border-2 border-zinc-300 dark:border-gray-400  rounded-lg max-w-7xl w-full h-4/5 text-sm flex shadow-md bg-white dark:bg-zinc-900">
        <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
      </div>
    </div>  );
}

export default ChatScene;
