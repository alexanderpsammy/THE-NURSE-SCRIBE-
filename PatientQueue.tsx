import { motion } from "framer-motion";
import { Search, Clock, Stethoscope, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Patient, PatientStatus, Priority } from "@/data/mock";

interface PatientQueueProps {
  patients: Patient[];
  selectedId: string;
  onSelect: (id: string) => void;
  filter: PatientStatus | "all";
  onFilterChange: (f: PatientStatus | "all") => void;
}

const priorityStyles: Record<Priority, { dot: string; badge: string; label: string }> = {
  urgent: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 ring-rose-200", label: "Urgent" },
  high: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 ring-amber-200", label: "High" },
  medium: { dot: "bg-teal-500", badge: "bg-teal-50 text-teal-700 ring-teal-200", label: "Medium" },
  low: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 ring-slate-200", label: "Low" },
};

const statusStyles: Record<PatientStatus, { label: string; chip: string }> = {
  active: { label: "In session", chip: "bg-teal-100 text-teal-800" },
  waiting: { label: "Waiting", chip: "bg-slate-100 text-slate-600" },
  completed: { label: "Completed", chip: "bg-emerald-100 text-emerald-800" },
};

const filters: { id: PatientStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "waiting", label: "Waiting" },
  { id: "completed", label: "Done" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

export function PatientQueue({ patients, selectedId, onSelect, filter, onFilterChange }: PatientQueueProps) {
  const counts = {
    active: patients.filter((p) => p.status === "active").length,
    waiting: patients.filter((p) => p.status === "waiting").length,
  };

  const visible = patients.filter((p) => (filter === "all" ? true : p.status === filter));

  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <div className="flex items-center gap-2 text-slate-900">
          <Stethoscope className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Consult Queue</h2>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            {counts.active} active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {counts.waiting} waiting
          </span>
        </div>
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition",
                filter === f.id ? "bg-teal-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-2">
          {visible.map((patient, idx) => {
            const prio = priorityStyles[patient.priority];
            const status = statusStyles[patient.status];
            const isSelected = patient.id === selectedId;
            return (
              <motion.li
                key={patient.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <button
                  onClick={() => onSelect(patient.id)}
                  className={cn(
                    "group w-full rounded-xl border p-3 text-left transition",
                    isSelected
                      ? "border-teal-300 bg-teal-50/70 shadow-sm ring-1 ring-teal-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                        patient.priority === "urgent" ? "bg-rose-500" : patient.priority === "high" ? "bg-amber-500" : "bg-teal-600"
                      )}
                    >
                      {initials(patient.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{patient.name}</p>
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", prio.dot)} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {patient.age} {patient.gender} · {patient.room}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600">
                        {patient.chiefComplaint}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                            prio.badge
                          )}
                        >
                          {patient.priority === "urgent" && <AlertTriangle className="h-3 w-3" />}
                          {prio.label}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            status.chip
                          )}
                        >
                          {patient.status === "completed" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}