import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  Database,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Footprints,
  Heart,
  ImagePlus,
  Info,
  LayoutDashboard,
  Leaf,
  Loader2,
  LogOut,
  Menu,
  Moon,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  UserRound,
  Utensils,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import atmosphere from '@/assets/medical-atmosphere.jpg';
import diasynapseLogo from '@/assets/diasynapse-logo.png';
import {
  predictGlucose,
  logGlucose,
  analyzeMeal,
  checkMedication,
  getProgressReport,
  getDashboardData,
  runCareCheck,
  loginUser,
  registerUser,
  getMe,
  updateProfile,
} from '@/services/api.js';
import type { MealAgentContext } from '@/services/api.js';
import { FloatingParticles } from '@/components/FloatingParticles';
import { clinicalAudio } from '@/lib/clinical-sound';
import { TabletMedicationSection } from '@/components/TabletMedicationSection';
import { DiaSynapseAiInsightCard } from '@/components/DiaSynapseAiInsightCard';
import { FoodGuideSection } from '@/components/FoodGuideSection';
import { ExerciseActivitySection } from '@/components/ExerciseActivitySection';
import { ClinicalReportView } from '@/components/ClinicalReportView';
import { SplashScreen } from '@/components/SplashScreen';
import { AuthPage } from '@/components/AuthPage';
import { OnboardingWizard } from '@/components/OnboardingWizard';

type Page =
  | 'dashboard'
  | 'meal'
  | 'glucose'
  | 'insulin'
  | 'progress'
  | 'food'
  | 'wellness'
  | 'profile'
  | 'settings';

type Entry = { value: string; time: string };

const appNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/meal', label: 'Meal', icon: Utensils },
  { to: '/glucose', label: 'Glucose Forecast', icon: TrendingUp },
  { to: '/insulin', label: 'Insulin Awareness', icon: Clock3 },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/food', label: 'Food Guide', icon: Leaf },
  { to: '/wellness', label: 'Wellness', icon: Heart },
  { to: '/profile', label: 'Profile', icon: UserRound },
] as const;

