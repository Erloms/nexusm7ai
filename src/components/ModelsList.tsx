
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Sparkles, Star } from "lucide-react";

interface ModelType {
  name: string;
  items: string[];
}

const ModelsList: React.FC = () => {
  const [isHovering, setIsHovering] = useState<number | null>(null);
  
  const textModels: ModelType[] = [
    {
      name: 'OpenAI',
      items: ['GPT-4o', 'GPT-4o-mini', 'o1-mini']
    },
    {
      name: 'Google',
      items: ['Gemini 2.0 Pro', 'Gemini 2.0 Flash', 'Gemini 2.0 Flash Thinking']
    },
    {
      name: 'Meta',
      items: ['Llama 3.3 70B', 'Llama 3.1 8B Instruct', 'Llama (Scaleway)']
    },
    {
      name: 'DeepSeek',
      items: ['DeepSeek-V3', 'DeepSeek R1 Full', 'DeepSeek-R1 Distill Qwen 32B']
    },
    {
      name: 'Other',
      items: ['Mistral Nemo', 'Qwen 2.5 Coder 32B', 'Phi-4 Multimodal Instruct', 'SearchGPT']
    }
  ];

  const imageModels: ModelType = {
    name: '图像生成',
    items: ['通用创意 | flux', '专业版 | flux-pro', '超真实效果 | flux-realism', '动漫风格 | flux-anime', '三维效果 | flux-3d', '创意艺术 | flux-cablyai', '极速生成 | turbo']
  };

  return (
    <section className="py-16 px-4 bg-nexus-dark/70 rounded-xl border border-nexus-blue/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          <span className="text-white">支持的</span>
          <span className="text-gradient">AI模型</span>
        </h2>
        
        {/* Pricing Advantage Banner */}
        <div className="relative overflow-hidden mb-12 bg-gradient-to-r from-nexus-blue/30 to-nexus-purple/30 rounded-lg p-4 border border-nexus-blue/30 backdrop-blur-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 text-nexus-blue/10">
            <Sparkles size={96} />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-gradient-gold mb-2 flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-400" />
                为什么选择 Nexus AI？
              </h3>
              <p className="text-white/80">
                无需为昂贵的大模型付费，告别999元终身会员，只需<span className="font-bold text-nexus-cyan">99元</span>，<span className="font-bold text-white">永久</span>使用顶尖AI模型
              </p>
            </div>
            <div className="shrink-0">
              <button className="px-4 py-2 bg-gradient-to-r from-nexus-blue to-nexus-cyan text-white rounded-md flex items-center font-medium hover:opacity-90 transition-all">
                立即体验 <ArrowUpRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Text Models */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gradient-gold">
              文本生成模型
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue/20 to-nexus-purple/10 rounded-xl blur-xl"></div>
              <Card className="relative bg-gradient-to-br from-nexus-dark to-nexus-dark/90 border-nexus-blue/20 overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-nexus-blue/5 rounded-full blur-3xl"></div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-nexus-blue/10">
                    {textModels.map((group, idx) => (
                      <div 
                        key={idx} 
                        className="relative bg-gradient-to-br from-nexus-dark to-nexus-purple/10 p-4 overflow-hidden"
                        onMouseEnter={() => setIsHovering(idx)}
                        onMouseLeave={() => setIsHovering(null)}
                      >
                        <div className={`absolute inset-0 bg-nexus-blue/5 transition-opacity duration-300 ${isHovering === idx ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className="relative z-10">
                          <h4 className="text-nexus-cyan font-semibold mb-3 pb-2 border-b border-nexus-blue/20">{group.name}</h4>
                          <ul className="space-y-2">
                            {group.items.map((model, i) => (
                              <li key={i} className="text-white/80 text-sm flex items-center">
                                <span className="w-2 h-2 bg-nexus-blue rounded-full mr-2"></span>
                                {model}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Image Models */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gradient-gold">
              图像生成模型
            </h3>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-nexus-cyan/20 to-nexus-blue/10 rounded-xl blur-xl"></div>
              <Card className="relative bg-gradient-to-br from-nexus-dark to-nexus-dark/90 border-nexus-blue/20 overflow-hidden h-full">
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-nexus-cyan/5 rounded-full blur-3xl"></div>
                <CardContent className="p-4 h-full">
                  <h4 className="text-nexus-cyan font-semibold mb-4 pb-2 border-b border-nexus-blue/20">{imageModels.name}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageModels.items.map((model, i) => (
                      <div 
                        key={i} 
                        className="bg-nexus-dark/50 rounded-lg p-3 text-white/80 text-sm border border-nexus-blue/10 hover:border-nexus-blue/30 transition-all hover:bg-nexus-dark/80 hover:shadow-glow-sm cursor-pointer"
                      >
                        <div className="flex items-center mb-1">
                          <span className="w-2 h-2 bg-nexus-blue rounded-full mr-2"></span>
                          {model.split('|')[0].trim()}
                        </div>
                        <div className="text-xs text-nexus-blue/80 font-mono">
                          {model.split('|')[1]?.trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelsList;
