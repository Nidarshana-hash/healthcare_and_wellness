"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/firebase";
import {
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Shield, Eye, EyeOff, Lock, Camera, Loader2 } from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- PERSONAL INFO ---------------- */
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    relationship: "",
    photoURL: "",
  });

  /* ---------------- MEDICAL INFO ---------------- */
  const [medicalData, setMedicalData] = useState({
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

  /* ---------------- SECURITY ---------------- */
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) setProfileData(data.profile);
        if (data.medical) setMedicalData(data.medical);
      } else {
        setProfileData((p) => ({ ...p, email: u.email || "" }));
      }
    });

    return () => unsub();
  }, []);

  /* ---------------- PHOTO UPLOAD LOGIC ---------------- */
  const handlePhotoClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("Image is too large. Please select an image under 800KB.");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prev) => ({ ...prev, photoURL: reader.result as string }));
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- SAVE DATA ---------------- */
  const handleSave = async () => {
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      {
        profile: profileData,
        medical: medicalData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setIsEditing(false);
  };

  /* ---------------- PASSWORD UPDATE & DB SYNC ---------------- */
  const handlePasswordUpdate = async () => {
    if (!user) return;

    if (passwords.newPass !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }

    const credential = EmailAuthProvider.credential(
      user.email!,
      passwords.current
    );

    try {
      // 1. Re-authenticate
      await reauthenticateWithCredential(user, credential);
      // 2. Update Firebase Auth Password
      await updatePassword(user, passwords.newPass);
      
      // 3. Automatically sync security status to Database
      await setDoc(
        doc(db, "users", user.uid),
        {
          security: {
            lastPasswordUpdate: serverTimestamp(),
            status: "updated"
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Password updated and synced to database successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* MAINTAINED ORDER */
  const personalRows: {
    left: keyof typeof profileData;
    right: keyof typeof profileData;
  }[] = [
    { left: "firstName", right: "lastName" },
    { left: "email", right: "phone" },
    { left: "dateOfBirth", right: "address" },
    { left: "city", right: "state" },
    { left: "zipCode", right: "relationship" },
    { left: "emergencyContact", right: "emergencyPhone" },
  ];

  const formatLabel = (key: string) => key.toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      
      {/* HEADER */}
      <section className="bg-white border-b py-10">
        <div className="max-w-5xl mx-auto px-6 flex gap-8 items-center">
          <div 
            className={`relative group w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white bg-slate-100 ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={handlePhotoClick}
          >
            {profileData.photoURL ? (
              <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold">
                {(profileData.firstName || "U")[0]}
                {(profileData.lastName || "N")[0]}
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isProcessingImage ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                <span className="text-[10px] text-white font-bold mt-1 uppercase tracking-tighter">Edit Photo</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <p className="text-slate-500 font-medium">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">Patient</Badge>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/30">
                <Shield className="w-3 h-3 mr-1" /> Verified Account
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-6 -mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border shadow-sm p-1 h-12 w-fit">
            <TabsTrigger value="personal" className="px-8 data-[state=active]:bg-slate-100">Personal Info</TabsTrigger>
            <TabsTrigger value="medical" className="px-8 data-[state=active]:bg-slate-100">Medical Info</TabsTrigger>
            <TabsTrigger value="activity" className="px-8 data-[state=active]:bg-slate-100">Activity</TabsTrigger>
            <TabsTrigger value="security" className="px-8 data-[state=active]:bg-slate-100">Security</TabsTrigger>
          </TabsList>

          {/* PERSONAL INFO */}
          <TabsContent value="personal" className="mt-6">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-white py-6">
                <CardTitle className="text-xl font-bold text-slate-800">Personal Information</CardTitle>
                <Button 
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  className={isEditing ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"}
                >
                  {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </Button>
              </CardHeader>

              <CardContent className="p-8 bg-white">
                <div className="space-y-6">
                  {personalRows.map((row, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                          {formatLabel(row.left)}
                        </Label>
                        <Input
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                          value={profileData[row.left]}
                          disabled={!isEditing || row.left === "email"}
                          type={row.left === "dateOfBirth" ? "date" : "text"}
                          onChange={(e) => setProfileData({ ...profileData, [row.left]: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                          {formatLabel(row.right)}
                        </Label>
                        <Input
                          className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                          value={profileData[row.right]}
                          disabled={!isEditing || row.right === "email"}
                          type={row.right === "dateOfBirth" ? "date" : "text"}
                          onChange={(e) => setProfileData({ ...profileData, [row.right]: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEDICAL INFO - UPDATED TO MATCH IMAGE */}
          <TabsContent value="medical" className="mt-6">
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <CardHeader className="border-b bg-white py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Medical Information</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">Your health profile and medical history</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-10">
                {isEditing ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(medicalData).map(([k, v]) => (
                      <div key={k} className="space-y-2">
                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">{formatLabel(k)}</Label>
                        <Input
                          className="h-11 bg-slate-50/50"
                          value={v}
                          onChange={(e) => setMedicalData({ ...medicalData, [k]: e.target.value })}
                        />
                      </div>
                    ))}
                    <Button onClick={handleSave} className="md:col-span-2 mt-4 bg-blue-600 h-11">Save Medical Info</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <Label className="text-[13px] font-semibold text-slate-500">Blood Type</Label>
                        <div className="text-xl font-bold text-slate-900">{medicalData.bloodType || "—"}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[13px] font-semibold text-slate-500">Height</Label>
                        <div className="text-xl font-bold text-slate-900">{medicalData.height || "—"}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[13px] font-semibold text-slate-500">Weight</Label>
                        <div className="text-xl font-bold text-slate-900">{medicalData.weight || "—"} lbs</div>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[13px] font-semibold text-slate-800">Known Allergies</Label>
                        <div className="flex flex-wrap gap-2">
                          {(medicalData.allergies || "").split(",").map((item, i) => (
                            item.trim() && <Badge key={i} className="bg-rose-500 hover:bg-rose-600 text-white border-none px-4 py-1.5 rounded-full">{item.trim()}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[13px] font-semibold text-slate-800">Current Medications</Label>
                        <div className="flex flex-wrap gap-2">
                          {(medicalData.medications || "").split(",").map((item, i) => (
                            item.trim() && <Badge key={i} className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none px-4 py-1.5 rounded-full">{item.trim()}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[13px] font-semibold text-slate-800">Medical Conditions</Label>
                        <div className="flex flex-wrap gap-2">
                          {(medicalData.conditions || "").split(",").map((item, i) => (
                            item.trim() && <Badge key={i} variant="outline" className="border-slate-200 text-slate-600 px-4 py-1.5 rounded-full font-medium">{item.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <hr className="border-slate-100" />

                    <div className="space-y-6">
                      <Label className="text-[13px] font-semibold text-slate-800">Insurance Information</Label>
                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Provider</Label>
                          <div className="text-sm font-medium text-slate-700">{medicalData.insuranceProvider || "—"}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Policy Number</Label>
                          <div className="text-sm font-medium text-slate-700">{medicalData.policyNumber || "—"}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Group Number</Label>
                          <div className="text-sm font-medium text-slate-700">{medicalData.groupNumber || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-none shadow-md max-w-2xl mx-auto">
              <CardHeader className="border-b bg-white">
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6 bg-white">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">Current Password</Label>
                    <Input type={showPwd ? "text" : "password"} 
                      className="h-11 bg-slate-50/50"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">New Password</Label>
                    <Input type={showPwd ? "text" : "password"} 
                      className="h-11 bg-slate-50/50"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">Confirm Password</Label>
                    <Input type={showPwd ? "text" : "password"} 
                      className="h-11 bg-slate-50/50"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setShowPwd(!showPwd)} className="flex-1 h-11">
                    {showPwd ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    Toggle Visibility
                  </Button>
                  <Button onClick={handlePasswordUpdate} className="flex-1 bg-[#1A1F2C] hover:bg-slate-800 h-11">
                    <Lock className="w-4 h-4 mr-2" /> Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITY */}
          <TabsContent value="activity" className="mt-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent className="p-12 text-center text-slate-400">
                <p>Activity tracking is currently being processed.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;