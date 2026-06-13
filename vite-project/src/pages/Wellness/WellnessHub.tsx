"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Utensils,
  Brain,
  Target,
  Play,
  BookOpen,
  Plus,
  Flame,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

/* --- DATA MAPS & CONSTANTS (KEEPING ORIGINAL LOGIC) --- */
const ACTIVITIES_MAP: Record<number, Record<number, { id: string; text: string; completed: boolean }[]>> = {
  1: { 1: [{ id: "h1d1_1", text: "15-minute morning brisk walk", completed: false }, { id: "h1d1_2", text: "Measure resting heart rate", completed: false }, { id: "h1d1_3", text: "Replace salt with herbs in dinner", completed: false }], 2: [{ id: "h1d2_1", text: "20-minute light jogging", completed: false }, { id: "h1d2_2", text: "Eat one serving of leafy greens", completed: false }] },
  2: { 1: [{ id: "s2d1_1", text: "3 sets of 10 bodyweight squats", completed: false }, { id: "s2d1_2", text: "Push-ups to failure (1 set)", completed: false }, { id: "s2d1_3", text: "1-minute plank hold", completed: false }], 2: [{ id: "s2d2_1", text: "Walking lunges (20 reps)", completed: false }, { id: "s2d2_2", text: "3 sets of 12 glute bridges", completed: false }] },
  3: { 1: [{ id: "m3d1_1", text: "5-minute box breathing exercise", completed: false }, { id: "m3d1_2", text: "Identify 3 things you're grateful for", completed: false }], 2: [{ id: "m3d2_1", text: "10-minute guided 'body scan' meditation", completed: false }, { id: "m3d2_2", text: "No screen time 30 mins before bed", completed: false }] },
  4: { 1: [{ id: "y4d1_1", text: "Sun Salutations (5 rounds)", completed: false }, { id: "y4d1_2", text: "Child's pose for 2 minutes", completed: false }], 2: [{ id: "y4d2_1", text: "Downward Dog stretch (3 mins)", completed: false }, { id: "y4d2_2", text: "Warrior I & II sequence", completed: false }] },
  5: { 1: [{ id: "sl5d1_1", text: "Set a strict 10:00 PM bedtime", completed: false }, { id: "sl5d1_2", text: "Dim lights 1 hour before sleep", completed: false }], 2: [{ id: "sl5d2_1", text: "Read 5 pages of a physical book", completed: false }, { id: "sl5d2_2", text: "Take a warm shower before bed", completed: false }] },
  6: { 1: [{ id: "w6d1_1", text: "Drink 500ml water upon waking", completed: false }, { id: "w6d1_2", text: "Carry a reusable bottle all day", completed: false }], 2: [{ id: "w6d2_1", text: "Replace one soda/coffee with water", completed: false }, { id: "w6d2_2", text: "Drink water before every meal", completed: false }] }
};

