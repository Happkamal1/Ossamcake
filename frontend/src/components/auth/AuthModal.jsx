import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { 
  registerUser, 
  verifyEmail, 
  resendOtp, 
  loginUser, 
  forgotPassword, 
  verifyResetOtp, 
  resetPassword,
  setTempEmail,
  clearError,
  closeAuthModal,
  setAuthScreen
} from '../../features/auth/authSlice';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export const AuthModal = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, tempEmail, isAuthModalOpen, currentAuthScreen } = useSelector((state) => state.auth);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  // Countdown timer state for Resend OTP
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  // Start countdown function
  const startTimer = (seconds = 45) => {
    setTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format timer helper (returns "MM:SS" or "00:SS")
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Clear inputs and error when screen switches
  useEffect(() => {
    dispatch(clearError());
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: '',
      otp: ''
    }));

    // Start timer if entering verifyEmail or verifyResetOtp
    if (currentAuthScreen === 'verifyEmail') {
      startTimer(45);
    } else {
      setTimer(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [currentAuthScreen, dispatch]);

  // Handle successful login
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      toast.success('Login successful!');
      dispatch(closeAuthModal());
    }
  }, [isAuthenticated, isAuthModalOpen, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    
    const res = await dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success("Your account has been created successfully. We've sent a verification code to your email.");
      dispatch(setTempEmail(formData.email));
      dispatch(setAuthScreen('verifyEmail'));
    } else {
      toast.error(res.payload || 'Registration failed');
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    const emailToVerify = tempEmail || formData.email;
    
    if (!emailToVerify) {
      return toast.error("Email is required for verification");
    }

    const res = await dispatch(verifyEmail({
      email: emailToVerify,
      otp: formData.otp
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Email verified successfully.');
      // Auto-prefill the email field and return to login
      setFormData(prev => ({ ...prev, email: emailToVerify }));
      dispatch(setAuthScreen('login'));
    } else {
      toast.error(res.payload || 'Invalid verification code.');
    }
  };

  const handleResendOtp = async () => {
    const emailToVerify = tempEmail || formData.email;
    if (!emailToVerify) return toast.error("Email is required");

    const res = await dispatch(resendOtp({ email: emailToVerify }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('A new verification code has been sent.');
      startTimer(45);
    } else {
      toast.error(res.payload || 'Failed to resend OTP');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
    
    if (res.meta.requestStatus === 'rejected') {
      const errorMsg = res.payload?.message || '';
      const isUnverified = res.payload?.status === 403 || errorMsg.includes('verify') || errorMsg.includes('verified');
      
      if (isUnverified) {
        toast.info("Your email is not verified. A new verification code has been sent.");
        dispatch(setTempEmail(formData.email));
        // Auto trigger resend OTP on backend
        await dispatch(resendOtp({ email: formData.email }));
        dispatch(setAuthScreen('verifyEmail'));
      } else {
        toast.error(errorMsg || 'Invalid email or password.');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const res = await dispatch(forgotPassword({ email: formData.email }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Password reset OTP sent to your email.');
      dispatch(setTempEmail(formData.email));
      dispatch(setAuthScreen('verifyResetOtp'));
    } else {
      toast.error(res.payload || 'Failed to send OTP.');
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    const emailToVerify = tempEmail || formData.email;
    const res = await dispatch(verifyResetOtp({ email: emailToVerify, otp: formData.otp }));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('OTP verified. You can now reset your password.');
      dispatch(setAuthScreen('resetPassword'));
    } else {
      toast.error(res.payload || 'Invalid reset OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    const emailToVerify = tempEmail || formData.email;
    
    const res = await dispatch(resetPassword({
      email: emailToVerify,
      otp: formData.otp,
      password: formData.password
    }));

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Password updated successfully. Please login.');
      setFormData(prev => ({ ...prev, email: emailToVerify }));
      dispatch(setAuthScreen('login'));
    } else {
      toast.error(res.payload || 'Failed to reset password.');
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && dispatch(closeAuthModal())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {currentAuthScreen === 'login' && 'Welcome Back'}
            {currentAuthScreen === 'register' && 'Create Account'}
            {currentAuthScreen === 'verifyEmail' && 'Verify Your Email'}
            {currentAuthScreen === 'forgotPassword' && 'Forgot Password'}
            {currentAuthScreen === 'verifyResetOtp' && 'Verify Reset OTP'}
            {currentAuthScreen === 'resetPassword' && 'Set New Password'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* LOGIN SCREEN */}
          {currentAuthScreen === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <button type="button" onClick={() => dispatch(setAuthScreen('forgotPassword'))} className="text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <p className="text-center text-sm mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={() => dispatch(setAuthScreen('register'))} className="text-primary hover:underline font-medium">
                  Create Account
                </button>
              </p>
            </form>
          )}

          {/* REGISTER SCREEN */}
          {currentAuthScreen === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm mt-4">
                Already have an account?{' '}
                <button type="button" onClick={() => dispatch(setAuthScreen('login'))} className="text-primary hover:underline font-medium">
                  Login
                </button>
              </p>
            </form>
          )}

          {/* VERIFY EMAIL OTP SCREEN */}
          {currentAuthScreen === 'verifyEmail' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="text-sm text-center mb-4 space-y-1">
                <p className="text-muted-foreground text-xs uppercase font-semibold">OTP sent to</p>
                <p className="font-semibold text-primary">{tempEmail || formData.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input id="otp" name="otp" type="text" maxLength={6} required value={formData.otp} onChange={handleChange} className="text-center tracking-widest text-lg" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
              <div className="flex justify-between items-center text-sm mt-4">
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={timer > 0 || loading} 
                  className={`font-semibold hover:underline ${timer > 0 ? 'text-muted-foreground cursor-not-allowed' : 'text-primary'}`}
                >
                  {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : 'Resend OTP'}
                </button>
                <button type="button" onClick={() => dispatch(setAuthScreen('login'))} className="text-muted-foreground hover:underline">
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD SCREEN */}
          {currentAuthScreen === 'forgotPassword' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Enter your email address to receive a password reset OTP.
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
              <p className="text-center text-sm mt-4">
                <button type="button" onClick={() => dispatch(setAuthScreen('login'))} className="text-primary hover:underline font-medium">
                  Back to Login
                </button>
              </p>
            </form>
          )}

          {/* VERIFY RESET OTP SCREEN */}
          {currentAuthScreen === 'verifyResetOtp' && (
            <form onSubmit={handleVerifyResetOtp} className="space-y-4">
              <div className="text-sm text-center mb-4 space-y-1">
                <p className="text-muted-foreground text-xs uppercase font-semibold">OTP sent to</p>
                <p className="font-semibold text-primary">{tempEmail || formData.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit OTP</Label>
                <Input id="otp" name="otp" type="text" maxLength={6} required value={formData.otp} onChange={handleChange} className="text-center tracking-widest text-lg" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <p className="text-center text-sm mt-4">
                <button type="button" onClick={() => dispatch(setAuthScreen('forgotPassword'))} className="text-muted-foreground hover:underline">
                  Back
                </button>
              </p>
            </form>
          )}

          {/* RESET PASSWORD SCREEN */}
          {currentAuthScreen === 'resetPassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Reset Password'}
              </Button>
            </form>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};
