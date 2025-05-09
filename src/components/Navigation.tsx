
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Diamond, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-nexus-dark/80 to-nexus-purple/80 backdrop-blur-md border-b border-nexus-blue/20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl flex items-center justify-between py-4">
        {/* Logo and Name */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="bg-gradient-to-r from-nexus-blue to-nexus-cyan w-8 h-8 flex items-center justify-center rounded-lg">
            <span className="font-bold text-white">N</span>
          </span>
          <span className="text-2xl font-bold text-gradient">Nexus AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/chat" className="text-white/80 hover:text-white hover:text-nexus-cyan transition">AI 对话</Link>
          <Link to="/image" className="text-white/80 hover:text-white hover:text-nexus-cyan transition">AI 图像生成</Link>
          <Link to="/voice" className="text-white/80 hover:text-white hover:text-nexus-cyan transition">AI 语音合成</Link>
          <div className="ml-4 border-l border-nexus-blue/30 pl-4">
            <Button variant="outline" className="bg-transparent border border-nexus-cyan hover:bg-nexus-cyan/20 text-nexus-cyan">
              <Diamond className="mr-2 h-4 w-4" />
              会员
            </Button>
          </div>
          <Button variant="default" className="bg-nexus-blue hover:bg-nexus-blue/80 text-white">
            登录
          </Button>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-nexus-dark/95 backdrop-blur-lg py-4 px-4 border-t border-nexus-blue/20">
          <div className="flex flex-col space-y-4">
            <Link to="/chat" className="text-white py-2 hover:text-nexus-cyan transition">AI 对话</Link>
            <Link to="/image" className="text-white py-2 hover:text-nexus-cyan transition">AI 图像生成</Link>
            <Link to="/voice" className="text-white py-2 hover:text-nexus-cyan transition">AI 语音合成</Link>
            <div className="pt-2 border-t border-nexus-blue/30">
              <Button variant="outline" className="w-full bg-transparent border border-nexus-cyan hover:bg-nexus-cyan/20 text-nexus-cyan">
                <Diamond className="mr-2 h-4 w-4" />
                会员
              </Button>
            </div>
            <Button variant="default" className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white">
              登录
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
