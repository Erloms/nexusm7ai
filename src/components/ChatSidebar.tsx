
import React from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  onModelChange: (val: string) => void;
  selectedModel: string;
  onSuggestClick: (text: string) => void;
  suggestedQuestions: string[];
  aiModels: {
    id: string;
    name: string;
    group?: string;
  }[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onModelChange,
  selectedModel,
  onSuggestClick,
  suggestedQuestions,
  aiModels,
}) => {
  return (
    <aside className="w-full max-w-xs min-w-[220px] bg-gradient-to-b from-[#1b2234] to-[#131a26] border-r border-[#232b3a] px-6 py-7 flex flex-col gap-8 shadow-2xl relative z-20">
      <div>
        <div className="text-xs text-cyan-400 font-semibold mb-2 tracking-wide">
          AI助手模型
        </div>
        <select
          value={selectedModel}
          onChange={e => onModelChange(e.target.value)}
          className="w-full bg-[#151b2a] border border-[#23304d] text-gray-200 py-2 px-3 rounded-lg shadow mb-4 focus:outline-none focus:border-cyan-400 text-[15px]"
        >
          {aiModels.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div>
        <div className="text-xs text-cyan-400 font-semibold mb-2 tracking-wide">
          推荐提问
        </div>
        <div className="flex flex-col gap-2">
          {suggestedQuestions.map((q, idx) => (
            <Button
              key={idx}
              size="sm"
              className="rounded-lg mb-1 font-medium bg-gradient-to-r from-[#283d54] to-[#14223b] hover:from-cyan-700 hover:to-blue-700 text-gray-100 text-left shadow-none transition flex items-center justify-start w-full"
              onClick={() => onSuggestClick(q)}
            >
              <MessageSquare size={16} className="mr-2 text-cyan-300 flex-shrink-0" /> 
              <span className="text-left">{q}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
