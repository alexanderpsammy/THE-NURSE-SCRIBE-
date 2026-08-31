import { motion } from "framer-motion";
import {
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Video,
  CheckCircle2,
  FileText,
  Pill,
  ClipboardList,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Patient, Priority } from "@/data/mock";

interface ConsultationPanelProps {
  patient: Patient;
  onNotesChange: (notes: string) => void;
  onComplete: () => void;
}

const priorityBadge: Record<Priority, string> = {
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  medium: "bg-teal-100 text-teal-700 border-teal-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

type VitalTone = "normal" | "watch" | "critical";

function toneClasses(tone: VitalTone) {
  switch (tone) {
    case "critical":
      return { ring: "ring-rose-200", chip: "bg-rose-50 text-rose-700", icon: "text-rose-500" };
    case "watch":
      return { ring: "ring-amber-200", chip: "bg-amber-50 text-amber-700", icon: "text-amber-500" };
    default:
      return { ring: "ring-emerald-200", chip: "bg-emerald-50 text-emerald-700", icon: "text-emerald-500" };
  }
}

function hrTone(v: number): VitalTone {
  if (v > 100 || v < 50) return "critical";
  if (v > 90) return "watch";
  return "normal";
}
function spo2Tone(v: number): VitalTone {
  if (v < 90) return "critical";
  if (v < 94) return "watch";
  return "normal";
}
function rrTone(v: number): VitalTone {
  if (v > 24 || v < 10) return "critical";
  if (v > 20) return "watch";
  return "normal";
}
function tempTone(v: number): VitalTone {
  if (v >= 100.4 || v < 95) return "critical";
  if (v >= 99.6) return "watch";
  return "normal";
}
function bpTone(bp: string): VitalTone {
  const sys = parseInt(bp.split("/")[0], 10);
  if (sys >= 160 || sys < 90) return "critical";
  if (sys >= 140) return "watch";
  return "normal";
}

function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  unit: string;
  tone: VitalTone;
}) {
  const t = toneClasses(tone);
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-inset", t.ring)}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          <Icon className={cn("h-3.5 w-3.5", t.icon)} />
          {label}
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", t.chip)}>
          {tone === "critical" ? "Critical" : tone === "watch" ? "Watch" : "Stable"}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export function ConsultationPanel({ patient, onNotesChange, onComplete }: ConsultationPanelProps) {
  const v = patient.vitals;

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      {/* Patient header */}
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 rounded-full bg-teal-600">
              <AvatarFallback className="bg-teal-600 text-white text-base font-semibold">
                {initials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <Badge variant="outline" className={cn("text-xs font-medium", priorityBadge[patient.priority])}>
                  {patient.priority}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {patient.age} {patient.gender} · {patient.room} · Joined {patient.joinedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-700">
              <Video className="h-4 w-4" />
              Start Video
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-teal-600 text-white hover:bg-teal-700"
              onClick={onComplete}
              disabled={patient.status === "completed"}
            >
              <CheckCircle2 className="h-4 w-4" />
              {patient.status === "completed" ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Chief Complaint: </span>
            {patient.chiefComplaint}
          </p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Vitals grid */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
            <Activity className="h-4 w-4 text-teal-600" />
            Live Vitals
          </h2>
          <div className="mt-3 grid grid-cols-5 gap-3">
            <VitalCard icon={Heart} label="Heart Rate" value={String(v.heartRate)} unit="bpm" tone={hrTone(v.heartRate)} />
            <VitalCard icon={Activity} label="Blood Pressure" value={v.bloodPressure} unit="mmHg" tone={bpTone(v.bloodPressure)} />
            <VitalCard icon={Thermometer} label="Temperature" value={v.temperature.toFixed(1)} unit="°F" tone={tempTone(v.temperature)} />
            <VitalCard icon={Droplets} label="SpO₂" value={String(v.oxygenSat)} unit="%" tone={spo2Tone(v.oxygenSat)} />
            <VitalCard icon={Wind} label="Resp Rate" value={String(v.respiratoryRate)} unit="rpm" tone={rrTone(v.respiratoryRate)} />
          </div>
        </section>

        {/* History & Medications */}
        <section className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardList className="h-4 w-4 text-teal-600" />
              Medical History
            </h3>
            <ul className="mt-3 space-y-2">
              {patient.history.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Pill className="h-4 w-4 text-teal-600" />
              Current Medications
            </h3>
            <ul className="mt-3 space-y-2">
              {patient.medications.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Scribe notes */}
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-teal-600" />
            Scribe Notes
          </h3>
          <Textarea
            value={patient.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Document clinical observations, assessment, and plan..."
            className="mt-3 min-h-32 resize-none border-slate-200 bg-white text-sm leading-relaxed text-slate-700 focus:border-teal-400 focus:ring-teal-100"
          />
        </section>
      </div>
    </main>
  );
}