"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";

import {
  Bell,
  Calendar,
  Pill,
  FileText,
  Heart,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Mail,
  ShoppingBag,
} from "lucide-react";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";

/* ---------------- TYPES ---------------- */

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  isRead: boolean;
  createdAt: any;
}

interface Purchase {
  id: string;
  medName: string;
  price: number;
  quantity: number;
  purchasedAt: any;
}

/* -------------- ICON MAP --------------- */

const iconMap: Record<string, any> = {
  appointment: Calendar,
  prescription: Pill,
  lab_results: FileText,
  wellness: Heart,
  purchase: ShoppingBag,
};

/* -------------- COMPONENT -------------- */

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- ✅ UPDATED FIREBASE LISTENER ---------- */
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;
    let unsubscribePurchases: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setNotifications([]);
        setPurchases([]);
        setLoading(false);
        return;
      }

      // Notifications Query
      const qN = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      // Purchases Query
      const qP = query(
        collection(db, "purchases"),
        where("userId", "==", user.uid),
        orderBy("purchasedAt", "desc")
      );

      unsubscribeFirestore = onSnapshot(qN, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Notification, "id">),
        }));
        setNotifications(data);
        setLoading(false);
      }, (err) => console.error(err));

      unsubscribePurchases = onSnapshot(qP, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Purchase, "id">),
        }));
        setPurchases(data);
      }, (err) => console.error(err));
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribePurchases) unsubscribePurchases();
    };
  }, []);

  /* ---------- ACTIONS ---------- */

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { isRead: true });
  };

  const markAsUnread = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { isRead: false });
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id));
  };

  const markAllAsRead = async () => {
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) =>
          updateDoc(doc(db, "notifications", n.id), { isRead: true })
        )
    );
  };

  /* ---------- FILTERS ---------- */

  const filteredNotifications = () => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "appointments":
        return notifications.filter((n) => n.type === "appointment");
      case "prescriptions":
        // COMBINES Prescriptions and Purchases for the "Meds" tab
        return notifications.filter((n) => n.type === "prescription");
      case "health":
        return notifications.filter(
          (n) => n.type === "lab_results" || n.type === "wellness"
        );
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-destructive text-white";
    if (p === "medium") return "bg-primary text-white";
    return "bg-secondary text-secondary-foreground";
  };

  /* ---------- UI ---------- */

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(https://th.bing.com/th/id/OIP.jEIorB3Kbxka1-dkG2oLTwHaDF?w=306&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10">
        <section className="py-8 bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center text-slate-900">
                  <Bell className="mr-3 text-blue-600" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="ml-3 bg-blue-600">{unreadCount} unread</Badge>
                  )}
                </h1>
                <p className="text-slate-500 font-medium">
                  Stay updated with your healthcare activities
                </p>
              </div>

              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="rounded-xl bg-white/50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 bg-white/70 backdrop-blur-md border p-1 rounded-2xl shadow-sm">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="unread" className="rounded-xl">Unread</TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-xl">Apps</TabsTrigger>
              <TabsTrigger value="prescriptions" className="rounded-xl">Meds</TabsTrigger>
              <TabsTrigger value="health" className="rounded-xl">Health</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-8">
              {loading ? (
                <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
                  <CardContent className="text-center py-20">
                    <Clock className="animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-slate-500">Loading notifications...</p>
                  </CardContent>
                </Card>
              ) : (activeTab === "prescriptions" && purchases.length > 0) || filteredNotifications().length > 0 ? (
                <>
                  {/* PURCHASE HISTORY SECTION (VISIBLE ONLY IN ALL OR MEDS TAB) */}
                  {(activeTab === "all" || activeTab === "prescriptions") && purchases.map((p) => (
                    <Card key={p.id} className="border-none shadow-sm bg-white/90 backdrop-blur-sm overflow-hidden mb-4 ring-1 ring-emerald-500/30">
                      <CardContent className="p-5 flex space-x-4 items-center">
                        <div className="p-3 rounded-2xl bg-emerald-600 shadow-md shadow-emerald-200">
                          <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-bold text-slate-800">Order Purchased: {p.medName}</h3>
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Confirmed</Badge>
                          </div>
                          <p className="text-sm text-slate-600">You bought {p.quantity} unit(s) for ${p.price.toFixed(2)}</p>
                          <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase mt-2">
                             <Clock className="w-3 h-3 mr-1" />
                             {p.purchasedAt?.toDate().toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* NOTIFICATIONS SECTION */}
                  {filteredNotifications().map((n) => {
                    const Icon = iconMap[n.type] || Bell;
                    return (
                      <Card
                        key={n.id}
                        className={`border-none shadow-sm transition-all overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white ${
                          !n.isRead ? "ring-1 ring-blue-500/50" : ""
                        }`}
                      >
                        <CardContent className="p-5">
                          <div className="flex space-x-4">
                            <div className={`p-3 rounded-2xl shrink-0 ${n.isRead ? "bg-slate-100" : "bg-blue-600 shadow-md shadow-blue-200"}`}>
                              <Icon className={`w-5 h-5 ${n.isRead ? "text-slate-400" : "text-white"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 truncate">{n.title}</h3>
                                <Badge className={`${priorityColor(n.priority)} rounded-full text-[10px] uppercase font-bold`}>
                                  {n.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{n.message}</p>
                              <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {n.createdAt?.toDate().toLocaleString()}
                                </div>
                                <div className="flex space-x-2">
                                  {!n.isRead ? (
                                    <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs font-bold" onClick={() => markAsRead(n.id)}>Mark Read</Button>
                                  ) : (
                                    <Button size="sm" variant="ghost" className="rounded-xl h-8 text-xs font-bold text-slate-400" onClick={() => markAsUnread(n.id)}><Mail className="w-3 h-3 mr-1" />Unread</Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="rounded-xl h-8 w-8 p-0 text-rose-500 hover:bg-rose-50" onClick={() => deleteNotification(n.id)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <Card className="bg-white/40 backdrop-blur-sm border-dashed border-2 py-20 text-center text-slate-400">
                  <CardContent>
                    <Bell className="mx-auto mb-3 text-slate-300 w-12 h-12" />
                    <p className="font-medium text-lg">No notifications found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Card className="mt-12 border-none shadow-lg bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="flex items-center text-xl">
                <Settings className="mr-2 text-emerald-400" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-slate-400">Customize how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Appointment Reminders</span>
                    <p className="text-xs text-slate-400">Get alerted for upcoming visits</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                 <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Email Notifications</span>
                    <p className="text-xs text-slate-400">Receive summaries in your inbox</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;