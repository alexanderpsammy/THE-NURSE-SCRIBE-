import { useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, Radio } from "lucide-react";
import { PatientQueue } from "@/components/PatientQueue";
import { ConsultationPanel } from "@/components/ConsultationPanel";
import { TeamChat } from "@/components/TeamChat";
import {
  initialPatients,
  initialMessages,
  channels as initialChannels,
  teamMembers,
  type Patient,
  type ChatMessage,
  type PatientStatus,
} from "@/data/mock";

export default function App() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedId, setSelectedId] = useState("p1");
  const [filter, setFilter] = useState<PatientStatus | "all">("all");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [activeChannel, setActiveChannel] = useState("general");

  const selected = patients.find((p) => p.id === selectedId) || patients[0];

  const handleNotesChange = (notes: string) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, notes } : p))
    );
  };

  const handleComplete = () => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedId ? { ...p, status: "completed" } : p
      )
    );
  };

  const handleSend = (text: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      channel: activeChannel,
      author: "You",
      authorRole: "RN · Scribe",
      accent: "teal",
      text,
      timestamp,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-sm">
            <Crosshair className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-slate-900">
              THE NURSE SCRIBE
            </h1>
            <p className="text-xs text-slate-400">Telemedicine Consulting Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
              YR
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">You · RN</p>
              <p className="text-xs text-slate-400">On shift</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        <PatientQueue
          patients={patients}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilterChange={setFilter}
        />
        <motion.div
          key={selected.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex flex-1 overflow-hidden"
        >
          <ConsultationPanel
            patient={selected}
            onNotesChange={handleNotesChange}
            onComplete={handleComplete}
          />
        </motion.div>
        <TeamChat
          messages={messages}
          channels={initialChannels}
          members={teamMembers}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}