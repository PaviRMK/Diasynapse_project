import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Clock, Bell, BellOff, Plus, ShieldCheck, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clinicalAudio } from '@/lib/clinical-sound';

export interface TabletMed {
  id: string;
  name: string;
  timing: string;
  taken: boolean;
  takenAt?: string;
  reminderEnabled: boolean;
}

const DEFAULT_TABLETS: TabletMed[] = [
  {
    id: 'tab-1',
    name: 'Metformin 500mg',
    timing: 'Morning with breakfast (08:00 AM)',
    taken: true,
    takenAt: '08:15 AM',
    reminderEnabled: true,
  },
  {
    id: 'tab-2',
    name: 'Glimepiride 1mg',
    timing: 'Evening with dinner (08:00 PM)',
    taken: false,
    reminderEnabled: true,
  },
];

interface Props {
  variant?: 'both' | 'tablets-only';
}

export function TabletMedicationSection({ variant = 'both' }: Props) {
  const [tablets, setTablets] = useState<TabletMed[]>(() => {
    try {
      const saved = localStorage.getItem('diasynapse-tablets');
      return saved ? JSON.parse(saved) : DEFAULT_TABLETS;
    } catch {
      return DEFAULT_TABLETS;
    }
  });

  const [soundOn, setSoundOn] = useState<boolean>(() => clinicalAudio.isEnabled());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTiming, setNewMedTiming] = useState('');
  const [notificationNote, setNotificationNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('diasynapse-tablets', JSON.stringify(tablets));
    } catch {}
  }, [tablets]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    clinicalAudio.setEnabled(next);
  };

  const toggleTaken = (id: string) => {
    setTablets((prev) =>
      prev.map((t): TabletMed => {
        if (t.id === id) {
          const nextState = !t.taken;
          if (nextState) {
            clinicalAudio.playActionBeep();
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setNotificationNote(`Recorded: ${t.name} marked as taken.`);
            setTimeout(() => setNotificationNote(null), 3500);
            return { ...t, taken: true, takenAt: nowTime };
          } else {
            const { takenAt: _dropped, ...rest } = t;
            return { ...rest, taken: false };
          }
        }
        return t;
      })
    );
  };

  const toggleReminder = (id: string) => {
    setTablets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.reminderEnabled;
          if (next) {
            clinicalAudio.playReminderSound();
            setNotificationNote(`Reminder enabled for ${t.name}.`);
          } else {
            setNotificationNote(`Reminder paused for ${t.name}.`);
          }
          setTimeout(() => setNotificationNote(null), 3000);
          return { ...t, reminderEnabled: next };
        }
        return t;
      })
    );
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedTiming.trim()) return;

    const newMed: TabletMed = {
      id: 'tab-' + Date.now(),
      name: newMedName.trim(),
      timing: newMedTiming.trim(),
      taken: false,
      reminderEnabled: true,
    };

    setTablets((prev) => [...prev, newMed]);
    setNewMedName('');
    setNewMedTiming('');
    setShowAddForm(false);
    clinicalAudio.playActionBeep();
    setNotificationNote(`Added ${newMed.name} to your schedule.`);
    setTimeout(() => setNotificationNote(null), 3500);
  };

  const totalDoses = tablets.length;
  const takenDoses = tablets.filter((t) => t.taken).length;
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="panel p-6 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {variant === 'tablets-only' ? 'Prescribed Tablet Schedule' : 'Oral Tablet Medication Schedule'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Track daily schedule and adherence. Follow your physician&apos;s prescribed plan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className={`h-8 gap-1.5 text-xs ${soundOn ? 'border-primary/50 text-primary' : 'text-muted-foreground'}`}
            title={soundOn ? 'Reminder audio active (Click to mute)' : 'Reminder audio muted (Click to enable)'}
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundOn ? 'Sound On' : 'Muted'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tablet
          </Button>
        </div>
      </div>

      {notificationNote && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-xs text-foreground animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
          <span>{notificationNote}</span>
        </div>
      )}

      {/* Adherence Summary Bar */}
      <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Today&apos;s Medication Adherence</span>
          <span className="text-primary font-bold">{adherencePercent}% ({takenDoses}/{totalDoses} taken)</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${adherencePercent}%` }}
          />
        </div>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <form onSubmit={handleAddMedication} className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Add Prescribed Medication</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Medication Name & Strength</label>
              <input
                className="field mt-1 text-xs"
                placeholder="e.g. Metformin 500mg"
                required
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Prescribed Timing</label>
              <input
                className="field mt-1 text-xs"
                placeholder="e.g. Morning with breakfast"
                required
                value={newMedTiming}
                onChange={(e) => setNewMedTiming(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-xs h-8">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs h-8">
              Save Medication
            </Button>
          </div>
        </form>
      )}

      {/* Medication List */}
      <div className="space-y-2.5">
        {tablets.map((med) => (
          <div
            key={med.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all ${
              med.taken
                ? 'border-emerald-500/30 bg-emerald-950/15'
                : 'border-border/80 bg-secondary/30 hover:border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  med.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/15 text-primary'
                }`}
              >
                <Pill className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm font-bold ${med.taken ? 'text-foreground' : 'text-foreground'}`}>
                  {med.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {med.timing}
                  </span>
                  {med.taken && med.takenAt && (
                    <span className="text-emerald-400 font-medium">
                      &middot; Taken at {med.takenAt}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {/* Reminder Toggle Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => toggleReminder(med.id)}
                className={`h-8 px-2.5 text-xs ${
                  med.reminderEnabled ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                title={med.reminderEnabled ? 'Reminder is active' : 'Reminder is paused'}
              >
                {med.reminderEnabled ? (
                  <span className="flex items-center gap-1">
                    <Bell className="h-3.5 w-3.5 fill-primary/30" /> Reminder On
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <BellOff className="h-3.5 w-3.5" /> No Reminder
                  </span>
                )}
              </Button>

              {/* Taken Toggle Button */}
              <Button
                type="button"
                size="sm"
                variant={med.taken ? 'outline' : 'default'}
                onClick={() => toggleTaken(med.id)}
                className={`h-8 text-xs font-semibold transition-all ${
                  med.taken
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                }`}
              >
                {med.taken ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                    Taken
                  </>
                ) : (
                  'Mark Taken'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Guidance Notice */}
      <div className="rounded-lg border border-border bg-secondary/20 p-3.5 text-xs text-soft flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Prescription Adherence: </span>
          Follow your prescribed medication plan and timing directives. Do not change medications, schedules, or dosages without consulting your doctor or endocrinologist.
        </div>
      </div>
    </div>
  );
}
