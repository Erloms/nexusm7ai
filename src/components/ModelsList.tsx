
import React from 'react';

interface ModelType {
  name: string;
  items: string[];
}

const ModelsList: React.FC = () => {
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
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          <span className="text-white">支持的</span>
          <span className="text-gradient">AI模型</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Text Models */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gradient-gold">
              文本生成模型
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {textModels.map((group, idx) => (
                <div 
                  key={idx} 
                  className="bg-gradient-to-br from-nexus-dark to-nexus-purple/30 p-4 rounded-lg border border-nexus-blue/30"
                >
                  <h4 className="text-nexus-cyan font-semibold mb-2">{group.name}</h4>
                  <ul className="space-y-1">
                    {group.items.map((model, i) => (
                      <li key={i} className="text-white/80 text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-nexus-blue rounded-full mr-2"></span>
                        {model}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Image Models */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-gradient-gold">
              图像生成模型
            </h3>
            <div className="bg-gradient-to-br from-nexus-dark to-nexus-purple/30 p-6 rounded-lg border border-nexus-blue/30 h-full">
              <h4 className="text-nexus-cyan font-semibold mb-4">{imageModels.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {imageModels.items.map((model, i) => (
                  <div key={i} className="bg-nexus-dark/50 rounded p-2 text-white/80 text-sm flex items-center">
                    <span className="w-2 h-2 bg-nexus-blue rounded-full mr-2"></span>
                    {model}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>由 Pollinations.AI 提供技术支持 | 多模型免密钥非公开API</p>
        </div>
      </div>
    </section>
  );
};

export default ModelsList;
