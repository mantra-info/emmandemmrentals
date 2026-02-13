// ... imports
import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Mail, Smartphone, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import CountrySelect, { Country, countries } from './CountrySelect';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewState = 'PHONE' | 'EMAIL' | 'OTP' | 'COMPLETE_PROFILE';

const MotionError = ({ message }: { message: string }) => (
    <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 mb-4"
    >
        <AlertCircle size={18} className="shrink-0" />
        <p className="text-sm font-medium leading-tight">{message}</p>
    </motion.div>
);

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const router = useRouter();
    const [view, setView] = useState<ViewState>('PHONE');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    // Profile Completion State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [profileEmail, setProfileEmail] = useState(''); // Only if phone login

    // Error state
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setView('PHONE');
            setPhoneNumber('');
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setError('');
            setIsLoading(false);
            setIsShaking(false);
            setFirstName('');
            setLastName('');
            setTermsAccepted(false);
            setProfileEmail('');
        }
    }, [isOpen]);

    const getIdentifier = () => {
        return view === 'PHONE' || (view === 'OTP' && phoneNumber) || view === 'COMPLETE_PROFILE' && phoneNumber
            ? `${selectedCountry.dialCode}${phoneNumber}`
            : email;
    };

    const getType = () => {
        return view === 'PHONE' || (view === 'OTP' && phoneNumber) || view === 'COMPLETE_PROFILE' && phoneNumber
            ? 'PHONE'
            : 'EMAIL';
    }

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const identifier = getIdentifier();
            const type = getType();

            // Country-wise validation
            if (type === 'PHONE') {
                if (phoneNumber.length !== selectedCountry.phoneLength) {
                    triggerShake();
                    throw new Error(`Please enter a valid ${selectedCountry.phoneLength}-digit phone number for ${selectedCountry.name}`);
                }
            } else if (type === 'EMAIL') {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    triggerShake();
                    throw new Error('Please enter a valid email address');
                }
            }

            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, type }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            setView('OTP');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const otpValue = otp.join('');
        const identifier = getIdentifier();

        try {
            // 1. Verify OTP and Check User Existence
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp: otpValue }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            if (data.exists) {
                // User exists -> Login directly
                await loginUser(identifier, otpValue);
            } else {
                // User new -> Go to profile completion
                setView('COMPLETE_PROFILE');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const identifier = getIdentifier();
        const otpValue = otp.join('');
        const fullName = `${firstName} ${lastName}`.trim();

        try {
            const res = await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier,
                    otp: otpValue,
                    name: fullName,
                    email: profileEmail, // Optional, only if phone login
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create profile');
            }

            // User created -> Login
            await loginUser(identifier, otpValue);

        } catch (err: any) {
            triggerShake();
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const loginUser = async (identifier: string, otpValue: string) => {
        const result = await signIn('otp', {
            identifier,
            otp: otpValue,
            redirect: false,
        });

        if (result?.error) {
            throw new Error(result.error);
        }

        onClose();
        router.refresh();
    }

    const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
        signIn(provider);
    };

    const renderPhoneView = () => (
        <form onSubmit={handleSendOtp} className="space-y-4">
            <AnimatePresence mode="wait">
                {error && <MotionError message={error} key="phone-error" />}
            </AnimatePresence>

            <motion.div
                animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex gap-2 bg-gray-50 rounded-lg p-1 border border-transparent focus-within:border-black/10 transition-colors"
            >
                <CountrySelect
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                />
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Mob No."
                    className="bg-transparent w-full outline-none text-gray-900 px-2 text-sm placeholder:text-gray-400"
                    pattern="[0-9]*"
                    required
                />
            </motion.div>

            <button
                type="submit"
                disabled={isLoading || phoneNumber.length < 5}
                className="w-full bg-[#f44786] hover:bg-[#d63a73] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm active:scale-[0.99] flex justify-center items-center"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Continue'
                )}
            </button>
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-400 font-medium">or login with</span>
                </div>
            </div>

            <div className="flex justify-center gap-6">
                <SocialButton
                    onClick={() => handleSocialLogin('google')}
                    bg="bg-white"
                    border
                    content={
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                    }
                />
                <SocialButton
                    onClick={() => handleSocialLogin('facebook')}
                    bg="bg-[#1877F2]"
                    content={
                        <svg fill="white" width="24" height="24" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    }
                />
                <SocialButton
                    onClick={() => handleSocialLogin('apple')}
                    bg="bg-white"
                    content={
                        <svg width="24" height="24" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.5262 0C21.8472 2.19 20.9592 4.335 19.7862 5.85C18.5337 7.47 16.3812 8.73 14.2962 8.67C13.9152 6.57 14.8932 4.425 16.0812 2.97C17.3847 1.365 19.6212 0.15 21.5262 0.015V0ZM22.2762 9C24.6612 9 27.1812 10.311 28.9812 12.57C23.0862 15.825 24.0462 24.33 30.0012 26.61C29.3817 28.104 28.6227 29.535 27.7362 30.885C26.2632 33.15 24.1812 35.97 21.6162 36C20.5572 36.0105 19.8612 35.6895 19.1112 35.343C18.2427 34.9425 17.2962 34.5075 15.6312 34.5165C13.9812 34.524 13.0212 34.9545 12.1362 35.3505C11.3682 35.6955 10.6602 36.015 9.6012 36.0045C7.0212 35.982 5.0562 33.4395 3.5862 31.1745C-0.538801 24.8445 -0.958801 17.4045 1.5762 13.4745C3.3762 10.6695 6.2262 9.0195 8.9112 9.0195C10.3392 9.0195 11.4912 9.4335 12.5862 9.828C13.5822 10.1865 14.5362 10.5285 15.6012 10.5285C16.5942 10.5285 17.4162 10.2165 18.3012 9.876C19.3722 9.4665 20.5512 9.0165 22.2762 9.0165V9Z" fill="black" />
                        </svg>

                    }
                />
            </div>

            <p className="text-center text-xs text-gray-500 mt-6 px-4 leading-relaxed">
                By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
            <div className="text-center">
                <button type="button" onClick={() => setView('EMAIL')} className="text-black underline text-sm font-medium hover:text-gray-700">
                    Continue with Email
                </button>
            </div>
        </form>
    );

    const renderEmailView = () => (
        <form onSubmit={handleSendOtp} className="space-y-4">
            <AnimatePresence mode="wait">
                {error && <MotionError message={error} key="email-error" />}
            </AnimatePresence>

            <motion.div
                animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="bg-gray-50 rounded-lg p-4 border border-transparent focus-within:border-black/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-400" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="bg-transparent w-full outline-none text-gray-900 text-sm placeholder:text-gray-400"
                        required
                    />
                </div>
            </motion.div>

            <button
                type="submit"
                disabled={isLoading || !email.includes('@')}
                className="w-full bg-[#f44786] hover:bg-[#d63a73] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm active:scale-[0.99] flex justify-center items-center"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Continue'
                )}
            </button>
            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-gray-400 font-medium">or login with</span>
                </div>
            </div>

            <div className="flex justify-center gap-6">
                <SocialButton
                    onClick={() => handleSocialLogin('google')}
                    bg="bg-white"
                    border
                    content={
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                    }
                />
                <SocialButton
                    onClick={() => handleSocialLogin('facebook')}
                    bg="bg-[#1877F2]"
                    content={
                        <svg fill="white" width="24" height="24" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    }
                />
                <SocialButton
                    onClick={() => handleSocialLogin('apple')}
                    bg="bg-black"
                    content={
                        <svg fill="white" width="20" height="20" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05 1.61-3.23 1.61-1.14 0-1.55-.67-2.83-.67-1.3 0-1.74.65-2.83.65-1.14 0-2.22-.72-3.22-1.63C3.04 18.36 1.5 15.11 1.5 12.01c0-3.15 2.12-4.8 4.14-4.8 1.08 0 1.9.68 2.64.68.73 0 1.74-.68 2.92-.68 1.14 0 2.1.53 2.76 1.39a3.78 3.78 0 0 0-2.1 3.46c0 2.44 2.12 3.31 2.13 3.32-.01.07-.34 1.15-1.15 2.21l.21.69zm-3.07-14.4c0-1.25.96-2.58 2.25-2.58.12 0 .25.01.37.03-.13 1.36-1.1 2.67-2.31 2.67-.14 0-.25-.01-.31-.02-.01-.03-.02-.06-.02-.1z" /></svg>
                    }
                />
            </div>

            <p className="text-center text-xs text-gray-500 mt-6 px-4 leading-relaxed">
                By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>

            <div className="text-center pt-2">
                <button type="button" onClick={() => setView('PHONE')} className="text-black underline text-sm font-medium hover:text-gray-700">
                    Use Mobile Number
                </button>
            </div>
        </form>
    );

    const renderOtpView = () => (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
            <AnimatePresence mode="wait">
                {error && <MotionError message={error} key="otp-error" />}
            </AnimatePresence>
            <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">
                    Enter the code sent to
                </p>
                <p className="font-medium text-gray-900">
                    {getType() === 'PHONE' ? `${selectedCountry.dialCode} ${phoneNumber}` : email}
                </p>
            </div>

            <motion.div
                animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex justify-center gap-2 sm:gap-3"
            >
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl text-black font-semibold border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50"
                    />
                ))}
            </motion.div>

            <button
                type="submit"
                disabled={isLoading || otp.some(d => !d)}
                className="w-full bg-[#f44786] hover:bg-[#d63a73] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm active:scale-[0.99] flex justify-center items-center"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Verify'
                )}
            </button>
            <div className="text-center">
                <button type="button" onClick={() => setView('PHONE')} className="text-sm text-gray-500 hover:text-black font-medium transition-colors">
                    Wrong Number/Email?
                </button>
            </div>
        </form>
    );

    const renderCompleteProfileView = () => (
        <form onSubmit={handleCompleteProfile} className="space-y-4">
            <AnimatePresence mode="wait">
                {error && <MotionError message={error} key="complete-error" />}
            </AnimatePresence>
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Finish signing up</h3>
                <p className="text-sm text-gray-500">We need a few more details to create your account.</p>
            </div>

            <motion.div
                animate={isShaking ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="space-y-3"
            >
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        className="bg-transparent w-full outline-none text-gray-900 text-sm placeholder:text-gray-400 mb-3 border-b border-gray-200 pb-2"
                        required
                    />
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="bg-transparent w-full outline-none text-gray-900 text-sm placeholder:text-gray-400"
                        required
                    />
                </div>
            </motion.div>

            {getType() === 'PHONE' && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Email (Optional)</p>
                    <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="Add an email for receipts"
                        className="bg-transparent w-full outline-none text-gray-900 text-sm placeholder:text-gray-400"
                    />
                </div>
            )}

            <div className="text-xs text-gray-500 flex gap-2 items-start mt-4">
                <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1"
                />
                <label htmlFor="terms">I agree to the <span className="underline text-blue-600 cursor-pointer">Terms of Service</span> and <span className="underline text-blue-600 cursor-pointer">Privacy Policy</span>. By selecting Agree and Continue, I agree to the terms.</label>
            </div>

            <button
                type="submit"
                disabled={isLoading || !termsAccepted || !firstName || !lastName}
                className="w-full bg-[#f44786] hover:bg-[#d63a73] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm active:scale-[0.99] flex justify-center items-center"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    'Agree and Continue'
                )}
            </button>
        </form>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal Container */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    {view !== 'PHONE' && view !== 'EMAIL' ? (
                                        <button onClick={() => setView('PHONE')} className="p-1 hover:bg-gray-100 rounded-full transition-colors -ml-1">
                                            <ArrowLeft size={20} className="text-gray-900" />
                                        </button>
                                    ) : null}
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {view === 'OTP' ? 'Verification' : view === 'COMPLETE_PROFILE' ? 'Finish Signing Up' : 'Login/Signup'}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="border-b border-gray-100 mb-6"></div>

                            {/* Dynamic Content */}
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {view === 'PHONE' && renderPhoneView()}
                                {view === 'EMAIL' && renderEmailView()}
                                {view === 'OTP' && renderOtpView()}
                                {view === 'COMPLETE_PROFILE' && renderCompleteProfileView()}
                            </motion.div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ... Helper for Social Buttons remains same or can be reused ...
const SocialButton = ({ icon, content, bg, text, border, onClick }: { icon?: string, content?: React.ReactNode, bg: string, text?: string, border?: boolean, onClick?: () => void }) => (
    <button className="hover:scale-105 transition-transform" onClick={onClick} type="button">
        <div className={`w-12 h-12 rounded-full ${bg} ${border ? 'border border-gray-200' : ''} flex items-center justify-center ${text ? `text-${text}` : ''} shadow-sm`}>
            {content ? content : <span className="font-bold text-xl">{icon}</span>}
        </div>
    </button>
)

export default LoginModal;

