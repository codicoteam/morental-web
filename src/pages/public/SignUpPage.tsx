import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { registerUser, verifyEmail } from "../../features/auth/authThunks";
import { setPendingVerificationEmail } from "../../features/auth/authSlice";
import Swal from "sweetalert2";

// Beautiful Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="relative">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.75s' }}></div>
    </div>
  </div>
);

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loading = authState.loading;
  const apiError = authState.error as string | null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setLocalError(null);
    setSuccessMessage(null);
  };

  const showVerificationModal = async (email: string) => {
    setIsVerifying(true);
    
    const { value: otp } = await Swal.fire({
      title: 'Verify Your Email',
      html: `
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p class="text-gray-600 mb-2">We sent a 6-digit verification code to</p>
          <p class="text-blue-600 font-semibold mb-4">${email}</p>
          <input 
            type="text" 
            id="otp-input" 
            class="swal2-input" 
            placeholder="Enter 6-digit code" 
            maxlength="6"
            style="font-size: 1.5rem; text-align: center; letter-spacing: 0.5em;"
          >
          <p class="text-sm text-gray-500 mt-3">Check your email including spam folder</p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Verify Email',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        const otpInput = document.getElementById('otp-input') as HTMLInputElement;
        const otpValue = otpInput?.value.trim();
        
        console.log("OTP entered:", otpValue);
        
        if (!otpValue || otpValue.length !== 6) {
          Swal.showValidationMessage('Please enter a valid 6-digit code');
          return false;
        }
        
        console.log("OTP validation passed, returning:", otpValue);
        return otpValue;
      },
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'px-6 py-2 rounded-xl font-semibold',
        cancelButton: 'px-6 py-2 rounded-xl font-semibold'
      },
      didOpen: () => {
        const otpInput = document.getElementById('otp-input') as HTMLInputElement;
        if (otpInput) {
          otpInput.focus();
          
          // Auto-format and validate input
          otpInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Remove non-numeric characters and limit to 6 digits
            target.value = target.value.replace(/\D/g, '').slice(0, 6);
          });

          // Also allow Enter key to submit
          otpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              const confirmButton = document.querySelector('.swal2-confirm') as HTMLButtonElement;
              if (confirmButton) {
                confirmButton.click();
              }
            }
          });
        }
      }
    });

    console.log("OTP modal result:", otp);

    if (otp) {
      try {
        // Show verifying state
        Swal.fire({
          title: 'Verifying...',
          text: 'Please wait while we verify your code',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        console.log("Dispatching verifyEmail with:", { email, otp });

        // Call verify email API and USE THE RESULT
        const result = await dispatch(verifyEmail({
          email: email,
          otp: otp
        })).unwrap();

        console.log("Verification successful, result:", result);

        // Close the loading modal
        Swal.close();

        // Show success message with user information from the result
        await Swal.fire({
          title: 'Success!',
          html: `
            <div class="text-center">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p class="text-gray-700 mb-2">Welcome, <strong>${result.user.full_name}</strong>!</p>
              <p class="text-gray-600">Your email has been verified successfully.</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Continue to Dashboard',
          customClass: {
            popup: 'rounded-2xl'
          }
        });

        // Redirect to dashboard or home page using the result data
        console.log("Redirecting to dashboard with user:", result.user);
        window.location.href = '/dashboardy';

      } catch (error: any) {
        console.error('Verification error:', error);
        
        // Close the loading modal
        Swal.close();
        
        let errorMessage = error?.message || 'Invalid verification code. Please try again.';
        
        // Provide more user-friendly messages for common errors
        if (errorMessage.includes('Invalid OTP') || errorMessage.includes('invalid') || errorMessage.includes('expired')) {
          errorMessage = 'The verification code is invalid or has expired. Please request a new code.';
        } else if (errorMessage.includes('not found') || errorMessage.includes('user')) {
          errorMessage = 'No pending verification found for this email. Please try registering again.';
        }
        
        const result = await Swal.fire({
          title: 'Verification Failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Try Again',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          customClass: {
            popup: 'rounded-2xl'
          }
        });

        if (result.isConfirmed) {
          showVerificationModal(email); // Retry verification
        }
      }
    } else {
      console.log("OTP modal was cancelled");
    }
    
    setIsVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setLocalError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    try {
      console.log("Submitting registration form:", formData);

      // Backend expects: full_name, email, phone, password
      const result = await dispatch(
        registerUser({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
        })
      ).unwrap();

      console.log("Registration successful, result:", result);

      setSuccessMessage(
        "Account created successfully! Please check your email for the verification code."
      );
      
      // Clear form on success
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
      });

      // Store the email for verification in Redux state
      dispatch(setPendingVerificationEmail(result.email));

      // Show verification modal after a short delay
      setTimeout(() => {
        showVerificationModal(result.email);
      }, 1500);

    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = err?.message || "Failed to create account. Please try again.";
      
      // Provide more user-friendly messages for common errors
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setLocalError(errorMessage);
    }
  };

  const effectiveError = localError || apiError;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      {/* Luxury Car Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-20 left-10 animate-pulse" />
        <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl bottom-20 right-10 animate-pulse" />
        <div className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl top-1/2 left-1/3 animate-pulse delay-1000" />
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:scale-[1.02]">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-300 text-sm">
              Join our exclusive automotive community
            </p>
          </div>

          {/* Success + Error Messages */}
          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-400/60 bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-emerald-400 rounded-full mr-2 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                {successMessage}
              </div>
            </div>
          )}

          {effectiveError && (
            <div className="mb-4 rounded-xl border border-red-400/60 bg-red-900/40 px-4 py-3 text-sm text-red-100 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-400 rounded-full mr-2 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {effectiveError}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
                disabled={loading || isVerifying}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                disabled={loading || isVerifying}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Phone */}
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number (Optional)"
                disabled={loading || isVerifying}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={loading || isVerifying}
                minLength={6}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading || isVerifying}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isVerifying}
              className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 hover:from-blue-700 hover:to-blue-900 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${
                loading ? "relative overflow-hidden" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Creating account...</span>
                </div>
              ) : isVerifying ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Verifying...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-400 font-semibold transition-colors hover:text-blue-300 underline"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 text-xs mt-6 backdrop-blur-sm bg-black/30 rounded-lg py-2 px-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}