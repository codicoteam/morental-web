import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { loginUser } from "../../features/auth/authThunks";
import { resetAuthError } from "../../features/auth/authSlice";

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const dispatch = useAppDispatch();
  const { loading, error, status, user, token } = useAppSelector((state) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign In submitted with:', formData);

    dispatch(resetAuthError());

    // Dispatch login thunk WITH CONSOLE LOG TO SEE RESPONSE
    dispatch(loginUser({
      email: formData.email,
      password: formData.password
    })).then((res: any) => {
      console.log("LOGIN RESPONSE FROM THUNK:", res); 
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (error) {
      dispatch(resetAuthError());
    }
  };

  // Handle successful login - REDIRECT TO DASHBOARD
  useEffect(() => {
    if (status === 'succeeded' && user && token) {
      console.log('Login successful! User + Token:', { user, token });
      setShouldRedirect(true);
    }
  }, [status, user, token]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
    }
  }, [error]);

  // Redirect instantly (NO SCREEN DISPLAY)
  if (shouldRedirect) {
    window.location.href = '/dashboardy';
  }

  const isLoading = loading || status === 'loading';

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      
      {/* Luxury Car Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      {/* Decorative Lights */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl bottom-20 right-10 animate-pulse"></div>
        <div className="absolute w-64 h-64 bg-blue-500/10 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:scale-[1.02]">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              Sign In
            </h1>
            <p className="text-gray-300 text-sm">
              Welcome back to the exclusive experience
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* Loading Message */}
          {isLoading && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-xl text-blue-200 text-sm text-center">
              Signing you in...
            </div>
          )}

          {/* Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
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
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={isLoading}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-300 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="rounded bg-white/10 border-white/20 text-blue-600 focus:ring-blue-500 disabled:opacity-50" 
                  disabled={isLoading}
                />
                <span className="ml-2 text-gray-300 text-sm">Remember me</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30 hover:border-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Don't have an account?{' '}
              <a 
                href="signup" 
                className="text-blue-400 font-semibold hover:text-blue-300 transition-colors underline"
              >
                Signup
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 text-xs mt-6 backdrop-blur-sm bg-black/30 rounded-lg py-2 px-4">
          Protected by our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
