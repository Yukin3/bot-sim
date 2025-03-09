import { useEffect, useState } from "react";
import { LoginForm } from "@/components/login-form";
import { useLocation } from "react-router-dom";

function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const location = useLocation(); 

  useEffect(() => {
    setIsSignUp(location.pathname === "/signup"); //Detect signup route
  }, [location.pathname]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <LoginForm isSignUp={isSignUp} setIsSignUp={setIsSignUp}/>
      </div>
    </div>
  );
}

export default Auth;