// Storage helpers
const read = (key: string) => {
  try {
    return localStorage.getItem('diasynapse-' + key) || sessionStorage.getItem('diasynapse-' + key) || '';
  } catch {
    return '';
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem('diasynapse-' + key, value);
    sessionStorage.setItem('diasynapse-' + key, value);
  } catch {}
};
const readJson = <T,>(key: string): T | null => {
  try {
    const v = read(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};

type MealAgentSnapshot = {
  total_estimated_carbs_g: number;
  context: MealAgentContext;
};

const toMealAgentSnapshot = (meal: any): MealAgentSnapshot | null => {
  const totalCarbs = Number(meal?.total_estimated_carbs_g);
  if (meal?.total_estimated_carbs_g == null || !Number.isFinite(totalCarbs)) return null;

  const source = meal?.context ?? meal;
  const items = Array.isArray(source?.items)
    ? source.items
        .filter(
          (item: any) =>
            typeof item?.food_name === 'string' && Number.isFinite(Number(item.estimated_carbs_g))
        )
        .map((item: any) => ({
          food_name: item.food_name,
          estimated_carbs_g: Number(item.estimated_carbs_g),
          matched_database_dish: item.matched_database_dish ?? null,
          source: item.source ?? null,
        }))
    : [];

  return {
    total_estimated_carbs_g: totalCarbs,
    context: {
      items,
      gemini_confidence: source.gemini_confidence ?? meal.gemini_confidence ?? null,
      timestamp: source.timestamp ?? meal.timestamp ?? null,
    },
  };
};

const latestMealAnalysisStorageKey = () => {
  const email = readJson<Record<string, string>>('profile')?.['email']?.trim().toLowerCase();
  return email ? `meal_analysis_${email}` : 'meal_analysis';
};

const readLatestMealAnalysis = () =>
  toMealAgentSnapshot(readJson<any>(latestMealAnalysisStorageKey()));

const saveLatestMealAnalysis = (meal: any) => {
  const snapshot = toMealAgentSnapshot(meal);
  if (snapshot) {
    write(
      latestMealAnalysisStorageKey(),
      JSON.stringify({
        items: snapshot.context.items,
        total_estimated_carbs_g: snapshot.total_estimated_carbs_g,
        gemini_confidence: snapshot.context.gemini_confidence,
        timestamp: snapshot.context.timestamp,
      })
    );
  }
  return snapshot;
};

const toMealAnalysisResult = (snapshot: MealAgentSnapshot | null) =>
  snapshot
    ? {
        ...snapshot.context,
        total_estimated_carbs_g: snapshot.total_estimated_carbs_g,
      }
    : null;

const titleMeta = (title: string, description: string) => ({
  meta: [
    { title: `${title} | DiaSynapse` },
    { name: 'description', content: description },
    { property: 'og:title', content: `${title} | DiaSynapse` },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
});
export { titleMeta };

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="DiaSynapse home" className="inline-flex shrink-0 items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d0d0d] shadow-md select-none overflow-hidden p-1">
        <img
          src={diasynapseLogo}
          alt="DiaSynapse logo"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      {!compact && (
        <span className="font-extrabold text-xl tracking-tight text-foreground select-none">
          Dia<span className="text-primary font-bold">Synapse</span>
        </span>
      )}
    </Link>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const token = read('token');

  return (
    <header className="relative z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="section-shell flex h-[78px] items-center justify-between gap-5">
        <Brand />
        <nav className="hidden items-center gap-7 lg:flex text-[13px] font-semibold text-soft">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link to="/food" className="hover:text-foreground transition-colors">
            Food Guide
          </Link>
          <Link to="/wellness" className="hover:text-foreground transition-colors">
            Wellness
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          {token ? (
            <Button asChild size="default">
              <Link to="/dashboard">
                Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild size="default">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="section-shell flex flex-col gap-1 border-t border-border py-4 lg:hidden">
          {(
            [
              ['/', 'Home'],
              ['/dashboard', 'Dashboard'],
              ['/about', 'How It Works'],
              ['/food', 'Food Guide'],
              ['/wellness', 'Wellness'],
              ['/login', 'Log in'],
              ['/signup', 'Get Started'],
            ] as const
          ).map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm text-soft hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="section-shell flex flex-col gap-6 py-9 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <Brand compact />
        <p className="text-xs sm:text-sm">
          DiaSynapse — AI Clinical Companion for Situational Awareness. Does not provide medical diagnoses.
        </p>
        <div className="flex gap-5 text-xs sm:text-sm">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/food" className="hover:text-foreground transition-colors">
            Food Guide
          </Link>
          <Link to="/wellness" className="hover:text-foreground transition-colors">
            Wellness
          </Link>
        </div>
      </div>
    </footer>
  );
}

function AppShell({ children, page }: { children: React.ReactNode; page: Page }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [diabetesType, setDiabetesType] = useState('Type 1');
  const [medicationType, setMedicationType] = useState('Insulin');

  useEffect(() => {
    const profile = readJson<Record<string, string>>('profile');
    if (profile?.['name']) setUserName(profile['name']);
    if (profile?.['diabetesType']) setDiabetesType(profile['diabetesType']);
    if (profile?.['medicationType']) setMedicationType(profile['medicationType']);

    const token = read('token');
    if (token) {
      getMe()
        .then((res) => {
          if (res?.user) {
            setUserName(res.user.name || '');
            if (res.user.diabetesType) setDiabetesType(res.user.diabetesType);
            if (res.user.medicationType) setMedicationType(res.user.medicationType);
            write('profile', JSON.stringify({ ...profile, ...res.user }));
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('diasynapse-token');
    sessionStorage.removeItem('diasynapse-token');
    localStorage.removeItem('diasynapse_token');
    sessionStorage.removeItem('diasynapse_token');
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient slowly moving floating medical cell/particles */}
      <FloatingParticles />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden h-full w-[260px] shrink-0 flex-col border-r border-border bg-card/75 backdrop-blur-md lg:flex overflow-y-auto">
          <div className="border-b border-border px-6 py-4.5">
            <Brand />
          </div>

          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-secondary/50 p-2.5 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
                {(userName || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">{userName || 'Patient'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{diabetesType} &middot; {medicationType}</p>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4">
            <p className="eyebrow">Your space</p>
          </div>

          <nav className="mt-2.5 flex flex-1 flex-col gap-1 px-3 overflow-y-auto">
            {appNav.map((item) => {
              const active = page === item.to.slice(1);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition-all ${
                    active
                      ? 'bg-primary/20 text-foreground font-bold shadow-sm border border-primary/30'
                      : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border p-3 space-y-1 bg-card/40">
            <Link
              to="/settings"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors ${
                page === 'settings' ? 'bg-primary/15 text-foreground' : ''
              }`}
            >
              <span>Settings</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors text-left"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area — flex-1 fills remaining width, scrolls independently */}
        <div className="min-w-0 flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {/* Mobile Top Header */}
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-5 lg:hidden">
            <Brand compact />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
          </header>

          {/* Mobile Overlay Menu */}
          {open && (
            <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg lg:hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <Brand compact />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-5 overflow-y-auto">
                {appNav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 border-b border-border/60 py-3.5 text-base font-medium text-foreground hover:text-primary"
                  >
                    <item.icon className="h-5 w-5 text-primary" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="py-3.5 text-base text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="py-3.5 text-left text-base text-destructive hover:underline"
                >
                  Log out
                </button>
              </nav>
            </div>
          )}

          <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pb-24 pt-6 sm:px-8 lg:px-10 lg:pt-8 min-h-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Strip */}
      <nav className="fixed bottom-0 z-30 grid h-16 w-full grid-cols-5 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden">
        {[appNav[0], appNav[1], appNav[2], appNav[4], appNav[7]].map((item) => {
          const active = page === item.to.slice(1);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                active ? 'text-primary font-bold' : 'text-muted-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-[650px] text-xs sm:text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function Empty({
  icon: Icon = Activity,
  title,
  text,
  action,
}: {
  icon?: typeof Activity;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary/80 border border-border">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm sm:text-base text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-[340px] text-xs leading-5 text-muted-foreground">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function SectionHeading({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail?: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border bg-card/40 px-6 py-4">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h2 className="text-xs sm:text-sm font-bold text-foreground">{title}</h2>
      </div>
      {detail && <span className="text-[11px] text-muted-foreground">{detail}</span>}
    </div>
  );
}

function useStored<T>(key: string) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    setValue(readJson<T>(key));
  }, [key]);
  const update = (next: T | null) => {
    setValue(next);
    write(key, next ? JSON.stringify(next) : '');
  };
  return [value, update] as const;
}

// -------------------------------------------------------------
// 1. HOME LANDING
// -------------------------------------------------------------
const steps = [
  { n: '01', title: 'Create your profile', detail: 'Start with the essentials and personal context.' },
  { n: '02', title: 'Explore your meals', detail: 'Understand what goes into your day with AI and nutrition RAG.' },
  { n: '03', title: 'Connect the context', detail: 'Bring glucose dynamics and insulin timing together.' },
  { n: '04', title: 'See the bigger picture', detail: 'Follow 30-min forecasts and clinical progress.' },
];

const features = [
  {
    icon: Utensils,
    title: 'Meal intelligence',
    text: 'Analyze meal photos with Gemini 3.6 Flash vision and cross-reference with our clinical nutrition database.',
  },
  {
    icon: TrendingUp,
    title: 'Glucose forecast',
    text: 'Predict glucose levels 30 minutes ahead using trained XGBoost ML models and historical glycemic trends.',
  },
  {
    icon: Clock3,
    title: 'Insulin awareness',
    text: 'Calculate active insulin percentages and maintain timing awareness to prevent stacking.',
  },
  {
    icon: BarChart3,
    title: 'Progress tracking',
    text: 'Firebase-backed telemetry surveillance tracking averages, time-in-range, and glycemic trajectories.',
  },
];

export function Home() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    // Always show splash on first load of home page
    const t = setTimeout(() => setSplash(false), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {splash && <SplashScreen onComplete={() => setSplash(false)} />}
      <Nav />
      <main>
        <section className="relative min-h-[580px] overflow-hidden lg:min-h-[660px]">
          <img
            src={atmosphere}
            alt="Biological backdrop"
            className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
            width={1600}
            height={1008}
          />
          <div className="hero-surface absolute inset-0" />
          <div className="section-shell relative flex min-h-[580px] flex-col justify-center py-20 lg:min-h-[660px]">
            <div className="max-w-[690px]">
              <p className="eyebrow mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" /> A more connected way to care
              </p>
              <h1 className="max-w-[720px] text-[clamp(2.5rem,5.2vw,4.8rem)] font-extrabold leading-[1.12]">
                Understand Your Glucose.
                <br />
                <span className="text-soft">Manage Your Day.</span>
              </h1>
              <p className="mt-6 max-w-[570px] text-base leading-8 text-soft md:text-lg">
                DiaSynapse brings meal insights, machine-learning glucose forecasts, active insulin awareness,
                and progress tracking into one connected, dynamic clinical companion.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="h-12 px-7 shadow-lg shadow-primary/20">
                  <Link to="/signup">
                    Get Started <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 border-border bg-card/60 backdrop-blur-sm"
                >
                  <Link to="/about">
                    See How It Works <ArrowDownRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <span className="absolute bottom-0 left-0 h-[3px] w-1/3 brand-rule" />
        </section>

        <section className="border-b border-border bg-card/55">
          <div className="section-shell py-14 md:py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-2">A connected experience</p>
                <h2 className="text-2xl font-bold md:text-3xl">Your Daily Diabetes Journey</h2>
              </div>
              <p className="max-w-[390px] text-sm leading-6 text-muted-foreground">
                One thoughtful path from everyday meals and insulin doses to a clearer picture of your health.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {steps.map((s, i) => (
                <div key={s.n} className="relative border-t border-border pt-5 md:border-t-2">
                  <div className="absolute -top-[5px] left-0 h-2 w-2 rounded-full bg-primary" />
                  <div className="mb-4 flex items-center justify-between text-xs font-bold text-primary">
                    <span>{s.n}</span>
                    {i < 3 && <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />}
                  </div>
                  <h3 className="font-bold text-base">{s.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell py-20 md:py-28">
          <div className="mb-12 max-w-[610px]">
            <p className="eyebrow mb-2">Designed around real life</p>
            <h2 className="text-3xl font-bold md:text-4xl">A clearer picture, in one place.</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Each clinical component is connected directly to our FastAPI intelligence backend.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group bg-card p-7 transition-colors hover:bg-secondary/70">
                <f.icon className="mb-8 h-6 w-6 text-primary" strokeWidth={1.7} />
                <h3 className="font-bold text-base">{f.title}</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-6 text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// 2. DASHBOARD (CONNECTED DYNAMIC DATA)
// -------------------------------------------------------------
export function Dashboard() {
  const [userName, setUserName] = useState('Patient');
  const [diabetesType, setDiabetesType] = useState('Type 1');
  const [loading, setLoading] = useState(true);

  // Quick reading modal
  const [showAddReading, setShowAddReading] = useState(false);
  const [glucoseInput, setGlucoseInput] = useState('');
  const [addingReading, setAddingReading] = useState(false);
  const [readingError, setReadingError] = useState('');

  // Normalized Telemetry State — all null until real backend data arrives
  const [latestForecast, setLatestForecast] = useState<number | null>(null);
  const [activeInsulin, setActiveInsulin] = useState<number | null>(null);
  const [nextDoseText, setNextDoseText] = useState<string | null>(null);
  const [trendStatus, setTrendStatus] = useState<string | null>(null);
  const [avgComparison, setAvgComparison] = useState<string | null>(null);
  const [lastMealText, setLastMealText] = useState<string | null>(null);
  const [lastMealSub, setLastMealSub] = useState<string | null>(null);
  const [todayInsight, setTodayInsight] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Array<{ text: string; time: string }>>([]);
  const [medicationType, setMedicationType] = useState<string>('Insulin');
  const [currentGlucose, setCurrentGlucose] = useState<number | null>(null);
  const [timeInRange, setTimeInRange] = useState<number | null>(null);
  const [lastMealRawCarbs, setLastMealRawCarbs] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setLatestForecast(null);
      setActiveInsulin(null);
      setNextDoseText(null);
      setTrendStatus(null);
      setAvgComparison(null);
      setLastMealText(null);
      setLastMealSub(null);
      setTodayInsight(null);
      setRecentActivities([]);
      setCurrentGlucose(null);
      setTimeInRange(null);
      setLastMealRawCarbs(null);

      const profile = readJson<Record<string, string>>('profile');
      if (profile?.['name']) setUserName(profile['name']);
      if (profile?.['diabetesType']) setDiabetesType(profile['diabetesType']);
      if (profile?.['medicationType']) setMedicationType(profile['medicationType']);

      const data = await getDashboardData();
      const glucose = data?.glucose;
      const glucoseValue = Number(glucose?.input_glucose);
      if (glucose?.input_glucose != null && Number.isFinite(glucoseValue)) {
        setCurrentGlucose(glucoseValue);
      }
      const forecastValue = Number(glucose?.predicted_glucose_30min);
      if (glucose?.predicted_glucose_30min != null && Number.isFinite(forecastValue)) {
        setLatestForecast(Math.round(forecastValue));
      }

      const report = data?.progress;
      if (report && !report.error) {
        if (report.glucose_trend) setTrendStatus(report.glucose_trend);
        if (report.avg_glucose_period1 != null && report.avg_glucose_period2 != null) {
          setAvgComparison(`${report.avg_glucose_period1} → ${report.avg_glucose_period2} avg`);
        }
        if (report.time_in_range != null) setTimeInRange(report.time_in_range);
      }

      const medication = data?.medication;
      if (medication?.insulin_active_percent != null) {
        setActiveInsulin(Number(medication.insulin_active_percent));
      }
      if (medication?.risk_note) setTodayInsight(medication.risk_note);
      if (medication?.next_scheduled_dose_time) {
        const minutes = Math.max(
          0,
          Math.round((new Date(medication.next_scheduled_dose_time).getTime() - Date.now()) / 60000)
        );
        setNextDoseText(`Next dose in ${Math.floor(minutes / 60)}h ${minutes % 60}m`);
      }

      const meal = data?.meal;
      if (meal?.total_estimated_carbs_g != null) {
        const carbs = String(meal.total_estimated_carbs_g);
        setLastMealRawCarbs(carbs);
        setLastMealText(`${carbs}g carbs`);
        setLastMealSub('Last logged meal');
      }

      setRecentActivities(
        (data?.recent_activities ?? []).map((activity: { text: string; logged_at: string }) => ({
          text: activity.text,
          time: activity.logged_at
            ? new Date(activity.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        }))
      );
    } catch (err) {
      console.warn('Dashboard data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddGlucose = async (e: React.FormEvent) => {
    e.preventDefault();
    const gVal = Number(glucoseInput);
    if (!gVal) return;
    setAddingReading(true);
    setReadingError('');
    try {
      await logGlucose(gVal);
      setLatestForecast(null);
      setCurrentGlucose(gVal);
      setShowAddReading(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setReadingError('Could not save this reading. Check your connection and try again.');
    } finally {
      setAddingReading(false);
    }
  };

  // Range bar marker calculation: 0 to 250 mg/dL clamped to 5% - 95%
  const markerPercent = latestForecast !== null
    ? Math.min(Math.max(((latestForecast - 50) / 200) * 100, 5), 95)
    : null;

  const formattedDate = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <AppShell page="dashboard">
      <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* 1. Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-secondary/30 px-6 py-5">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {formattedDate} &middot; {diabetesType} &middot; {medicationType}
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground">Good day, {userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-border bg-card hover:bg-secondary"
              onClick={() => setShowAddReading(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5 text-primary" /> Log Glucometer Reading
            </Button>
            <Button asChild size="sm" className="h-9 shadow-md shadow-primary/20">
              <Link to="/meal">+ Log a meal</Link>
            </Button>
          </div>
        </div>

        {/* 2. Hero Glucose Outlook Section */}
        <div className="relative flex flex-wrap items-center justify-between gap-8 bg-gradient-to-r from-[#170e28] via-[#211233] to-[#2e133c] border-b border-border p-6 sm:p-8">
          <div className="flex-1 min-w-[260px]">
            <div className="text-[11px] font-extrabold tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {latestForecast !== null
                ? 'AI 30-MINUTE GLUCOSE FORECAST · ESTIMATED OUTLOOK'
                : currentGlucose !== null
                ? 'LATEST MEASURED GLUCOSE'
                : 'AI 30-MINUTE GLUCOSE FORECAST · ESTIMATED OUTLOOK'}
            </div>
            {latestForecast !== null || currentGlucose !== null ? (
              <>
                <div className="my-2 flex items-baseline gap-3">
                  <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                    {latestForecast ?? currentGlucose}
                  </span>
                  <span className="text-lg font-medium text-soft">mg/dL</span>
                </div>
                <p className="text-xs text-soft/80 mb-5 leading-relaxed max-w-md">
                  {latestForecast !== null
                    ? 'AI-estimated 30-minute outlook derived from your logged data and trained XGBoost ML.'
                    : 'Latest reading entered from your glucometer or CGM.'}
                </p>

                {/* Range Bar */}
                {latestForecast !== null && <div className="relative h-2.5 w-full max-w-[340px] rounded-full bg-secondary/80 overflow-visible border border-border/50">
                  <div className="absolute left-0 top-0 h-2.5 w-[22%] rounded-l-full bg-amber-500/70" />
                  <div className="absolute left-[22%] top-0 h-2.5 w-[46%] bg-emerald-500/80" />
                  <div className="absolute left-[68%] top-0 h-2.5 w-[32%] rounded-r-full bg-primary/80" />
                  {markerPercent !== null && (
                    <div
                      className="absolute top-[-5px] h-5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-500"
                      style={{ left: `${markerPercent}%` }}
                    />
                  )}
                </div>}
                {latestForecast !== null && <div className="mt-2 flex max-w-[340px] justify-between text-[10px] font-semibold text-muted-foreground">
                  <span>Low (&lt;70)</span>
                  <span>In range (70-140)</span>
                  <span>High (&gt;140)</span>
                </div>}
              </>
            ) : loading ? (
              <div className="my-4 flex items-center gap-2 text-soft">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">Fetching clinical telemetry...</span>
              </div>
            ) : (
              <div className="my-4 space-y-1">
                <p className="text-2xl font-bold text-foreground">No forecast available</p>
                <p className="text-xs text-muted-foreground">
                  Use &ldquo;Log Glucometer Reading&rdquo; above to generate your first 30-minute outlook.
                </p>
              </div>
            )}
          </div>

          {/* Biomorphic Pulse Graphic */}
          <div
            className={`h-28 w-28 shrink-0 rounded-full shadow-[0_0_45px_oklch(0.66_0.235_358/35%)] transition-all ${latestForecast !== null ? 'animate-pulse' : 'opacity-35'}`}
            style={{
              background: 'radial-gradient(circle at 40% 35%, oklch(0.72 0.22 358), oklch(0.55 0.20 340) 65%, oklch(0.24 0.05 322) 100%)',
            }}
          />
        </div>

        {/* 3. Three-Column Telemetry Strip */}
        <div className="grid grid-cols-1 divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x bg-card/50">
          <div className="p-5 sm:p-6">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {medicationType === 'Tablets' ? 'ORAL TABLETS' : medicationType === 'Neither' ? 'CARE REGIMEN' : 'ACTIVE INSULIN'}
            </div>
            {medicationType === 'Tablets' ? (
              <>
                <div className="mt-1.5 text-2xl font-bold text-muted-foreground/50">—</div>
                <div className="mt-1 text-xs text-muted-foreground">No medication data yet</div>
              </>
            ) : medicationType === 'Neither' ? (
              <>
                <div className="mt-1.5 text-2xl font-bold text-muted-foreground/50">—</div>
                <div className="mt-1 text-xs text-muted-foreground">No medication data yet</div>
              </>
            ) : activeInsulin !== null ? (
              <>
                <div className="mt-1.5 text-2xl font-bold text-foreground">{activeInsulin}%</div>
                <div className="mt-1 text-xs text-muted-foreground">{nextDoseText ?? 'Log a dose in Insulin Awareness'}</div>
              </>
            ) : (
              <div className="mt-1.5 text-2xl font-bold text-muted-foreground/50">—</div>
            )}
            {medicationType !== 'Tablets' && medicationType !== 'Neither' && activeInsulin === null && (
              <div className="mt-1 text-xs text-muted-foreground">Log a dose to see active insulin</div>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              METABOLIC TREND
            </div>
            {trendStatus !== null ? (
              <>
                <div
                  className={`mt-1.5 text-2xl font-bold ${
                    trendStatus.toLowerCase() === 'worsening'
                      ? 'text-primary'
                      : trendStatus.toLowerCase() === 'improving'
                      ? 'text-emerald-400'
                      : 'text-foreground'
                  }`}
                >
                  {trendStatus}
                </div>
                {avgComparison && <div className="mt-1 text-xs text-muted-foreground">{avgComparison}</div>}
              </>
            ) : (
              <>
                <div className="mt-1.5 text-2xl font-bold text-muted-foreground/50">—</div>
                <div className="mt-1 text-xs text-muted-foreground">No progress data yet</div>
              </>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              LAST MEAL
            </div>
            {lastMealText !== null ? (
              <>
                <div className="mt-1.5 text-2xl font-bold text-foreground">{lastMealText}</div>
                {lastMealSub && <div className="mt-1 text-xs text-muted-foreground">{lastMealSub}</div>}
              </>
            ) : (
              <>
                <div className="mt-1.5 text-2xl font-bold text-muted-foreground/50">—</div>
                <div className="mt-1 text-xs text-muted-foreground">Analyze a meal to populate</div>
              </>
            )}
          </div>
        </div>

        {/* 4. Unified DiaSynapse AI Insight Card */}
        <div className="border-b border-border p-6 bg-secondary/15">
          <DiaSynapseAiInsightCard
            currentGlucose={currentGlucose}
            latestForecast={latestForecast}
            lastMealCarbs={lastMealRawCarbs}
            activeInsulin={activeInsulin}
            nextDoseText={nextDoseText}
            trendStatus={trendStatus}
            timeInRange={timeInRange}
            medicationType={medicationType}
          />
        </div>

        {/* 5. Recent Activity Timeline */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Recent activity</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              className="h-7 text-xs text-muted-foreground"
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Refresh
            </Button>
          </div>
          {recentActivities.length > 0 ? (
            <div className="divide-y divide-border/60">
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 text-xs sm:text-sm text-foreground"
                >
                  <span className="truncate pr-4">{act.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{act.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-xs text-muted-foreground">
              No recent activity yet — start by predicting glucose or logging a meal.
            </p>
          )}
        </div>

        {/* 6. Quick Action Navigation Strip */}
        <div className="grid grid-cols-2 divide-y divide-border border-b border-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x bg-card/60">
          <Button
            asChild
            variant="ghost"
            className="h-14 rounded-none text-xs sm:text-sm font-medium hover:bg-secondary"
          >
            <Link to="/meal">
              <Utensils className="mr-2 h-4 w-4 text-primary" /> Log meal
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-14 rounded-none text-xs sm:text-sm font-medium hover:bg-secondary"
          >
            <Link to="/glucose">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" /> Predict glucose
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-14 rounded-none text-xs sm:text-sm font-medium hover:bg-secondary"
          >
            <Link to="/insulin">
              <Clock3 className="mr-2 h-4 w-4 text-primary" /> Check insulin
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-14 rounded-none text-xs sm:text-sm font-medium hover:bg-secondary"
          >
            <Link to="/progress">
              <BarChart3 className="mr-2 h-4 w-4 text-primary" /> View progress
            </Link>
          </Button>
        </div>

        {/* 7. Lower Contextual Links */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 sm:px-6 bg-card/20 text-xs sm:text-sm">
          <Link
            to="/food"
            className="text-primary font-medium hover:underline flex items-center gap-1.5"
          >
            Explore sugar-friendly meal plans &rarr;
          </Link>
          <Link
            to="/wellness"
            className="text-primary font-medium hover:underline flex items-center gap-1.5"
          >
            Exercises that help lower glucose &rarr;
          </Link>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link
        to="/glucose"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl hover:bg-primary/90 transition-transform active:scale-95"
        title="Predict Glucose"
      >
        <TrendingUp className="h-5 w-5" />
      </Link>

      {/* Quick Add Reading Modal */}
      <Dialog open={showAddReading} onOpenChange={setShowAddReading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add measured glucose reading</DialogTitle>
            <DialogDescription>
              Enter your current reading from your glucometer or CGM to update telemetry and generate a forecast.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGlucose} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Current Glucose (mg/dL)
              </label>
              <input
                className="field"
                type="number"
                min="40"
                max="500"
                required
                value={glucoseInput}
                onChange={(e) => setGlucoseInput(e.target.value)}
              />
            </div>
            {readingError && <p className="text-xs text-destructive">{readingError}</p>}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddReading(false)}
                disabled={addingReading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addingReading}>
                {addingReading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  'Save Reading'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 3. MEAL ANALYSIS (CONNECTED TO GEMINI + RAG BACKEND)
// -------------------------------------------------------------
export function Meal() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setAnalysisResult((current: any) => current ?? toMealAnalysisResult(readLatestMealAnalysis()));
  }, []);

  useEffect(() => {
    if (!file) {
      setUrl('');
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await analyzeMeal(file);
      const snapshot = saveLatestMealAnalysis(res);
      setAnalysisResult(toMealAnalysisResult(snapshot) ?? res);
    } catch (err: any) {
      setError(err?.message || 'Meal analysis failed. Please check the backend connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  const sendToGlucoseForecast = () => {
    if (analysisResult) saveLatestMealAnalysis(analysisResult);
    navigate({ to: '/glucose' });
  };

  return (
    <AppShell page="meal">
      <PageHeader
        eyebrow="Meal intelligence"
        title="Your meals, in context."
        description="Upload a photo to detect food items with Gemini Vision and cross-check real nutritional data from our clinical database."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        {/* Left: Upload Zone */}
        <div className="panel p-6 sm:p-8">
          <h2 className="text-base sm:text-lg font-bold">Add a meal photo</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Select an image from your device or take a photo of your plate.
          </p>

          <label className="relative mt-6 flex min-h-[300px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input bg-secondary/20 text-center hover:border-primary transition-colors">
            {url ? (
              <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg">
                <img src={url} alt="Selected meal preview" className="max-h-[300px] w-full object-contain" />
                {analyzing && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden bg-primary/15 backdrop-blur-[1px]">
                    <div className="scanning-laser absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_oklch(0.66_0.235_358)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/75 px-4 py-2 backdrop-blur-md border border-primary/50 text-xs font-bold text-white flex items-center gap-2 shadow-xl">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Scanning plate & analyzing nutritional contents...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center">
                <UploadCloud className="mb-4 h-12 w-12 text-primary" strokeWidth={1.4} />
                <span className="font-semibold text-sm sm:text-base">Choose or take a meal photo</span>
                <span className="mt-1.5 text-xs text-muted-foreground">JPG, PNG, or WEBP</span>
              </div>
            )}
            <input
              aria-label="Upload meal image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setAnalysisResult(null);
                setError('');
              }}
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {file && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setAnalysisResult(null);
                }}
                disabled={analyzing}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Remove photo
              </Button>
            )}
            <Button
              disabled={!file || analyzing}
              onClick={handleAnalyze}
              className="shadow-md shadow-primary/20"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with Gemini & Nutrition DB...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Meal
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Analysis Results */}
        <div className="panel overflow-hidden">
          <SectionHeading title="Analysis & Nutrition Breakdown" icon={Sparkles} />

          {analysisResult ? (
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-xs text-muted-foreground">Total Estimated Carbohydrates</span>
                  <div className="text-4xl font-extrabold text-foreground mt-1">
                    {analysisResult.total_estimated_carbs_g}{' '}
                    <span className="text-sm font-semibold text-muted-foreground">g</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    AI-Estimated
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1">
                    Confidence: {analysisResult.gemini_confidence || 'High'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Identified Foods & Verified Portions
                </h3>
                <div className="space-y-2">
                  {(analysisResult.items || []).map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                    >
                      <div>
                        <p className="font-bold text-sm text-foreground">{item.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.source === 'nutrition_database' ? (
                            <span className="text-emerald-400 font-medium">✓ Verified in Nutrition DB</span>
                          ) : (
                            'AI Visual Estimate'
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-primary">
                          {item.estimated_carbs_g}g
                        </span>
                        <span className="block text-[11px] text-muted-foreground">carbs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Button onClick={sendToGlucoseForecast} className="w-full">
                  Use in Glucose Forecast <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Saved automatically to Firebase clinical meal logs.
                </p>
              </div>
            </div>
          ) : (
            <Empty
              icon={ImagePlus}
              title="Upload a meal photo to begin analysis."
              text="Detected foods, verified carbohydrates from our nutrition database, and meal logs will appear here."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 4. GLUCOSE FORECAST (CONNECTED TO ML MODEL)
// -------------------------------------------------------------
// Fields the user enters manually
const MANUAL_FORECAST_FIELDS = [
  { key: 'glucose', label: 'Current Glucose', unit: 'mg/dL', min: 20, max: 600, step: 1, placeholder: 'Enter measured glucose' },
  { key: 'insulin_dose', label: 'Insulin Dose Already Taken', unit: 'units', min: 0, max: 100, step: 0.5, placeholder: 'Enter dose, or 0 if none' },
] as const;

// Human-readable day name map
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function Glucose() {
  // Manual user-entered fields only
  const [manualFields, setManualFields] = useState<Record<string, string>>({
    glucose: '',
    insulin_dose: '',
  });
  const [manualLagFields, setManualLagFields] = useState({ previous: '', earlier: '' });
  const [glucoseHistory, setGlucoseHistory] = useState<number[] | null>(null);
  const [historyError, setHistoryError] = useState('');

  // Latest Meal Agent output is context for prediction; the trained model uses its carb total.
  const [mealContext, setMealContext] = useState<MealAgentSnapshot | null>(null);

  // Auto-derived fields (computed from system clock + stored history)
  const autoFields = useMemo(() => {
    const nowInner = new Date();
    const hour = nowInner.getHours();
    const dayOfWeek = nowInner.getDay();
    return { hour, dayOfWeek };
  }, []);

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const cachedMeal = readLatestMealAnalysis();
    if (cachedMeal) setMealContext(cachedMeal);
    getDashboardData()
      .then((data) => {
        const latestMeal = saveLatestMealAnalysis(data?.meal);
        if (latestMeal) setMealContext(latestMeal);
        const history = Array.isArray(data?.glucose_history)
          ? data.glucose_history.filter(
              (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
            )
          : [];
        setGlucoseHistory(history);
        setHistoryError('');
      })
      .catch((err) => {
        console.warn('Glucose history fetch error:', err);
        setHistoryError('Could not load saved glucose history. Refresh the page to try again.');
        setGlucoseHistory([]);
      });
  }, []);

  const hasGlucoseHistory = (glucoseHistory?.length ?? 0) > 0;
  const previousGlucose = hasGlucoseHistory
    ? String(glucoseHistory![glucoseHistory!.length - 1])
    : manualLagFields.previous;
  const earlierGlucose = hasGlucoseHistory
    ? glucoseHistory!.length > 1
      ? String(glucoseHistory![glucoseHistory!.length - 2])
      : ''
    : manualLagFields.earlier;

  const isValidNumber = (value: string, min: number, max: number, step = 1) => {
    if (value.trim() === '') return false;
    const number = Number(value);
    const stepValue = (number - min) / step;
    return (
      Number.isFinite(number) &&
      number >= min &&
      number <= max &&
      Math.abs(stepValue - Math.round(stepValue)) < 1e-8
    );
  };
  const missingFields = [
    !isValidNumber(manualFields.glucose, 20, 600) && 'current glucose',
    !isValidNumber(manualFields.insulin_dose, 0, 100, 0.5) && 'insulin dose',
    !isValidNumber(previousGlucose, 20, 600) && 'previous glucose reading',
    !isValidNumber(earlierGlucose, 20, 600) && 'earlier glucose reading',
  ].filter((field): field is string => Boolean(field));
  const missingNonHistoryFields = missingFields.filter((field) => field !== 'earlier glucose reading');
  const readinessMessage =
    glucoseHistory === null
      ? historyError || 'Loading saved glucose history before prediction can be enabled.'
      : hasGlucoseHistory && glucoseHistory.length < 2
      ? [
          missingNonHistoryFields.length > 0
            ? `Enter valid numbers for ${missingNonHistoryFields.join(', ')}.`
            : '',
          'Log another glucose reading to enable prediction.',
        ]
          .filter(Boolean)
          .join(' ')
      : `Enter valid numbers for ${missingFields.join(', ')} to enable prediction.`;

  // Merged payload for the ML model
  const allFields = useMemo(() => ({
    glucose: manualFields['glucose'],
    carbs: mealContext?.total_estimated_carbs_g ?? null,
    insulin_dose: manualFields['insulin_dose'],
    hour: String(autoFields.hour),
    day_of_week: String(autoFields.dayOfWeek),
    glucose_lag_1: previousGlucose,
    glucose_lag_6: earlierGlucose,
                meal_context: mealContext?.context ?? null,
  }), [manualFields, autoFields, mealContext, previousGlucose, earlierGlucose]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (missingFields.length > 0) return;
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(allFields).map(([k, v]) => [
          k,
          v == null ? null : typeof v === 'object' ? v : Number(v),
        ])
      );
      const response = await predictGlucose(payload);
      const n =
        typeof response === 'number'
          ? response
          : Number(
              response?.predicted_glucose_30min ??
                response?.predicted_glucose ??
                response?.prediction
            );
      if (!Number.isFinite(n)) {
        throw new Error('The service returned an unexpected prediction result.');
      }
      setResult(n);
      setGlucoseHistory((history) =>
        history?.length
          ? [...history, Number(manualFields.glucose)]
          : [
              Number(earlierGlucose),
              Number(previousGlucose),
              Number(manualFields.glucose),
            ]
      );
      write('latest_forecast', String(Math.round(n)));
      clinicalAudio.playActionBeep();
    } catch (err: any) {
      setError(err?.message || 'Forecast unavailable. Ensure the backend is reachable.');
    } finally {
      setBusy(false);
    }
  };

  const chartData = useMemo(() => {
    if (result === null) return [];
    return [
      { name: 'Current (Glucometer)', value: Number(manualFields['glucose']) },
      { name: '+15 min (Interim)', value: Math.round((Number(manualFields['glucose']) + result) / 2) },
      { name: '+30 min (AI Forecast)', value: Math.round(result) },
    ];
  }, [result, manualFields, allFields]);

  return (
    <AppShell page="glucose">
      <PageHeader
        eyebrow="AI Predictive Telemetry"
        title="AI 30-Minute Glucose Forecast"
        description="Estimate your 30-minute glycemic trajectory using our trained XGBoost machine learning model. Requires actual glucose measured from your glucometer."
      />

      {/* Clinical Device Context Disclaimer */}
      <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs sm:text-sm text-soft leading-relaxed flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div>
          <span className="font-bold text-foreground">Clinical Device Context: </span>
          The starting baseline must be entered from your physical glucometer or continuous glucose monitor (CGM). DiaSynapse integrates your actual glucometer reading, meal carbohydrate analysis, and medication timing with trained XGBoost machine learning to project your estimated 30-minute trajectory. DiaSynapse does not claim to measure glucose without a glucometer.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        {/* Input Form */}
        <form className="panel p-6 sm:p-8" onSubmit={handlePredict}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base sm:text-lg font-bold">Forecast Inputs</h2>
          </div>

          {/* ── Manual editable inputs ── */}
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">Your entries</p>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {MANUAL_FORECAST_FIELDS.map(({ key, label, unit, min, max, step, placeholder }) => (
              <label key={key} className="block text-xs sm:text-sm font-semibold">
                {label}
                <span className="ml-1 font-normal text-muted-foreground">({unit})</span>
                <input
                  className="field mt-1.5"
                  type="number"
                  required
                  min={min}
                  max={max}
                  step={step}
                  placeholder={placeholder}
                  value={manualFields[key] ?? ''}
                  onChange={(e) => setManualFields({ ...manualFields, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          {/* ── Auto-generated read-only fields ── */}
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">System-generated (read-only)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Carbohydrates — from Meal Analysis */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Carbohydrates</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {mealContext ? mealContext.total_estimated_carbs_g : 'No meal data'}
                  {mealContext && <span className="text-sm font-normal text-muted-foreground ml-1">g</span>}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {mealContext ? 'From Meal Analysis' : 'No meal logged yet'}
                </p>
                {mealContext?.context.items.length ? (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {mealContext.context.items.map((item) => item.food_name).join(', ')}
                  </p>
                ) : null}
                {mealContext?.context.timestamp && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Analyzed {new Date(mealContext.context.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                <Utensils className="h-3 w-3" /> Meal agent
              </span>
            </div>

            {/* Hour of Day */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Hour of Day</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {autoFields.hour}<span className="text-sm font-normal text-muted-foreground ml-1">/23</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {autoFields.hour < 12 ? 'Morning' : autoFields.hour < 17 ? 'Afternoon' : autoFields.hour < 21 ? 'Evening' : 'Night'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Clock className="h-3 w-3" /> Auto
              </span>
            </div>

            {/* Day of Week */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Day of Week</p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {DAY_NAMES[autoFields.dayOfWeek]}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Index {autoFields.dayOfWeek} (Sun=0)</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                <Clock className="h-3 w-3" /> Auto
              </span>
            </div>

            {/* Previous Glucose */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="previous-glucose" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Previous Glucose Reading (mg/dL)</label>
                <input
                  id="previous-glucose"
                  className="field mt-1.5"
                  type="number"
                  min="20"
                  max="600"
                  step="1"
                  required
                  readOnly={glucoseHistory === null || hasGlucoseHistory}
                  value={previousGlucose}
                  onChange={(e) => setManualLagFields({ ...manualLagFields, previous: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {glucoseHistory === null
                    ? historyError ? 'History unavailable' : 'Loading saved readings...'
                    : hasGlucoseHistory
                    ? 'From glucose history'
                    : historyError
                    ? 'History unavailable; enter manually.'
                    : 'First time? Enter your last two readings.'}
                </p>
              </div>
              <span className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <Database className="h-3 w-3" /> {hasGlucoseHistory ? 'Auto' : 'Manual'}
              </span>
            </div>

            {/* Earlier Glucose */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="earlier-glucose" className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Earlier Glucose Reading (mg/dL)</label>
                <input
                  id="earlier-glucose"
                  className="field mt-1.5"
                  type="number"
                  min="20"
                  max="600"
                  step="1"
                  required
                  readOnly={glucoseHistory === null || hasGlucoseHistory}
                  value={earlierGlucose}
                  onChange={(e) => setManualLagFields({ ...manualLagFields, earlier: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {glucoseHistory === null
                    ? historyError ? 'History unavailable' : 'Loading saved readings...'
                    : hasGlucoseHistory
                    ? glucoseHistory.length > 1
                      ? 'From glucose history'
                      : 'Waiting for another saved reading'
                    : historyError
                    ? 'History unavailable; enter manually.'
                    : 'First time? Enter your last two readings.'}
                </p>
              </div>
              <span className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <Database className="h-3 w-3" /> {hasGlucoseHistory ? 'Auto' : 'Manual'}
              </span>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
            System-generated fields are derived from your device clock and recorded glucose history. Only your manual entries above can be edited.
          </p>

          <Button type="submit" className="mt-6" disabled={busy || missingFields.length > 0}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Computing ML Prediction...
              </>
            ) : (
              <>
                Predict Glucose <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {missingFields.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground" role="status">
              {readinessMessage}
            </p>
          )}
          {error && <p className="mt-4 text-xs font-semibold text-destructive">{error}</p>}
        </form>

        {/* Prediction Display */}
        <div className="panel overflow-hidden">
          <SectionHeading title="AI 30-Minute Glucose Forecast" icon={TrendingUp} />

          {result !== null ? (
            <div className="p-6 sm:p-7">
              <span className="eyebrow">AI-Estimated 30-Minute Forecast &middot; XGBoost</span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-extrabold text-foreground">{Math.round(result)}</span>
                <span className="text-base text-muted-foreground">mg/dL</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    result >= 70 && result <= 140
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : result > 140
                      ? 'bg-primary/20 text-primary'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {result >= 70 && result <= 140
                    ? 'In Target Range (70-140)'
                    : result > 140
                    ? 'Elevated (>140)'
                    : 'Low (<70)'}
                </span>
                <span className="text-xs text-muted-foreground">
                  Trajectory Delta: {result >= Number(manualFields['glucose']) ? '+' : ''}
                  {Math.round(result - Number(manualFields['glucose']))} mg/dL
                </span>
              </div>

              <div className="mt-6 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis
                      stroke="var(--muted-foreground)"
                      fontSize={11}
                      domain={['dataMin - 15', 'dataMax + 15']}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      fill="url(#forecastFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                This is an algorithmic estimate for situational awareness and does not replace medical diagnostics or clinical decision-making.
              </p>
            </div>
          ) : (
            <Empty
              icon={TrendingUp}
              title="No forecast yet"
              text="Fill in your values and click Predict Glucose to run the model."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 5. INSULIN AWARENESS (CONNECTED TO MEDICATION AGENT)
// -------------------------------------------------------------
export function Insulin() {
  const [record, setRecord] = useStored<{ dose: string; time: string }>('insulin');
  const [lastDoseTime, setLastDoseTime] = useState('');
  const [nextScheduledTime, setNextScheduledTime] = useState('');
  const [mealContext, setMealContext] = useState<MealAgentSnapshot | null>(null);
  const [mealDataLoading, setMealDataLoading] = useState(true);
  const [mealDataError, setMealDataError] = useState(false);
  const [doseUnits, setDoseUnits] = useState('');
  const [busy, setBusy] = useState(false);
  const [awarenessResult, setAwarenessResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [clockNow, setClockNow] = useState<number | null>(null);

  const [medType, setMedType] = useState<string>(() => {
    const prof = readJson<Record<string, string>>('profile');
    return prof?.['medicationType'] || 'Both Insulin & Tablets';
  });

  useEffect(() => {
    let cancelled = false;
    const cachedMeal = readLatestMealAnalysis();
    if (cachedMeal) setMealContext(cachedMeal);
    getDashboardData()
      .then((data) => {
        if (!cancelled) {
          const latestMeal = saveLatestMealAnalysis(data?.meal);
          if (latestMeal) setMealContext(latestMeal);
          setMealDataError(false);
        }
      })
      .catch((err) => {
        console.warn('Meal data fetch error:', err);
        if (!cancelled) setMealDataError(true);
      })
      .finally(() => {
        if (!cancelled) setMealDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateClock = () => setClockNow(Date.now());
    updateClock();
    const intervalId = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleCheckAwareness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await checkMedication({
        last_dose_time: new Date(lastDoseTime).toISOString(),
        next_scheduled_dose_time: new Date(nextScheduledTime).toISOString(),
        meal_carbs: mealContext?.total_estimated_carbs_g ?? null,
        dose_units: Number(doseUnits),
        meal_context: mealContext?.context ?? null,
      });

      setAwarenessResult(res);
      write('last_dose_time', new Date(lastDoseTime).toISOString());
      write('next_dose_time', new Date(nextScheduledTime).toISOString());

      setRecord({
        dose: doseUnits,
        time: new Date(lastDoseTime).toISOString(),
      });
      clinicalAudio.playActionBeep();
    } catch (err: any) {
      setError(err?.message || 'Medication awareness service unavailable.');
    } finally {
      setBusy(false);
    }
  };

  const lastDoseTimestamp = lastDoseTime ? new Date(lastDoseTime).getTime() : Number.NaN;
  const nextDoseTimestamp = nextScheduledTime ? new Date(nextScheduledTime).getTime() : Number.NaN;
  const elapsedMinutes =
    clockNow !== null && Number.isFinite(lastDoseTimestamp)
      ? Math.max(0, (clockNow - lastDoseTimestamp) / 60000)
      : null;
  const elapsedHours = elapsedMinutes === null ? '—' : (elapsedMinutes / 60).toFixed(1);
  const activityWindowMinutes = Number(awarenessResult?.insulin_duration_minutes);
  const durationMinutes =
    Number.isFinite(activityWindowMinutes) && activityWindowMinutes > 0
      ? activityWindowMinutes
      : 4 * 60;
  const displayedActivePercent =
    elapsedMinutes === null
      ? null
      : Math.round(
          Math.max(0, Math.min(100, ((durationMinutes - elapsedMinutes) / durationMinutes) * 100)) * 10
        ) / 10;
  const minutesUntilNextDose =
    clockNow !== null && Number.isFinite(nextDoseTimestamp)
      ? Math.max(0, Math.ceil((nextDoseTimestamp - clockNow) / 60000))
      : null;
  const nextDoseCountdown =
    minutesUntilNextDose === null
      ? '—'
      : `${Math.floor(minutesUntilNextDose / 60)}h ${minutesUntilNextDose % 60}m`;
  const nextDoseStatus =
    minutesUntilNextDose === null
      ? null
      : nextDoseTimestamp <= (clockNow ?? 0)
      ? 'Your scheduled dose time has passed. Follow your prescribed care plan.'
      : `Next scheduled dose in ${nextDoseCountdown}.`;

  const isTabletsOnly = medType === 'Tablets';
  const isNeither = medType === 'Neither';
  const isBoth = medType === 'Both Insulin & Tablets';

  return (
    <AppShell page="insulin">
      <PageHeader
        eyebrow="Medication Situational Awareness"
        title={isTabletsOnly ? 'Oral Medication Schedule & Adherence' : isNeither ? 'Medication Surveillance' : 'Insulin & Medication Timing Awareness'}
        description="Monitor schedule alignment and active circulating medication. Follow your physician's prescribed plan."
      />

      {/* Regimen Selector Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Active Medication Plan:</span>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
            {medType}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-1">Switch view:</span>
          {['Insulin', 'Tablets', 'Both Insulin & Tablets', 'Neither'].map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={medType === mode ? 'secondary' : 'ghost'}
              className={`h-7 text-xs font-semibold px-2.5 ${medType === mode ? 'border border-primary/40 text-foreground bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => {
                setMedType(mode);
                const prof = readJson<Record<string, string>>('profile') || {};
                write('profile', JSON.stringify({ ...prof, medicationType: mode }));
              }}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* C) TABLETS ONLY VIEW */}
      {isTabletsOnly && (
        <div className="space-y-6">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-2">
            <div className="flex items-center gap-2.5">
              <Pill className="h-5 w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Your care plan doesn&apos;t currently include insulin.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-soft leading-relaxed">
              Track your tablet schedule and medication adherence here. Follow your prescribed medication plan and consult your doctor if you have questions.
            </p>
          </div>
          <TabletMedicationSection variant="tablets-only" />
        </div>
      )}

      {/* D) NEITHER VIEW */}
      {isNeither && (
        <div className="panel p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Your current profile does not include insulin or tablet medication tracking.
          </h2>
          <p className="text-xs sm:text-sm text-soft leading-relaxed max-w-lg mx-auto">
            Your diabetes care plan is currently centered around dietary choices, physical activity routines, and regular monitoring. You can use our Food Guide and Wellness recommendations to support your daily wellness.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="sm">
              <Link to="/food">Explore Food Guide</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/wellness">View Wellness & Activity</Link>
            </Button>
          </div>
        </div>
      )}

      {/* A) INSULIN ONLY OR B) BOTH INSULIN & TABLETS */}
      {!isTabletsOnly && !isNeither && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <form className="panel p-6 sm:p-8" onSubmit={handleCheckAwareness}>
              <h2 className="text-base sm:text-lg font-bold">Check Insulin Situational Awareness</h2>

              <div className="mt-6 space-y-4">
                <label className="block text-xs sm:text-sm font-semibold">
                  Last Dose Time
                  <input
                    className="field mt-1.5"
                    type="datetime-local"
                    required
                    value={lastDoseTime}
                    onChange={(e) => setLastDoseTime(e.target.value)}
                  />
                </label>

                <label className="block text-xs sm:text-sm font-semibold">
                  Next Scheduled Dose Time
                  <input
                    className="field mt-1.5"
                    type="datetime-local"
                    required
                    value={nextScheduledTime}
                    onChange={(e) => setNextScheduledTime(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-xs sm:text-sm font-semibold">
                    Dose Taken (units)
                    <input
                      className="field mt-1.5"
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      value={doseUnits}
                      onChange={(e) => setDoseUnits(e.target.value)}
                    />
                  </label>

                  <label className="block text-xs sm:text-sm font-semibold">
                    Planned Carbs (g)
                    <input
                      className="field mt-1.5"
                      type="text"
                      readOnly
                      value={
                        mealContext
                          ? mealContext.total_estimated_carbs_g
                          : mealDataLoading
                          ? 'Loading...'
                          : mealDataError
                          ? 'Meal data unavailable'
                          : 'No meal data yet'
                      }
                    />
                    <span className="mt-1.5 block text-[10px] font-medium text-muted-foreground">
                      Auto from Meal Analysis
                    </span>
                    {mealContext?.context.items.length ? (
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        {mealContext.context.items.map((item) => item.food_name).join(', ')}
                      </span>
                    ) : null}
                    {mealContext?.context.timestamp && (
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        Analyzed {new Date(mealContext.context.timestamp).toLocaleString()}
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <Button className="mt-6" type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    Check Active Insulin <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            </form>

            {/* Telemetry Overview */}
            <div className="panel overflow-hidden">
              <SectionHeading title="Active Insulin & Schedule Status" icon={Clock3} />

              {awarenessResult ? (
                <div className="p-6 sm:p-7 space-y-6">
                  <div>
                    <span className="eyebrow">Current Active Insulin</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold text-foreground">
                        {displayedActivePercent === null ? '—' : `${displayedActivePercent}%`}
                      </span>
                      <span className="text-sm text-muted-foreground">remaining active</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last Dose ({elapsedHours}h ago)</span>
                      <span>
                        Next Dose Target
                        {minutesUntilNextDose !== null && (
                          <> ({minutesUntilNextDose === 0 && nextDoseTimestamp <= (clockNow ?? 0) ? 'time passed' : nextDoseCountdown})</>
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(displayedActivePercent ?? 0, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Advisory Card */}
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-primary">
                      <ShieldCheck className="h-4 w-4" /> Clinical Guidance
                    </div>
                    <p className="mt-2 text-xs sm:text-sm text-soft leading-relaxed">
                      Insulin may still be active. Follow your prescribed care plan and monitor your glucose.
                    </p>
                    {nextDoseStatus && (
                      <p className="mt-2 text-xs text-muted-foreground">{nextDoseStatus}</p>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Follow your physician&apos;s prescribed plan. DiaSynapse situational awareness does not compute insulin doses.
                  </p>
                </div>
              ) : (
                <Empty
                  icon={Clock3}
                  title="No insulin check yet"
                  text="Input your timing details on the left to evaluate active insulin and situational awareness."
                />
              )}
            </div>
          </div>

          {/* B) If Both Insulin & Tablets, also render Tablet Schedule Section */}
          {isBoth && (
            <div>
              <TabletMedicationSection variant="both" />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

// -------------------------------------------------------------
// 6. PROGRESS (CONNECTED TO FIREBASE AGGREGATIONS)
// -------------------------------------------------------------
export function Progress() {
  const [range, setRange] = useState(7);
  const [report, setReport] = useState<any>(null);
  const [latestMeal, setLatestMeal] = useState<MealAgentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<'trends' | 'report'>('trends');
  const [userName, setUserName] = useState('Pavi');
  const [diabetesType, setDiabetesType] = useState('Type 1');
  const [medicationType, setMedicationType] = useState('Insulin');

  useEffect(() => {
    const profile = readJson<Record<string, string>>('profile');
    if (profile?.['name']) setUserName(profile['name']);
    if (profile?.['diabetesType']) setDiabetesType(profile['diabetesType']);
    if (profile?.['medicationType']) setMedicationType(profile['medicationType']);
    const cachedMeal = readLatestMealAnalysis();
    if (cachedMeal) setLatestMeal(cachedMeal);

    getProgressReport()
      .then((data) => setReport(data))
      .catch((err) => console.warn('Progress report fetch error:', err))
      .finally(() => setLoading(false));
    getDashboardData()
      .then((data) => {
        const latestMeal = saveLatestMealAnalysis(data?.meal);
        if (latestMeal) setLatestMeal(latestMeal);
      })
      .catch((err) => console.warn('Latest meal fetch error:', err));
  }, []);

  // Build chart data strictly from backend — empty arrays if not available
  const glucoseChartData = useMemo(() => {
    if (!report?.glucose_readings || !Array.isArray(report.glucose_readings) || report.glucose_readings.length === 0) {
      return [];
    }
    return report.glucose_readings.map((r: any, i: number) => ({
      time: r.label ?? `Reading ${i + 1}`,
      reading: typeof r.value === 'number' ? r.value : Number(r.value),
    }));
  }, [report]);

  const carbChartData = useMemo(() => {
    if (!report?.meal_carbs || !Array.isArray(report.meal_carbs) || report.meal_carbs.length === 0) {
      return [];
    }
    return report.meal_carbs.map((m: any, i: number) => ({
      meal: m.label ?? `Meal ${i + 1}`,
      carbs: typeof m.carbs === 'number' ? m.carbs : Number(m.carbs),
    }));
  }, [report]);

  const avgGlucose = report?.avg_glucose_period2 ? Math.round(report.avg_glucose_period2) : null;
  const trend = report?.glucose_trend ?? null;

  return (
    <AppShell page="progress">
      <div className="no-print">
        <PageHeader
          eyebrow="Clinical Progress & Analytics"
          title="Biometric Trajectory & Healthcare Reports"
          description="Historical biometric recordings aggregated from clinical telemetry and synthesized decision reports."
        />

        {/* View Switcher: Charts vs Clinical Report */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={viewTab === 'trends' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewTab('trends')}
              className="text-xs h-8 gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Telemetry Charts
            </Button>
            <Button
              type="button"
              variant={viewTab === 'report' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewTab('report')}
              className="text-xs h-8 gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> Clinical Summary Report
            </Button>
          </div>

          {viewTab === 'trends' && (
            <div className="flex rounded-md border border-border p-1 bg-card">
              {[7, 14, 30].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={range === n ? 'secondary' : 'ghost'}
                  onClick={() => setRange(n)}
                  className="text-xs h-7"
                >
                  {n} Days
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewTab === 'report' ? (
        <ClinicalReportView
          userName={userName}
          diabetesType={diabetesType}
          medicationType={medicationType}
          reportData={report}
          latestForecast={read('latest_forecast') ? Number(read('latest_forecast')) : null}
          lastMealCarbs={latestMeal ? String(latestMeal.total_estimated_carbs_g) : null}
          activeInsulin={null}
        />
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-5">
              <p className="eyebrow">Average Glucose</p>
              <div className="mt-2 flex items-baseline gap-2">
                {avgGlucose !== null ? (
                  <><span className="text-3xl font-extrabold text-foreground">{avgGlucose}</span>
                  <span className="text-xs text-muted-foreground">mg/dL</span></>
                ) : (
                  <span className="text-3xl font-extrabold text-muted-foreground/50">—</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Recent period average</p>
            </div>

            <div className="panel p-5">
              <p className="eyebrow">Time In Range</p>
              <div className="mt-2 flex items-baseline gap-2">
                {report?.time_in_range !== undefined ? (
                  <><span className="text-3xl font-extrabold text-emerald-400">{report.time_in_range}%</span>
                  <span className="text-xs text-muted-foreground">in 70-140 mg/dL</span></>
                ) : (
                  <span className="text-3xl font-extrabold text-muted-foreground/50">—</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Clinical target &gt; 70%</p>
            </div>

            <div className="panel p-5">
              <p className="eyebrow">Metabolic Trajectory</p>
              <div className="mt-2 flex items-baseline gap-2">
                {trend !== null ? (
                  <span className="text-3xl font-extrabold text-primary capitalize">{trend}</span>
                ) : (
                  <span className="text-3xl font-extrabold text-muted-foreground/50">—</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Direction of glycemic stability</p>
            </div>

            <div className="panel p-5">
              <p className="eyebrow">Active Surveillance</p>
              <div className="mt-2 flex items-baseline gap-2">
                {report?.total_readings !== undefined ? (
                  <><span className="text-3xl font-extrabold text-foreground">{report.total_readings}</span>
                  <span className="text-xs text-muted-foreground">records</span></>
                ) : (
                  <span className="text-3xl font-extrabold text-muted-foreground/50">—</span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Firebase persistent telemetry</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel overflow-hidden">
              <SectionHeading title="Glucose Trends (mg/dL)" icon={Droplets} />
              {glucoseChartData.length > 0 ? (
                <div className="p-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={glucoseChartData}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[70, 220]} />
                      <ReferenceLine y={140} stroke="#3BA06A" strokeDasharray="3 3" label={{ value: 'Target Max', fill: '#3BA06A', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="reading"
                        stroke="var(--primary)"
                        strokeWidth={2.5}
                        fill="url(#trendGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty
                  icon={Droplets}
                  title="Insufficient data"
                  text={loading ? 'Loading telemetry...' : 'The backend does not yet provide per-reading glucose history. Use Glucose Forecast to record readings.'}
                />
              )}
            </div>

            <div className="panel overflow-hidden">
              <SectionHeading title="Carbohydrate Ingestion (g)" icon={Utensils} />
              {carbChartData.length > 0 ? (
                <div className="p-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={carbChartData}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="meal" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="carbs" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Empty
                  icon={Utensils}
                  title="Insufficient data"
                  text={loading ? 'Loading meal logs...' : 'The backend does not yet provide per-meal carbohydrate history. Use Meal Analysis to log meals.'}
                />
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

// -------------------------------------------------------------
// 7. FOOD GUIDE
// -------------------------------------------------------------
export function Food() {
  return (
    <AppShell page="food">
      <PageHeader
        eyebrow="Nutritional Intelligence"
        title="Food Guide & Glycemic Context"
        description="Explore familiar South Indian culinary staples, portion guidelines, and carbohydrate tiers with diabetes-friendly pairing insights."
      />
      <FoodGuideSection />
    </AppShell>
  );
}

// -------------------------------------------------------------
// 8. WELLNESS & PHYSICAL ACTIVITY
// -------------------------------------------------------------
const wellnessHabits = [
  { icon: Droplets, title: 'Adequate Hydration', description: 'Drinking 2–2.5L water assists renal clearance of excess circulating glucose.' },
  { icon: Moon, title: 'Circadian Sleep Hygiene', description: '7–8 hours of consistent, restful sleep supports morning insulin sensitivity.' },
  { icon: Heart, title: 'Stress Moderation', description: 'Lowering acute mental strain dampens sympathetic counter-regulatory spikes.' },
];

export function Wellness() {
  return (
    <AppShell page="wellness">
      <PageHeader
        eyebrow="Everyday Wellness & Movement"
        title="Physical Activity & Supportive Routines"
        description="Lifestyle routines and physical activities clinically associated with improved insulin sensitivity and glycemic stability."
      />

      {/* Main Exercise & Activity Section */}
      <ExerciseActivitySection />

      {/* Supportive Everyday Habits Section */}
      <div className="mt-12 space-y-4">
        <div className="border-t border-border pt-8">
          <span className="eyebrow block">Complementary Care</span>
          <h2 className="text-xl font-bold text-foreground">Supportive Everyday Habits</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Holistic daily routines that reinforce glycemic balance alongside medical care.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {wellnessHabits.map((item) => (
            <div
              key={item.title}
              className="panel p-5 space-y-3 bg-secondary/20"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
              <p className="text-xs text-soft leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 9. PROFILE & SETTINGS (CONNECTED TO AUTH / FIREBASE)
// -------------------------------------------------------------
export function Profile({ settings = false }: { settings?: boolean }) {
  const [form, setForm] = useState<Record<string, string>>({
    name: 'Pavi',
    diabetesType: 'Type 1',
    medicationType: 'Insulin',
    dob: '2001-05-14',
    height: '168',
    weight: '62',
    foodPreference: 'South Indian vegetarian',
    activityLevel: 'Moderate',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const local = readJson<Record<string, string>>('profile');
    if (local) setForm((prev) => ({ ...prev, ...local }));

    getMe()
      .then((res) => {
        if (res?.user) {
          setForm((prev) => ({
            ...prev,
            name: res.user.name || prev['name'],
            diabetesType: res.user.diabetesType || prev['diabetesType'],
            medicationType: res.user.medicationType || prev['medicationType'],
            dob: res.user.dob || prev['dob'],
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      write('profile', JSON.stringify(form));
      await updateProfile({
        name: form['name'],
        diabetesType: form['diabetesType'],
        medicationType: form['medicationType'] || 'Insulin',
        dob: form['dob'],
      });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const fields = settings
    ? [
        ['name', 'Full Name', 'text'],
        ['diabetesType', 'Diabetes Classification', 'select'],
        ['medicationType', 'Medication Regimen', 'select'],
        ['dob', 'Date of Birth', 'date'],
      ]
    : [
        ['name', 'Full Name', 'text'],
        ['diabetesType', 'Diabetes Classification', 'select'],
        ['medicationType', 'Medication Regimen', 'select'],
        ['dob', 'Date of Birth', 'date'],
        ['height', 'Height (cm)', 'number'],
        ['weight', 'Weight (kg)', 'number'],
        ['foodPreference', 'Food & Dietary Preference', 'text'],
        ['activityLevel', 'Daily Activity Level', 'select'],
      ];

  return (
    <AppShell page={settings ? 'settings' : 'profile'}>
      <PageHeader
        eyebrow={settings ? 'Account Settings' : 'Your Profile'}
        title={settings ? 'Clinical Preferences' : 'Your personal health profile.'}
        description="Personalize the AI models and clinical parameters used across DiaSynapse."
      />

      <div className="max-w-3xl">
        <form className="panel p-6 sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {(fields as [string, string, string][]).map(([key, label, type]) => (
              <label key={key} className="text-xs sm:text-sm font-semibold">
                {label}
                {type === 'select' ? (
                  <select
                    className="field mt-1.5"
                    value={form[key] ?? ''}
                    onChange={(e) => {
                      setSaved(false);
                      setForm({ ...form, [key]: e.target.value });
                    }}
                  >
                    <option value="">Choose an option</option>
                    {(key === 'diabetesType'
                      ? ['Type 1', 'Type 2', 'Gestational', 'Other']
                      : key === 'medicationType'
                      ? ['Insulin', 'Tablets', 'Both Insulin & Tablets', 'Neither']
                      : ['Low', 'Moderate', 'High']
                    ).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="field mt-1.5"
                    type={type}
                    value={form[key] ?? ''}
                    onChange={(e) => {
                      setSaved(false);
                      setForm({ ...form, [key]: e.target.value });
                    }}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Check className="h-4 w-4" /> Changes saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}

// -------------------------------------------------------------
// 10. AUTH (LOGIN & SIGNUP) — delegates to AuthPage component
// -------------------------------------------------------------
export function Auth({ mode }: { mode: 'login' | 'signup' }) {
  return <AuthPage initialMode={mode} />;
}


// -------------------------------------------------------------
// 11. ABOUT
// -------------------------------------------------------------
export function About() {
  return (
    <>
      <Nav />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <img src={atmosphere} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="hero-surface absolute inset-0" />
          <div className="section-shell relative py-20 md:py-28">
            <p className="eyebrow mb-4">About DiaSynapse</p>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl md:text-6xl text-white">
              Care feels clearer when the pieces connect.
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-soft">
              DiaSynapse unites meal photography, XGBoost glucose predictions, active insulin calculations, and Firebase telemetry into one coherent clinical companion.
            </p>
          </div>
        </section>

        <div className="section-shell space-y-16 py-16">
          <section className="grid gap-6 border-b border-border pb-12 md:grid-cols-[1fr_2fr]">
            <p className="eyebrow">The Challenge</p>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Disconnected Health Signals in Diabetes Care.
              </h2>
              <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Meals, carbohydrate ratios, glucose meters, and insulin dose timing are recorded in separate apps or paper logs. Disconnected telemetry makes it challenging for patients and clinicians to anticipate acute swings or understand retrospective trends.
              </p>
            </div>
          </section>

          <section id="how-it-works">
            <p className="eyebrow mb-3">Our Architecture</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">One Unified Intelligence Pipeline.</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {[
                { title: 'Meal Agent (RAG)', desc: 'Gemini 3.6 Flash vision paired with our regional nutrition database to identify carbs.' },
                { title: 'Insulin Awareness', desc: 'Pharmacokinetic active insulin decay modeling to prevent insulin stacking.' },
                { title: 'Glucose Forecast', desc: 'Pre-trained XGBoost regression model predicting 30-minute postprandial glucose.' },
                { title: 'Progress Surveillance', desc: 'Continuous Firebase Firestore sync maintaining average glucose, time-in-range, and trends.' },
              ].map((t, i) => (
                <div key={t.title} className="border-t border-border pt-4">
                  <p className="eyebrow text-xs">0{i + 1}</p>
                  <h3 className="mt-2 font-bold text-sm sm:text-base text-foreground">{t.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 border-t border-border pt-12 md:grid-cols-[1fr_2fr]">
            <p className="eyebrow">Clinical Boundary</p>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-soft">
              DiaSynapse is an algorithmic decision-support tool designed for situational awareness. It does not replace certified glucose monitoring hardware, provide autonomous diagnostic advice, or calculate prescription insulin doses. Always adhere to your physician&apos;s directives.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// -------------------------------------------------------------
// 12. ONBOARDING
// -------------------------------------------------------------

export function Onboarding() {
  return <OnboardingWizard />;
}

