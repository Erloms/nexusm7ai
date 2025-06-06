
import React from 'react';
import { Palette, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const ImageShowcase = () => {
  const showcaseImages = [
    {
      url: "/lovable-uploads/3d4bec65-5070-4b7e-a7b8-3793c260ed13.png",
      title: "AI猫咪艺术",
      description: "优雅室内场景中的蓝色猫咪"
    },
    {
      url: "/lovable-uploads/0bb49517-db51-4ccc-b82b-6ceecc80c8d8.png",
      title: "现代室内设计",
      description: "温馨舒适的现代居家空间"
    },
    {
      url: "/lovable-uploads/f0a497f8-ba29-43f4-adf0-7cbe79e589a7.png",
      title: "赛博朋克工作站",
      description: "未来科技感的办公环境"
    },
    {
      url: "/lovable-uploads/422c49d8-b952-4d1b-a8a8-42a64c3fe9cf.png",
      title: "魔法猫咪世界",
      description: "神秘魔法环境中的可爱猫咪"
    },
    {
      url: "/lovable-uploads/1a903df0-2684-445c-970d-451f4dd16486.png",
      title: "霓虹动物城",
      description: "赛博朋克风格的动物世界"
    },
    {
      url: "/lovable-uploads/ad6155cf-9c08-4c17-aa70-fcef934a5e15.png",
      title: "绚烂花束",
      description: "色彩缤纷的艺术花卉创作"
    },
    {
      url: "/lovable-uploads/06031b32-4a62-4ac5-8e20-c5c0b5e27e48.png",
      title: "霓虹牛头",
      description: "未来主义风格的机械生物"
    },
    {
      url: "/lovable-uploads/d728db1d-febd-46e1-975b-e5783c3eabc4.png",
      title: "欧洲小镇",
      description: "温馨浪漫的雨夜街景"
    },
    {
      url: "/lovable-uploads/49b1d8d8-c189-444b-b2de-80c73d893b6a.png",
      title: "恐龙自拍",
      description: "博物馆中的创意恐龙艺术"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-nexus-purple/10 rounded-full blur-[60px] z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-nexus-blue/10 rounded-full blur-[40px] z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI绘画作品展示</h2>
          </div>
          <p className="text-white/70 text-lg">探索AI创作的无限可能</p>
        </div>

        <Carousel className="w-full max-w-6xl mx-auto" opts={{ align: "start", loop: true }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {showcaseImages.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group relative bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-4 rounded-xl border border-nexus-blue/20 backdrop-blur-md hover:scale-105 transition-all duration-300">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-nexus-dark/80 border-nexus-blue/30 text-white hover:bg-nexus-blue/80" />
          <CarouselNext className="right-4 bg-nexus-dark/80 border-nexus-blue/30 text-white hover:bg-nexus-blue/80" />
        </Carousel>
      </div>
    </section>
  );
};

export default ImageShowcase;