const CORE_PROGRAMS = [
  { id: 1, title: "Heart Health", category: "Fitness", duration: 30, difficulty: "Moderate", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80", progress: 0 },
  { id: 2, title: "Strength Basics", category: "Fitness", duration: 30, difficulty: "Hard", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", progress: 0 },
  { id: 3, title: "Mindful Zen", category: "Mental Health", duration: 21, difficulty: "Beginner", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80", progress: 0 },
  { id: 4, title: "Yoga Flow", category: "Fitness", duration: 15, difficulty: "Moderate", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80", progress: 0 },
  { id: 5, title: "Sleep Rituals", category: "Sleep", duration: 14, difficulty: "Beginner", image: "https://images.unsplash.com/photo-1511295742364-911ad356f847?auto=format&fit=crop&w=800&q=80", progress: 0 },
  { id: 6, title: "Aqua Habit", category: "Nutrition", duration: 7, difficulty: "Beginner", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80", progress: 0 },
];

const DEFAULT_WELLNESS = {
  steps: { current: 8543, goal: 10000, unit: "steps" },
  water: { current: 6, goal: 8, unit: "glasses" },
  sleep: { current: 7.5, goal: 8, unit: "hours" },
  workout: { current: 5, goal: 7, unit: "days" },
};

const DEFAULT_NUTRITION = {
  calories: { current: 1450, goal: 2000 },
  water: 6,
  meals: [
    { id: 1, name: "Oatmeal with Berries", calories: 350, time: "08:30 AM" },
    { id: 2, name: "Grilled Chicken Salad", calories: 550, time: "01:00 PM" },
  ]
};

const WELLNESS_ARTICLES = [
  { id: 1, title: "The Science of Sleep", excerpt: "Understanding how 8 hours of rest impacts function...", category: "Mental Health", readTime: "5 min", image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&w=500&q=80" },
  { id: 2, title: "Intermittent Fasting 101", excerpt: "A beginner's guide to health trends...", category: "Nutrition", readTime: "8 min", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80" },
  { id: 3, title: "Building Lasting Habits", excerpt: "How small changes lead to transformations...", category: "Lifestyle", readTime: "6 min", image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=500&q=80" }
];

const WellnessHub = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  const [wellness, setWellness] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_WELLNESS;
    return JSON.parse(localStorage.getItem("wellnessData") || JSON.stringify(DEFAULT_WELLNESS));
  });

  const [nutrition, setNutrition] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_NUTRITION;
    return JSON.parse(localStorage.getItem("nutritionData") || JSON.stringify(DEFAULT_NUTRITION));
  });

  const [programs, setPrograms] = useState(() => {
    if (typeof window === 'undefined') return CORE_PROGRAMS;
    const saved = localStorage.getItem("wellnessPrograms");
    const basePrograms = saved ? JSON.parse(saved) : CORE_PROGRAMS;
    return basePrograms.map((p: any) => ({
        ...p,
        currentDay: p.currentDay || 1,
        activities: p.activities || (ACTIVITIES_MAP[p.id]?.[p.currentDay || 1] || ACTIVITIES_MAP[1][1])
    }));
  });

  useEffect(() => { localStorage.setItem("wellnessData", JSON.stringify(wellness)); }, [wellness]);
  useEffect(() => { localStorage.setItem("nutritionData", JSON.stringify(nutrition)); }, [nutrition]);
  useEffect(() => { localStorage.setItem("wellnessPrograms", JSON.stringify(programs)); }, [programs]);

  const selectedProgram = programs.find((p: any) => p.id === selectedProgramId);

  const toggleActivity = (programId: number, activityId: string) => {
    setPrograms((prev: any[]) =>
      prev.map((p) => {
        if (p.id === programId) {
          const updatedActivities = p.activities.map((a: any) =>
            a.id === activityId ? { ...a, completed: !a.completed } : a
          );
          const completedCount = updatedActivities.filter((a: any) => a.completed).length;
          const progressPercent = Math.round((completedCount / updatedActivities.length) * 100);
          return { ...p, activities: updatedActivities, progress: progressPercent };
        }
        return p;
      })
    );
  };

  const moveToNextDay = (programId: number) => {
    setPrograms((prev: any[]) =>
      prev.map((p) => {
        if (p.id === programId) {
          const nextDay = p.currentDay + 1;
          const newActivities = ACTIVITIES_MAP[p.id]?.[nextDay] || ACTIVITIES_MAP[p.id]?.[1] || [];
          return { ...p, currentDay: nextDay, activities: newActivities, progress: 0 };
        }
        return p;
      })
    );
  };

  const resetProgram = (programId: number) => {
    setPrograms((prev: any[]) =>
      prev.map((p) => {
        if (p.id === programId) {
          const firstDayActs = (ACTIVITIES_MAP[p.id]?.[1] || []).map(a => ({...a, completed: false}));
          return { ...p, currentDay: 1, activities: firstDayActs, progress: 0 };
        }
        return p;
      })
    );
  };

  const addMeal = () => {
    const mealName = prompt("Enter meal name:");
    const calories = Number(prompt("Enter calories:"));
    if (mealName && calories) {
      const newMeal = { id: Date.now(), name: mealName, calories, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setNutrition((prev: any) => ({
        ...prev,
        calories: { ...prev.calories, current: prev.calories.current + calories },
        meals: [newMeal, ...prev.meals]
      }));
    }
  };

  const wellnessMetrics = [
    { key: "steps", label: "Daily Steps" },
    { key: "water", label: "Water Intake" },
    { key: "sleep", label: "Sleep Hours" },
    { key: "workout", label: "Workout Streak" },
  ];

  const dailyTips = [
    { icon: Heart, title: "Take a 10-minute walk", description: "Even short walks can improve cardiovascular health", category: "Fitness" },
    { icon: Utensils, title: "Eat a colorful lunch", description: "Include at least 3 different colored vegetables", category: "Nutrition" },
    { icon: Brain, title: "Practice deep breathing", description: "Reduce stress and improve focus", category: "Mental Health" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950">
      {/* PROFESSIONAL BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('https://th.bing.com/th/id/OIP.A4XFLouVdI8_3qlFvLYLEgHaE8?w=259&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* DARK OVERLAY FOR UI CLARITY */}
      <div className="fixed inset-0 z-0 bg-slate-950/85 backdrop-blur-[1px]" />

      {/* ---------------- HERO (DARK VERSION) ---------------- */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-6 px-4 py-1">
             PERSONALIZED WELLNESS
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white">
            Your Wellness <span className="text-emerald-400">Journey</span>
          </h1>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-xl border-none" onClick={() => setShowGoalForm(true)}>
              <Target className="w-5 h-5 mr-2" /> Set Goals
            </Button>
            <Button size="lg" variant="outline" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-xl border-none" onClick={() => setActiveTab("programs")}>
              <Play className="w-5 h-5 mr-2" /> Start Program
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------- GOAL FORM ---------------- */}
      {showGoalForm && (
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
          <Card className="max-w-3xl mx-auto shadow-2xl border-t-4 border-emerald-500 bg-slate-900 text-white border-none">
            <CardHeader><CardTitle>Update Wellness Goals</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 pb-6">
              {Object.keys(wellness).map((key) => (
                <div key={key}>
                  <label className="text-xs font-bold uppercase text-slate-400">{key} goal</label>
                  <input type="number" className="w-full mt-1 bg-slate-800 border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" value={wellness[key].goal} onChange={(e) => setWellness((prev: any) => ({ ...prev, [key]: { ...prev[key], goal: Number(e.target.value) } }))} />
                </div>
              ))}
              <div className="col-span-full flex justify-end gap-3 mt-4">
                <Button variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setShowGoalForm(false)}>Cancel</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowGoalForm(false)}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 h-14 bg-slate-900/60 border border-white/10 p-1 rounded-2xl mb-12 backdrop-blur-md">
            <TabsTrigger value="dashboard" className="rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">Dashboard</TabsTrigger>
            <TabsTrigger value="programs" className="rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">Programs</TabsTrigger>
            <TabsTrigger value="nutrition" className="rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">Nutrition</TabsTrigger>
            <TabsTrigger value="articles" className="rounded-xl font-semibold data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-400">Articles</TabsTrigger>
          </TabsList>

          {/* ---------------- DASHBOARD ---------------- */}
          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-4 gap-6">
              {wellnessMetrics.map(({ key, label }) => {
                const data = wellness[key];
                const percent = Math.round((data.current / data.goal) * 100);
                return (
                  <Card key={key} className="border-none shadow-sm bg-slate-900/80 backdrop-blur-sm text-white">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none">{percent}%</Badge>
                      </div>
                      <p className="text-2xl font-black">{data.current} <span className="text-xs font-normal text-slate-500 tracking-normal">/ {data.goal} {data.unit}</span></p>
                      <Progress value={percent} className="h-1.5 bg-slate-800" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {dailyTips.map((tip, i) => (
                <Card key={i} className="border-none shadow-sm hover:ring-1 ring-emerald-500 transition-all cursor-pointer bg-slate-900/80 backdrop-blur-sm text-white">
                  <CardContent className="pt-6 flex gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-2xl h-fit"><tip.icon className="w-5 h-5 text-emerald-400" /></div>
                    <div><h3 className="font-bold">{tip.title}</h3><p className="text-xs text-slate-400 mt-1">{tip.description}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ---------------- PROGRAMS ---------------- */}
          <TabsContent value="programs">
            {!selectedProgram ? (
              <div className="grid md:grid-cols-3 gap-8 animate-in fade-in">
                {programs.map((p: any) => (
                  <Card key={p.id} className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group bg-slate-900/80 backdrop-blur-sm text-white cursor-pointer" onClick={() => setSelectedProgramId(p.id)}>
                    <div className="relative h-56">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4"><Badge className="bg-emerald-500 text-white border-none font-bold uppercase text-[10px] px-3">{p.category}</Badge></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Day {p.currentDay} of {p.duration}</p>
                        <h3 className="text-xl font-black leading-tight">{p.title}</h3>
                      </div>
                    </div>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {p.duration} Days</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {p.difficulty}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase">
                            <span className="text-emerald-400">Current Progress</span>
                            <span className="text-slate-500">{p.progress}%</span>
                        </div>
                        <Progress value={p.progress} className="h-1.5 bg-slate-800" />
                      </div>
                      <Button className="w-full bg-emerald-600 text-white font-bold h-12 rounded-xl group-hover:bg-emerald-500 transition-colors">Continue Journey</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3 space-y-6">
                    <Button variant="ghost" onClick={() => setSelectedProgramId(null)} className="mb-2 font-bold text-slate-400 hover:text-emerald-400">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
                    </Button>
                    <Card className="border-none shadow-sm bg-slate-900/80 backdrop-blur-sm text-white overflow-hidden">
                      <CardHeader className="bg-slate-950 text-white border-b border-white/5">
                        <CardTitle className="text-lg">Program Roadmap</CardTitle>
                        <CardDescription className="text-slate-500">Your journey to {selectedProgram.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-slate-800">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`relative flex items-center gap-4 ${i + 1 > selectedProgram.currentDay ? 'opacity-30' : ''}`}>
                              <div className={`w-8 h-8 rounded-full border-4 border-slate-900 shadow-sm flex items-center justify-center text-xs font-black z-10 ${i + 1 === selectedProgram.currentDay ? 'bg-emerald-500 text-white scale-125' : 'bg-slate-800 text-slate-500'}`}>
                                {i + 1}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Day {i + 1}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black">
                                    {i + 1 === selectedProgram.currentDay ? "In Progress" : i + 1 < selectedProgram.currentDay ? "Completed" : "Locked"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                    <Card className="border-none shadow-xl bg-slate-900/80 backdrop-blur-sm text-white overflow-hidden rounded-3xl">
                      <div className="h-48 relative">
                        <img src={selectedProgram.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center p-8">
                          <div>
                            <Badge className="bg-emerald-500 text-white mb-2">{selectedProgram.category}</Badge>
                            <h2 className="text-3xl font-black text-white leading-tight">{selectedProgram.title}</h2>
                          </div>
                        </div>
                      </div>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2 italic">
                            Today's Agenda <span className="text-emerald-400 not-italic font-black">— Day {selectedProgram.currentDay}</span>
                          </CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => resetProgram(selectedProgram.id)} className="text-[10px] font-black uppercase text-slate-500 border-slate-800 hover:text-red-400">
                            <RotateCcw className="w-3 h-3 mr-1" /> Reset
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-6 pb-12">
                        <div className="grid gap-3">
                          {selectedProgram.activities.map((a: any) => (
                            <div key={a.id} onClick={() => toggleActivity(selectedProgram.id, a.id)} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${a.completed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-950/40 border-slate-800 hover:border-emerald-500/40"}`}>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${a.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-700"}`}>
                                {a.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>
                              <span className={`font-bold ${a.completed ? "line-through text-slate-500" : "text-white"}`}>{a.text}</span>
                            </div>
                          ))}
                        </div>
                        {selectedProgram.progress === 100 && (
                          <div className="space-y-4 animate-in zoom-in-95">
                            <div className="p-4 bg-emerald-600 text-white rounded-2xl text-center font-bold">
                               🌟 Excellent work! Day {selectedProgram.currentDay} is complete.
                            </div>
                            <Button className="w-full h-14 bg-white text-slate-950 hover:bg-emerald-400 text-lg font-black rounded-2xl shadow-xl transition-colors" onClick={() => moveToNextDay(selectedProgram.id)}>
                               Unlock Day {selectedProgram.currentDay + 1} <ChevronRight className="w-6 h-6 ml-2" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ---------------- NUTRITION ---------------- */}
          <TabsContent value="nutrition" className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 border-none shadow-sm bg-slate-900/80 backdrop-blur-sm text-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div><CardTitle>Daily Food Log</CardTitle></div>
                  <Button onClick={addMeal} className="bg-emerald-600 hover:bg-emerald-700 border-none"><Plus className="w-4 h-4 mr-2" /> Log Meal</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nutrition.meals.map((meal: any) => (
                    <div key={meal.id} className="flex justify-between items-center p-4 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg"><Utensils className="text-orange-400 w-5 h-5" /></div>
                        <div><p className="font-bold">{meal.name}</p><p className="text-xs text-slate-500">{meal.time}</p></div>
                      </div>
                      <Badge variant="secondary" className="bg-slate-800 text-white border-none font-bold">+{meal.calories} kcal</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="h-fit border-none shadow-sm bg-slate-900/80 backdrop-blur-sm text-white">
                <CardHeader><CardTitle className="flex items-center gap-2 text-orange-400"><Flame className="text-orange-500" /> Calories</CardTitle></CardHeader>
                <CardContent className="text-center py-6">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-orange-500" strokeDasharray={364} strokeDashoffset={364 - (364 * Math.min(nutrition.calories.current / nutrition.calories.goal, 1))} />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-2xl font-black">{nutrition.calories.current}</span>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Kcal</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-400">Goal: {nutrition.calories.goal} kcal</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---------------- ARTICLES ---------------- */}
          <TabsContent value="articles" className="grid md:grid-cols-3 gap-8 animate-in fade-in">
            {WELLNESS_ARTICLES.map((art) => (
              <Card key={art.id} className="group cursor-pointer overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-slate-900/80 backdrop-blur-sm text-white">
                <div className="h-52 overflow-hidden">
                  <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-blue-500/20 text-blue-400 border-none font-bold text-[10px] uppercase">{art.category}</Badge>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><BookOpen className="w-3 h-3" /> {art.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors">{art.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">{art.excerpt}</p>
                  <Button variant="link" className="p-0 text-emerald-400 h-auto font-bold underline-offset-4">Read More →</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WellnessHub;