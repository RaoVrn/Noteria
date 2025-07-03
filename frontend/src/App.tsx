import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#065f46',
                  color: '#ecfdf5',
                  border: '1px solid #047857',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ecfdf5',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#7f1d1d',
                  color: '#fef2f2',
                  border: '1px solid #dc2626',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
              loading: {
                style: {
                  background: '#1e40af',
                  color: '#eff6ff',
                  border: '1px solid #3b82f6',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
