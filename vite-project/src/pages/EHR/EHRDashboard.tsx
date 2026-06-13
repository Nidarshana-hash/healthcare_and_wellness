"use client";

import { useEffect, useState, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, Upload, Calendar, Eye, Loader2, Trash2, Clock, 
  User, Droplet, RefreshCw, Save, ShieldCheck, Activity 
} from "lucide-react";

// --- IndexedDB Helper ---
const dbName = "HealthSyncDB";
const storeName = "medicalRecords";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const EHRDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [records, setRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState("—");
  const [uploading, setUploading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  const [profile, setProfile] = useState<any>({
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    medications: "",
    conditions: "",
    insuranceProvider: "",
    policyNumber: "",
    groupNumber: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ================= 1. LOAD DATA ================= */
  const loadRecords = async (uid: string) => {
    if (!uid) return;
    setLoadingRecords(true);
    try {
      const idb = await initDB();
      const tx = idb.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const userRecords = (request.result || [])
          .filter((r: any) => r.userId === uid)
          .sort((a: any, b: any) => b.id - a.id);
        setRecords(userRecords);
        if (userRecords.length > 0) setLastUpdate("Today");
        setLoadingRecords(false);
      };
    } catch (err) {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        loadRecords(u.uid);
        
        const docRef = doc(db, "users", u.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().medical) {
          setProfile(snap.data().medical);
        }
      } else {
        setUser(null);
        setRecords([]);
      }
    });
    return () => unsub();
  }, []);

  /* ================= 2. APPOINTMENTS ================= */
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "notifications"), where("userId", "==", user.uid), where("type", "==", "appointment"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setAppointments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [user?.uid]);

  /* ================= 3. PROFILE SAVE ================= */
  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setSavingProfile(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        medical: profile,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Health Profile Synced Successfully!");
    } catch (error) {
      alert("Error saving profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= 4. FILE OPERATIONS ================= */
  const openFile = (base64Data: string) => {
    const base64Parts = base64Data.split(",");
    const contentType = base64Parts[0].split(":")[1].split(";")[0];
    const rawData = window.atob(base64Parts[1]);
    const uInt8Array = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) uInt8Array[i] = rawData.charCodeAt(i);
    const blob = new Blob([uInt8Array], { type: contentType });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, "_blank");
  };

  const handleUpload = async (file: File) => {
    if (!file || !user?.uid) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      const newRecord = { id: Date.now(), userId: user.uid, title: file.name, type: file.type, fileUrl: result, createdAt: new Date().toISOString() };
      const idb = await initDB();
      const tx = idb.transaction(storeName, "readwrite");
      tx.objectStore(storeName).add(newRecord);
      tx.oncomplete = () => {
        setRecords((prev) => [newRecord, ...prev]);
        setUploading(false);
        setActiveTab("records");
      };
    };
    reader.readAsDataURL(file);
  };

  const deleteRecord = async (id: number) => {
    const idb = await initDB();
    const tx = idb.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(id);
    tx.oncomplete = () => setRecords(records.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen relative font-sans">
       {/* PROFESSIONAL BACKGROUND IMAGE LAYER */}
<div 
  className="fixed inset-0 z-0"
  style={{
    // New high-quality healthcare interior image
    backgroundImage: `url(https://th.bing.com/th/id/OIP.jEIorB3Kbxka1-dkG2oLTwHaDF?w=306&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Dark overlay to make text readable */}
  <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" />
</div>

      <div className="relative z-10">
        <header className="py-6 px-8 flex justify-between items-center bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HealthSync EHR</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => user && loadRecords(user.uid)} className="text-slate-400 hover:text-blue-500">
              <RefreshCw className={`w-4 h-4 ${loadingRecords ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-3">
            <Button disabled={uploading} onClick={() => fileInputRef.current?.click()} className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-md">
              {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload Record
            </Button>
            <input type="file" ref={fileInputRef} hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white/70 backdrop-blur-md border p-1 rounded-2xl shadow-sm w-fit">
              <TabsTrigger value="overview" className="rounded-xl px-8">Overview</TabsTrigger>
              <TabsTrigger value="records" className="rounded-xl px-8">Medical Records</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-xl px-8">Appointments</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl px-8">Health Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid md:grid-cols-4 gap-6">
              <StatCard title="Total Records" value={records.length} icon={FileText} color="text-blue-600" />
              <StatCard title="Appointments" value={appointments.length} icon={Calendar} color="text-emerald-600" />
              <StatCard title="Blood Type" value={profile.bloodType || "—"} icon={Droplet} color="text-rose-600" />
              <StatCard title="Last Update" value={lastUpdate} icon={Clock} color="text-amber-600" />
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
               {loadingRecords ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /> <p className="text-slate-400 mt-2">Loading your files...</p></div>
              ) : records.length === 0 ? (
                <Card className="bg-white/40 border-dashed border-2 py-20 text-center text-slate-400 backdrop-blur-sm">No records found. Click Upload to add your first file.</Card>
              ) : (
                records.map((r) => (
                  <Card key={r.id} className="border-none shadow-sm overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
                    <CardContent className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl"><FileText className="text-blue-500" /></div>
                        <div>
                          <p className="font-bold text-slate-800">{r.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{new Date(r.id).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openFile(r.fileUrl)} className="rounded-xl bg-white/50"><Eye className="w-4 h-4 mr-2" /> View</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord(r.id)} className="text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="appointments">
               <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm"><CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {appointments.length === 0 ? <p className="text-center py-10 text-slate-400">No appointments scheduled.</p> : 
                    appointments.map((a) => (
                      <div key={a.id} className="flex justify-between items-center p-4 border rounded-2xl bg-white/90">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 rounded-full"><User className="text-emerald-600" /></div>
                          <div><p className="font-bold text-slate-800">{a.doctorName || a.title}</p><p className="text-xs text-slate-500">{a.date} | {a.time}</p></div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1 rounded-full">{a.status || 'Active'}</Badge>
                      </div>
                    ))
                  }
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-none shadow-lg overflow-hidden bg-white/90 backdrop-blur-md">
                <CardHeader className="bg-slate-900 text-white p-8 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" /> 
                      Personal Health Profile
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">Manage your medical history and clinical stats</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400">Encrypted Data</Badge>
                </CardHeader>
                
                <CardContent className="p-8 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Vital Statistics
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Blood Type</Label>
                        <select className="w-full border-b-2 p-2 outline-none text-lg font-medium bg-transparent focus:border-blue-500 transition-colors" 
                          value={profile.bloodType} onChange={(e) => setProfile({...profile, bloodType: e.target.value})}>
                          <option value="">Select Group</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Height (ft/in)</Label>
                        <Input className="border-0 border-b-2 rounded-none px-0 text-lg font-medium focus-visible:ring-0 focus-visible:border-blue-500 bg-transparent" 
                          placeholder="e.g. 5'10&quot;" value={profile.height} onChange={(e) => setProfile({...profile, height: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Weight (lbs)</Label>
                        <Input className="border-0 border-b-2 rounded-none px-0 text-lg font-medium focus-visible:ring-0 focus-visible:border-blue-500 bg-transparent" 
                          placeholder="e.g. 175" value={profile.weight} onChange={(e) => setProfile({...profile, weight: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Medical History
                    </h3>
                    <div className="grid md:grid-cols-1 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Known Allergies</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="e.g. Penicillin, Peanuts" 
                          value={profile.allergies} onChange={(e) => setProfile({...profile, allergies: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Current Medications</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="e.g. Lisinopril 10mg" 
                          value={profile.medications} onChange={(e) => setProfile({...profile, medications: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Medical Conditions</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="e.g. Hypertension, Type 2 Diabetes" 
                          value={profile.conditions} onChange={(e) => setProfile({...profile, conditions: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Insurance Information
                    </h3>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Provider</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="HealthCare Plus" 
                          value={profile.insuranceProvider} onChange={(e) => setProfile({...profile, insuranceProvider: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Policy Number</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="HP123456789" 
                          value={profile.policyNumber} onChange={(e) => setProfile({...profile, policyNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-black uppercase text-slate-400">Group Number</Label>
                        <Input className="h-12 bg-slate-50/50" placeholder="GRP001" 
                          value={profile.groupNumber} onChange={(e) => setProfile({...profile, groupNumber: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardContent className="p-8 bg-slate-50/80 border-t rounded-b-2xl">
                  <Button 
                    disabled={savingProfile}
                    onClick={handleSaveProfile} 
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-200 transition-all"
                  >
                    {savingProfile ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save and Sync Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm">
    <CardContent className="pt-6 flex justify-between items-center">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black mt-1 text-slate-800">{value}</p>
      </div>
      <div className={`p-4 rounded-3xl bg-slate-50/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </CardContent>
  </Card>
);

export default EHRDashboard;