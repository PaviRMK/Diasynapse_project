import React, { useState, useEffect } from 'react';
import {
  Footprints,
  Activity,
  Bike,
  Leaf,
  Dumbbell,
  Wind,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Heart,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { clinicalAudio } from '@/lib/clinical-sound';

export interface ExerciseItem {
  id: string;
  name: string;
  intensity: 'Very Light' | 'Light' | 'Moderate';
  suggestedDuration: string;
  targetSeconds: number;
  icon: typeof Activity;
  image: string;
  description: string;
  benefits: string;
  safetyNote: string;
}

export const EXERCISE_ITEMS: ExerciseItem[] = [
  {
    id: 'walking',
    name: 'Brisk Walking',
    intensity: 'Light',
    suggestedDuration: '15–20 minutes',
    targetSeconds: 900,
    icon: Footprints,
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
    description: 'A comfortable, steady-paced walk following meals to stimulate muscle GLUT4 transporters and glucose uptake without insulin demand.',
    benefits: 'Enhances peripheral glucose clearance and cardiovascular conditioning.',
    safetyNote: 'Wear well-fitted, supportive footwear. Keep fast-acting carbohydrates on hand if taking insulin or sulfonylureas.',
  },
  {
    id: 'stretching',
    name: 'Light Stretching',
    intensity: 'Very Light',
    suggestedDuration: '10–12 minutes',
    targetSeconds: 600,
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    description: 'Gentle whole-body flexibility movements targeting hamstrings, calves, neck, and lumbar spine to release muscle stiffness.',
    benefits: 'Improves peripheral microcirculation and reduces muscular tension.',
    safetyNote: 'Breathe steadily throughout each movement; avoid bouncing or overextending tight joints.',
  },
  {
    id: 'cycling',
    name: 'Stationary Cycling',
    intensity: 'Moderate',
    suggestedDuration: '15–25 minutes',
    targetSeconds: 1200,
    icon: Bike,
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    description: 'Smooth, low-impact pedal cadence on a stationary or outdoor bike engaging large lower-body quadricep and gluteal muscle groups.',
    benefits: 'Builds aerobic capacity and sustained glycemic regulation with minimal foot/joint impact.',
    safetyNote: 'Maintain a cadence where you can comfortably speak in full sentences. Hydrate adequately before starting.',
  },
  {
    id: 'yoga',
    name: 'Gentle Yoga & Asanas',
    intensity: 'Light',
    suggestedDuration: '20 minutes',
    targetSeconds: 1200,
    icon: Leaf,
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
    description: 'Mindful restorative yoga postures (Tadasana, Bhujangasana, Balasana) combining joint mobility with gentle parasympathetic activation.',
    benefits: 'Dampens stress-induced adrenaline and cortisol release, supporting glycemic stability.',
    safetyNote: 'Avoid rapid head-below-heart inversions if you have diabetic retinopathy or autonomic neuropathy.',
  },
  {
    id: 'strength',
    name: 'Light Resistance & Strength',
    intensity: 'Light',
    suggestedDuration: '12–15 minutes',
    targetSeconds: 720,
    icon: Dumbbell,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    description: 'Bodyweight wall push-ups, chair squats, and seated resistance band curls to maintain metabolic muscle mass.',
    benefits: 'Skeletal muscle mass is the primary reservoir for postprandial glucose disposal.',
    safetyNote: 'Never hold your breath (Valsalva maneuver); exhale on effort and check pre-exercise glucose levels.',
  },
  {
    id: 'breathing',
    name: 'Diaphragmatic Breathing & Relaxation',
    intensity: 'Very Light',
    suggestedDuration: '5–10 minutes',
    targetSeconds: 300,
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    description: 'Slow 4-second nasal inhale, 4-second gentle hold, and 6-second soft exhale to induce parasympathetic relaxation tone.',
    benefits: 'Calms acute anxiety and blunts counter-regulatory hormone glucose spikes.',
    safetyNote: 'Sit in a supportive, comfortable posture. Completely safe for all stages of care.',
  },
];

export function ExerciseActivitySection() {
  const [selectedItem, setSelectedItem] = useState<ExerciseItem | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => clinicalAudio.isEnabled());

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => {
          const next = s + 1;
          if (selectedItem && next >= selectedItem.targetSeconds && !completed) {
            setCompleted(true);
            clinicalAudio.playReminderSound();
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, selectedItem, completed]);

  const handleOpenActivity = (item: ExerciseItem) => {
    setSelectedItem(item);
    setElapsedSeconds(0);
    setTimerRunning(false);
    setCompleted(false);
  };

  const handleToggleTimer = () => {
    if (!timerRunning) {
      clinicalAudio.playActionBeep();
    }
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
    setCompleted(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Activity Disclaimer */}
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs sm:text-sm text-soft leading-relaxed flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Exercise & Physical Activity Guidance: </span>
          Physical activity is an essential pillar of long-term metabolic health. The recommendations below provide general educational activity suggestions. Choose activities suited to your physical condition, and consult your physician or care team before undertaking new exercise regimens.
        </div>
      </div>

      {/* Grid of Exercise Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="panel-interactive group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/90 p-0 text-left transition-all"
            >
              {/* Card visual banner */}
              <div className="relative h-40 w-full overflow-hidden bg-secondary">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                    {item.intensity} Intensity
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.suggestedDuration}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-xs text-soft line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Safety callout snippet */}
                <div className="rounded-lg border border-border/80 bg-secondary/30 p-2.5 text-[11px] text-muted-foreground flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span className="line-clamp-1">{item.safetyNote}</span>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold flex-1"
                    onClick={() => handleOpenActivity(item)}
                  >
                    View Details
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs font-semibold flex-1 gap-1.5 shadow-sm"
                    onClick={() => {
                      handleOpenActivity(item);
                      setTimerRunning(true);
                    }}
                  >
                    <Play className="h-3 w-3 fill-current" /> Start Activity
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Activity Session Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(o) => {
          if (!o) {
            setSelectedItem(null);
            setTimerRunning(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md overflow-hidden p-0 border border-primary/30">
          {selectedItem && (
            <div>
              {/* Header banner */}
              <div className="relative h-44 w-full overflow-hidden bg-secondary">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    {selectedItem.intensity} Intensity
                  </span>
                  <DialogTitle className="mt-1 text-xl font-bold text-foreground">
                    {selectedItem.name}
                  </DialogTitle>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <DialogDescription className="text-xs text-muted-foreground">
                  Target Duration: {selectedItem.suggestedDuration} &middot; Follow your personal comfort level
                </DialogDescription>

                {/* Live Activity Session Timer */}
                <div className="rounded-xl border border-primary/30 bg-secondary/30 p-5 text-center space-y-4">
                  <span className="eyebrow block">Active Session Timer</span>
                  <div className="text-5xl font-mono font-extrabold tabular-nums tracking-tight text-foreground">
                    {formatTime(elapsedSeconds)}
                  </div>

                  {completed && (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 animate-in fade-in">
                      <CheckCircle2 className="h-4 w-4" /> Recommended session target reached!
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleToggleTimer}
                      className="gap-1.5 px-5 h-9"
                    >
                      {timerRunning ? (
                        <>
                          <Pause className="h-3.5 w-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" /> {elapsedSeconds > 0 ? 'Resume' : 'Start'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetTimer}
                      className="gap-1.5 h-9"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  </div>
                </div>

                {/* Physiological benefits */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Glycemic & Cardiovascular Benefit
                  </h4>
                  <p className="text-xs sm:text-sm text-soft leading-relaxed">
                    {selectedItem.benefits}
                  </p>
                </div>

                {/* Safety note */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Safety Directive: </span>
                    {selectedItem.safetyNote}
                  </div>
                </div>

                <div className="text-[11px] text-center text-muted-foreground">
                  Choose activity according to your health condition and healthcare professional&apos;s advice.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
