"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-[350px] text-center">
        
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to continue
        </p>

        <Button
          className="w-full flex items-center justify-center gap-2"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <FcGoogle size={20} />
          Continue with Google
        </Button>

      </div>
    </div>
  );
}