import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Droplets,
  Heart,
  Leaf,
  Pill,
  Scale,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Zap,
} from 'lucide-react';
import diasynapseLogo from '@/assets/diasynapse-logo.png';
import { FloatingParticles } from '@/components/FloatingParticles';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/services/api.js';
import { clinicalAudio } from '@/lib/clinical-sound';

const write = (key: string, value: string) => {
  try {
    localStorage.setItem('diasynapse-' + key, value);
    sessionStorage.setItem('diasynapse-' + key, value);
  } catch {}
};

const readJson = <T,>(key: string): T | null => {
  try {
    const v = localStorage.getItem('diasynapse-' + key) || sessionStorage.getItem('diasynapse-' + key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};

export function OnboardingWizard() {
  const navigate = useNavigate();
  const existingProfile = useMemo(() => readJson<Record<string, string>>('profile') || {}, []);

  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [submitting, setSubmitting] = useState(false);

  // Form states strictly covering all requested essential diabetes details:
  // 1. age & gender
  // 2. height & weight
  // 3. vegetarian/non-vegetarian
  // 4. energy level
  // 5. diabetes type
  // 6. insulin/medicine use
  const [formData, setFormData] = useState({
    name: existingProfile['name'] || 'Patient',
    age: existingProfile['age'] || '26',
    gender: existingProfile['gender'] || 'Female',
    height: existingProfile['height'] || '168',
    weight: existingProfile['weight'] || '62',
    dietPreference: existingProfile['dietPreference'] || 'Vegetarian', // Vegetarian / Non-Vegetarian
    energyLevel: existingProfile['energyLevel'] || 'Moderate / Steady', // Low, Moderate, High, Fluctuating
    diabetesType: existingProfile['diabetesType'] || 'Type 1',
    medicationType: existingProfile['medicationType'] || 'Insulin',
  });

  // Calculate BMI dynamically
  const bmi = useMemo(() => {
    const h = Number(formData.height) / 100;
    const w = Number(formData.weight);
    if (!h || !w || h <= 0) return null;
    const val = w / (h * h);
    return Number(val.toFixed(1));
  }, [formData.height, formData.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (bmi < 25) return { label: 'Healthy Weight', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese Range', color: 'text-rose-400' };
  }, [bmi]);

  // Step validation
  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return !!formData.age && Number(formData.age) > 0 && !!formData.gender;
      case 2:
        return (
          !!formData.height &&
          Number(formData.height) >= 50 &&
          !!formData.weight &&
          Number(formData.weight) >= 20
        );
      case 3:
        return !!formData.dietPreference;
      case 4:
        return !!formData.energyLevel;
      case 5:
        return !!formData.diabetesType;
      case 6:
        return !!formData.medicationType;
      default:
        return true;
    }
  }, [step, formData]);

  const handleNext = () => {
    try {
      clinicalAudio.playClick();
    } catch {}

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      try {
        clinicalAudio.playClick();
      } catch {}
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    const updatedProfile = {
      ...existingProfile,
      ...formData,
      bmi: bmi ? String(bmi) : undefined,
    };

    write('profile', JSON.stringify(updatedProfile));

    try {
      await updateProfile({
        name: formData.name,
        diabetesType: formData.diabetesType,
        medicationType: formData.medicationType,
      });
    } catch (err) {
      console.warn('Backend profile update note:', err);
    }

    try {
      clinicalAudio.playConfirm();
    } catch {}

    navigate({ to: '/dashboard' });
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Ambient background particles */}
      <FloatingParticles />

      {/* Top Header Bar */}
      <header className="relative z-10 mx-auto w-full max-w-2xl flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e0717] border border-primary/40 shadow-md p-1.5">
            <img
              src={diasynapseLogo}
              alt="DiaSynapse Logo"
              className="h-full w-full object-contain filter drop-shadow-[0_0_8px_rgba(224,51,117,0.4)]"
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-foreground">
              Dia<span className="text-primary font-bold">Synapse</span>
            </span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Clinical Telemetry Intake
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-primary">
            Step {step} of {totalSteps}
          </span>
          <div className="mt-1 h-1.5 w-28 bg-secondary/80 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-primary to-[#e03375] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(224,51,117,0.6)]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Centered Clinical Card */}
      <main className="relative z-10 mx-auto w-full max-w-xl my-auto py-8">
        <div className="rounded-2xl border border-border/90 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-primary/10 transition-all duration-300">
          {/* STEP 1: AGE & GENDER */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <User className="h-3 w-3" />
                  <span>Demographics</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Patient Age & Gender</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Essential for basal metabolic rate calculation and hormonal glycemic variability.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    Your Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="field text-sm font-semibold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-2">
                    Biological Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {['Female', 'Male', 'Non-binary', 'Other'].map((g) => {
                      const selected = formData.gender === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g })}
                          className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            selected
                              ? 'border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/40'
                              : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Hormonal fluctuations and age-linked insulin sensitivity modulate carbohydrate-to-insulin ratios and glycemic response curves.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: HEIGHT & WEIGHT */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <Scale className="h-3 w-3" />
                  <span>Physical Biometrics</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Height & Weight</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Establishes Body Mass Index (BMI) and carbohydrate distribution volume.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="field text-sm font-semibold"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/90 mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="350"
                    placeholder="65"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="field text-sm font-semibold"
                  />
                </div>
              </div>

              {bmi && bmiCategory && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Calculated BMI
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-foreground">{bmi}</span>
                      <span className="text-xs text-muted-foreground">kg/m²</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg bg-card/80 border border-border ${bmiCategory.color}`}
                  >
                    {bmiCategory.label}
                  </span>
                </div>
              )}

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Our ML model calibrates glycemic excursion amplitude and active insulin distribution parameters using your biometric ratio.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: VEGETARIAN / NON-VEGETARIAN */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <Leaf className="h-3 w-3" />
                  <span>Dietary Pattern</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Dietary Preference</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select your daily nutritional foundation for meal AI vision and carbohydrate breakdown.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'Vegetarian',
                    title: 'Vegetarian',
                    desc: 'Plant-based, lentils, legumes, paneer/dairy, vegetables, and grains.',
                    tag: 'Plant-buffered glycemic profile',
                    icon: <Leaf className="h-5 w-5 text-emerald-400" />,
                  },
                  {
                    value: 'Non-Vegetarian',
                    title: 'Non-Vegetarian',
                    desc: 'Poultry, fish, seafood, eggs, meat, vegetables, and mixed proteins.',
                    tag: 'Protein-fat delayed gastric rate',
                    icon: <Activity className="h-5 w-5 text-primary" />,
                  },
                ].map((item) => {
                  const selected = formData.dietPreference === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietPreference: item.value })}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/15 shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-secondary/30 hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-lg bg-secondary/80 border border-border">
                            {item.icon}
                          </span>
                          <span className="text-sm font-bold text-foreground">{item.title}</span>
                        </div>
                        {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                      <span className="mt-2.5 inline-block text-[10px] font-semibold text-primary/90 bg-primary/10 px-2 py-0.5 rounded">
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  High-protein/fat meals (non-veg) cause delayed late glycemic rises (3-5 hours), whereas vegetarian plant starches absorb with distinct peak timelines.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: DAILY ENERGY LEVEL */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <Zap className="h-3 w-3" />
                  <span>Metabolic Stamina</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Typical Energy Level</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  How does your physical stamina feel on an ordinary daily basis?
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'Low / Fatigued',
                    title: 'Low / Fatigued',
                    desc: 'Frequent lethargy, sluggishness after eating, or low morning stamina.',
                  },
                  {
                    value: 'Moderate / Steady',
                    title: 'Moderate / Steady',
                    desc: 'Balanced stamina throughout the day with manageable afternoon dips.',
                  },
                  {
                    value: 'High / Active',
                    title: 'High / Active',
                    desc: 'Strong stamina, high daily physical movement or structured exercise.',
                  },
                  {
                    value: 'Fluctuating',
                    title: 'Fluctuating / Variable',
                    desc: 'Noticeable spikes and sudden fatigue crashes correlating with meals.',
                  },
                ].map((item) => {
                  const selected = formData.energyLevel === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, energyLevel: item.value })}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/15 shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-secondary/30 hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Energy dips frequently precede or correlate with rapid glycemic velocity drops. This empowers our clinical warning engine.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: DIABETES TYPE */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Clinical Classification</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Diabetes Classification</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configures reference target ranges and glycemic variability thresholds.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'Type 1',
                    title: 'Type 1 Diabetes',
                    desc: 'Autoimmune beta-cell destruction; exogenous insulin dependent.',
                  },
                  {
                    value: 'Type 2',
                    title: 'Type 2 Diabetes',
                    desc: 'Insulin resistance with relative insulin secretory defect.',
                  },
                  {
                    value: 'Pre-diabetes',
                    title: 'Pre-diabetes / Impaired Glycemia',
                    desc: 'Elevated fasting blood sugar or HbA1c; preventive lifestyle focus.',
                  },
                  {
                    value: 'Gestational',
                    title: 'Gestational Diabetes',
                    desc: 'Carbohydrate intolerance developing during pregnancy.',
                  },
                ].map((item) => {
                  const selected = formData.diabetesType === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, diabetesType: item.value })}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/15 shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-secondary/30 hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                        {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  International consensus targets (TIR 70-180 mg/dL) automatically calibrate to your clinical category.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: INSULIN / MEDICINE USE */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-250">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
                  <Droplets className="h-3 w-3" />
                  <span>Therapeutic Regimen</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Insulin & Medicine Use</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  What medication does your current medical management plan include?
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: 'Insulin',
                    title: 'Insulin Only',
                    desc: 'Injections (pens/syringes) or continuous insulin infusion pump.',
                    icon: <Droplets className="h-5 w-5 text-primary" />,
                  },
                  {
                    value: 'Tablets',
                    title: 'Oral Tablets / Metformin',
                    desc: 'Prescription oral hypoglycemic tablets (Metformin, SGLT2i, etc.).',
                    icon: <Pill className="h-5 w-5 text-amber-400" />,
                  },
                  {
                    value: 'Both Insulin & Tablets',
                    title: 'Both Insulin & Tablets',
                    desc: 'Combination therapy with both injectable insulin and oral medication.',
                    icon: <ShieldCheck className="h-5 w-5 text-cyan-400" />,
                  },
                  {
                    value: 'Neither',
                    title: 'Lifestyle & Diet Only',
                    desc: 'Managed strictly through nutrition, exercise, and physical lifestyle.',
                    icon: <Heart className="h-5 w-5 text-emerald-400" />,
                  },
                ].map((item) => {
                  const selected = formData.medicationType === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, medicationType: item.value })}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                        selected
                          ? 'border-primary bg-primary/15 shadow-md ring-1 ring-primary/40'
                          : 'border-border bg-secondary/30 hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-secondary/80 border border-border">
                          {item.icon}
                        </span>
                        <span className="text-xs font-bold text-foreground">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                <Stethoscope className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  This activates the Insulin Awareness module (insulin-on-board calculations) and the Tablet Adherence section on your dashboard.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-border/60 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={step === 1 || submitting}
              onClick={handleBack}
              className="text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              <span>Back</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={!isStepValid || submitting}
              onClick={handleNext}
              className="text-xs font-bold shadow-md shadow-primary/20 px-5"
            >
              {submitting ? (
                'Finalizing Setup...'
              ) : step === totalSteps ? (
                <>
                  <span>Complete & Launch Dashboard</span>
                  <Check className="ml-1.5 h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Footer Legal & Compliance */}
      <footer className="relative z-10 text-center py-3 text-[11px] text-muted-foreground/60 border-t border-border/40">
        DiaSynapse &middot; Clinical AI Telemetry &middot; Tailored for Patient Safety
      </footer>
    </div>
  );
}
