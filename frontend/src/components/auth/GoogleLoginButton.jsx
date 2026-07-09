import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '@/features/auth/authSlice';
import { toast } from 'sonner';

export const GoogleLoginButton = () => {
  const dispatch = useDispatch();
  const btnRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      if (window.google) {
        initGoogle();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    };

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCallback,
      });

      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: "375", // match max-w dialog width
        text: "continue_with",
        shape: "rectangular"
      });
    };

    const handleCallback = async (response) => {
      const idToken = response.credential;
      const res = await dispatch(loginWithGoogle(idToken));
      if (res.meta.requestStatus === 'fulfilled') {
        toast.success("Google login successful!");
      } else {
        toast.error(res.payload || "Google login failed");
      }
    };

    loadScript();
  }, [dispatch]);

  return (
    <div className="w-full flex justify-center">
      <div ref={btnRef} className="w-full max-w-[375px]" />
    </div>
  );
};
