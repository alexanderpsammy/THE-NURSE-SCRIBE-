import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Send, Users, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { ChatMessage, Channel, TeamMember } from "@/data/mock";

interface TeamChatProps {
  messages: ChatMessage[];
  channels: Channel[];
  members: TeamMember[];
  activeChannel: string;
  onChannelChange: (id: string) => void;
  onSend: (text: string) => void;
}

const accentMap: Record<string, string> = {
  teal: "bg-teal-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
};

const statusColor: Record<string, string> = {
  online: "bg-emerald-500",
  busy: "bg-rose-500",
  away: "bg-slate-300",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export function TeamChat({
  messages,
  channels,
  members,
  activeChannel,
  onChannelChange,
  onSend,
}: TeamChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter((m) => m.channel === activeChannel);
  const activeCh = channels.find((c) => c.id === activeChannel);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelMessages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Channels header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Users className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Team Chat</h2>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onChannelChange(ch.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                activeChannel === ch.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Hash className="h-3 w-3" />
              {ch.name}
              {ch.unread > 0 && activeChannel !== ch.id && (
                <span className="ml-0.5 rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                  {ch.unread}
                </span>
              )}
            </button>
          ))}
        </div>
        {activeCh && (
          <p className="mt-2 text-xs text-slate-400">{activeCh.description}</p>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {channelMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-full">
                <AvatarFallback className={cn("text-xs font-semibold text-white", accentMap[msg.accent] || "bg-slate-500")}>
                  {initials(msg.author)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900">{msg.author}</span>
                  <span className="text-xs text-slate-400">{msg.authorRole}</span>
                  <span className="text-xs text-slate-300">· {msg.timestamp}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{msg.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {channelMessages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Hash className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-400">No messages in this channel yet</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Message #${activeCh?.name || "general"}`}
            className="border-slate-200 text-sm focus:border-teal-400 focus:ring-teal-100"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Team members */}
      <div className="border-t border-slate-200 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Team Online ({members.filter((m) => m.status === "online").length}/{members.length})
        </h3>
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar className="h-7 w-7 rounded-full">
                  <AvatarFallback className={cn("text-xs font-semibold text-white", accentMap[m.accent] || "bg-slate-500")}>
                    {initials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                    statusColor[m.status]
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{m.name}</p>
                <p className="truncate text-xs text-slate-400">{m.role}</p>
              </div>
              {m.status === "busy" && (
                <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}