
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-20 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexus-blue/10 rounded-full blur-[100px] z-0"></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-gradient">解锁</span> <span className="text-gradient-reverse">AI</span> <span className="text-gradient">超能力</span>
        </h1>
        <h2 className="text-xl md:text-3xl font-bold mb-8">
          <span className="text-white">对话、创想、发声，一站搞定！</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild className="bg-nexus-blue hover:bg-nexus-blue/80 text-white text-lg px-8 py-6">
            <Link to="/chat">立即体验</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="bg-transparent border border-nexus-blue hover:bg-nexus-blue/20 text-nexus-blue text-lg px-8 py-6">
            <Link to="/payment">成为会员</Link>
          </Button>
        </div>
        
        <button 
          onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
          className="animate-bounce flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm mx-auto mt-8 hover:bg-white/20 transition"
        >
          <ArrowDown size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
