
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "ai";
  type?: "text" | "image" | "audio";
  imageUrl?: string;
  audioUrl?: string;
}

interface ChatMainProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  isTyping: boolean;
  isListening: boolean;
  onSend: () => void;
  onStartListening: () => void;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  input,
  setInput,
  isTyping,
  isListening,
  onSend,
  onStartListening,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
      {/* 顶部标题+装饰 */}
      <div className="py-12 mb-6">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center drop-shadow-lg tracking-tight">
          智能创作工作台
        </h1>
        <p className="text-center text-gray-400 mt-3 text-lg">集成20+顶级AI模型，支持对话、绘画、创作一体化体验</p>
      </div>
      {/* 聊天内容 */}
      <div className="flex-1 overflow-y-auto px-0 md:px-8 max-h-[62vh] min-h-[320px] pb-6">
        {messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-400 opacity-70 text-lg">
            试试左侧建议问题或者自由提问吧～
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-[#22498e] to-[#22cbed] text-white"
                      : "bg-[#1a2740] text-gray-100 border border-[#203042]/60"
                  }`}
                >
                  {msg.type === "image" && msg.imageUrl ? (
                    <img
                      src={msg.imageUrl}
                      alt="AI生成图像"
                      className="rounded mb-2 max-w-full border border-[#203042]/30"
                    />
                  ) : null}
                  <span className="whitespace-pre-line text-base leading-relaxed">{msg.text}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-[#1a2740]/80 text-cyan-300">
                  正在思考...
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
        )}
      </div>
      {/* 输入区（操作条悬浮底部） */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center items-end w-full pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl mb-8 px-4 ml-64">
          <div className="px-3 py-3 bg-gradient-to-b from-[#151b2a] to-[#213548] rounded-2xl flex gap-3 shadow-2xl border border-[#243655]/60">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的问题或需求，按回车发送"
              className="bg-transparent border-none text-base flex-1 resize-none h-12"
              rows={2}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <Button
              onClick={onStartListening}
              disabled={isListening}
              size="icon"
              variant="ghost"
              className="bg-transparent text-cyan-400 hover:bg-cyan-800/20 mr-1"
            >
              {isListening ? <MicOff /> : <Mic />}
            </Button>
            <Button
              onClick={onSend}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-5 rounded-xl text-base shadow-lg font-bold"
            >
              <Send className="mr-1" /> 发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMain;
