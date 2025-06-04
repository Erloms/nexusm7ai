
import React from 'react';
import { Palette, Sparkles } from 'lucide-react';

const ImageShowcase = () => {
  const showcaseImages = [
    {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      title: "星空夜景",
      description: "AI生成的梦幻星空"
    },
    {
      url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
      title: "未来城市",
      description: "科幻风格城市景观"
    },
    {
      url: "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=400&h=400&fit=crop",
      title: "抽象艺术",
      description: "现代艺术风格创作"
    },
    {
      url: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=400&fit=crop",
      title: "自然风光",
      description: "超现实自然景观"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-nexus-purple/10 rounded-full blur-[60px] z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-nexus-blue/10 rounded-full blur-[40px] z-0"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI绘画作品展示</h2>
          </div>
          <p className="text-white/70 text-lg">探索AI创作的无限可能</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseImages.map((image, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-4 rounded-xl border border-nexus-blue/20 backdrop-blur-md hover:scale-105 transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="h-5 w-5 text-nexus-cyan" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{image.title}</h3>
              <p className="text-white/70 text-sm">{image.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-nexus-cyan/20 to-nexus-blue/20 p-6 rounded-xl border border-nexus-blue/30">
            <h3 className="text-xl font-bold text-white mb-2">创意无限可能</h3>
            <p className="text-white/80">
              文本创作、图像生成、语音合成，释放您的创造力
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcase;
