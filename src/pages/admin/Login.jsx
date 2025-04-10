import React, { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch('')

    
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header with Logo */}
      <header className="p-6">
      <div className="text-2xl font-bold">
      <span className="text-white">{'< '}</span>
  
  <span style={{ color: '#00FF40' }}>Bit</span>
  
  <span className="text-white">Code</span>
  <span style={{ color: '#00FF40' }}>{' >'}</span>
  
</div>

      </header>
      
      {/* Main Content */}
      <main className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 rounded-lg border" style={{ borderColor: '#00FF40' }}>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">Admin Login</h2>
            <p className="mt-2" style={{ color: '#00FF40' }}>Enter your credentials to access the dashboard</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border-2 bg-black text-white rounded-md focus:outline-none"
                    style={{ borderColor: '#00FF40' }}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border-2 bg-black text-white rounded-md focus:outline-none"
                    style={{ borderColor: '#00FF40' }}
                  />
                </div>
              </div>
            </div>

           

            <div>
            <button
  type="submit"
  className={`w-full flex justify-center items-center py-2 px-4 border-2 rounded-md text-sm font-medium transition-all duration-300 relative
    border-[#00FF40] bg-[#00FF40] text-black hover:bg-transparent hover:text-[#00FF40] overflow-hidden group`}
  disabled={isLoading}
>
  {isLoading ? (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#00FF40]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
             5.291A7.962 7.962 0 014 12H0c0 
             3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Signing in...
    </span>
  ) : (
    <span className="relative z-10 transition-all duration-300 group-hover:animate-pulse">
      &lt;BitCode/&gt;
    </span>
  )}
</button>

            </div>
          </form>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 BitCode. All rights reserved.
      </footer>
    </div>
  );
}