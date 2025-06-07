
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GradientLogo from './GradientLogo';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: '首页', path: '/' },
    { name: 'AI对话', path: '/chat' },
    { name: '图像生成', path: '/image' },
    { name: '语音合成', path: '/voice' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-nexus-dark/80 backdrop-blur-md border-b border-nexus-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <GradientLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-nexus-cyan bg-nexus-blue/20'
                      : 'text-white/80 hover:text-nexus-cyan hover:bg-nexus-blue/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="text-white hover:text-nexus-cyan">
                      控制台
                    </Button>
                  </Link>
                  <Button 
                    onClick={logout}
                    variant="outline" 
                    className="border-nexus-blue text-white hover:bg-nexus-blue"
                  >
                    退出
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:text-nexus-cyan">
                      <LogIn className="h-4 w-4 mr-2" />
                      登录
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-nexus-blue hover:bg-nexus-blue/80 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      注册
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-nexus-dark/95 backdrop-blur-md border-b border-nexus-blue/20">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-nexus-cyan bg-nexus-blue/20'
                    : 'text-white/80 hover:text-nexus-cyan hover:bg-nexus-blue/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-nexus-blue/20">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-nexus-cyan"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    控制台
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-nexus-cyan"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-nexus-cyan"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-nexus-cyan"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
