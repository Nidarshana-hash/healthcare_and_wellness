import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star,
  Truck,
  Shield,
  Clock,
  Plus,
  Minus,
  Pill,
  Thermometer,
  Bandage
} from "lucide-react";

// --- Added Firebase Imports ---
import { db, auth } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PharmacyStore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false); // Track loading state

  const medications = [
    {
      id: 1,
      name: "Lisinopril 10mg",
      description: "ACE inhibitor for blood pressure management",
      price: 12.99,
      originalPrice: 15.99,
      category: "Prescription",
      inStock: true,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300",
      requiresPrescription: true,
      manufacturer: "Generic Pharma",
      dosage: "10mg tablets",
      quantity: "30 tablets",
    },
    {
      id: 2,
      name: "Ibuprofen 200mg",
      description: "Pain reliever and anti-inflammatory medication",
      price: 8.49,
      originalPrice: null,
      category: "Over-the-Counter",
      inStock: true,
      rating: 4.6,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1585435557343-3b092031d8d8?w=300",
      requiresPrescription: false,
      manufacturer: "HealthCare Plus",
      dosage: "200mg tablets",
      quantity: "24 tablets",
    },
    {
      id: 3,
      name: "Digital Thermometer",
      description: "Fast and accurate digital thermometer for home use",
      price: 24.99,
      originalPrice: 29.99,
      category: "Medical Devices",
      inStock: true,
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300",
      requiresPrescription: false,
      manufacturer: "MedTech",
      dosage: "Digital",
      quantity: "1 unit",
    },
    {
      id: 4,
      name: "Vitamin D3 1000 IU",
      description: "Essential vitamin supplement for bone health",
      price: 15.99,
      originalPrice: null,
      category: "Vitamins & Supplements",
      inStock: true,
      rating: 4.7,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300",
      requiresPrescription: false,
      manufacturer: "VitaLife",
      dosage: "1000 IU softgels",
      quantity: "90 softgels",
    },
    {
      id: 5,
      name: "Adhesive Bandages",
      description: "Sterile adhesive bandages for minor cuts and wounds",
      price: 6.99,
      originalPrice: null,
      category: "First Aid",
      inStock: true,
      rating: 4.5,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300",
      requiresPrescription: false,
      manufacturer: "CareFirst",
      dosage: "Assorted sizes",
      quantity: "50 bandages",
    },
    {
      id: 6,
      name: "Metformin 500mg",
      description: "Diabetes medication for blood sugar control",
      price: 18.50,
      originalPrice: 22.00,
      category: "Prescription",
      inStock: false,
      rating: 4.8,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1550572017-4356b71a1b8e?w=300",
      requiresPrescription: true,
      manufacturer: "DiabeCare",
      dosage: "500mg tablets",
      quantity: "60 tablets",
    },
  ];

  const categories = [
    { id: "all", name: "All Products", icon: Pill },
    { id: "prescription", name: "Prescription", icon: Pill },
    { id: "over-the-counter", name: "Over-the-Counter", icon: Heart },
    { id: "vitamins", name: "Vitamins & Supplements", icon: Heart },
    { id: "medical-devices", name: "Medical Devices", icon: Thermometer },
    { id: "first-aid", name: "First Aid", icon: Bandage },
  ];

  const addToCart = (productId: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cartItems).reduce((total, [id, count]) => {
      const product = medications.find(m => m.id === parseInt(id));
      return total + (product ? product.price * count : 0);
    }, 0);
  };

  // --- UPDATED Checkout Handler with Firebase Integration ---
  const handleCheckout = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to complete your purchase.");
      return;
    }

    setIsProcessing(true);
    const total = getTotalPrice().toFixed(2);

    try {
      // 1. Save individual items to the 'purchases' collection
      const purchasePromises = Object.entries(cartItems).map(([id, quantity]) => {
        const product = medications.find(m => m.id === parseInt(id));
        if (!product) return Promise.resolve();

        return addDoc(collection(db, "purchases"), {
          userId: user.uid,
          medName: product.name,
          price: product.price,
          quantity: quantity,
          purchasedAt: serverTimestamp(),
        });
      });

      // 2. Add a record to 'notifications' so it shows in the Meds tab
      const notificationPromise = addDoc(collection(db, "notifications"), {
        userId: user.uid,
        title: "Order Placed",
        message: `Your order for ${getTotalItems()} item(s) totaling $${total} was successful.`,
        type: "meds", // This tag helps your notification tab filter the data
        status: "unread",
        createdAt: serverTimestamp(),
      });

      await Promise.all([...purchasePromises, notificationPromise]);

      alert(`Thank you! Your order for $${total} has been placed and saved to your records.`);
      setCartItems({}); // Reset cart
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Error saving purchase. Please check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === "all" || 
                            med.category.toLowerCase().replace(/[^a-z]/g, '-') === activeTab.replace(/[^a-z]/g, '-');
    return matchesSearch && matchesCategory;
  });

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Online Pharmacy
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Order medications and health products with fast, secure delivery
              </p>
              
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <Card className="card-shadow bg-white/90 backdrop-blur-sm border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <ShoppingCart className="w-6 h-6 text-primary" />
                      {getTotalItems() > 0 && (
                        <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-accent text-accent-foreground">
                          {getTotalItems()}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">${getTotalPrice().toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
                      </p>
                    </div>
                    <Button 
                      variant="medical" 
                      size="sm" 
                      disabled={getTotalItems() === 0 || isProcessing}
                      onClick={handleCheckout}
                    >
                      {isProcessing ? "Saving..." : "Checkout"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/50 backdrop-blur-sm border">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-border bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Truck className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="font-medium text-foreground">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </CardContent>
              </Card>
              <Card className="border border-border bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground">Licensed Pharmacy</p>
                  <p className="text-sm text-muted-foreground">FDA regulated & certified</p>
                </CardContent>
              </Card>
              <Card className="border border-border bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-4 text-center">
                  <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="font-medium text-foreground">Fast Delivery</p>
                  <p className="text-sm text-muted-foreground">Same-day in select areas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedications.map((medication) => (
                <Card key={medication.id} className="card-shadow hover:hover-shadow medical-transition bg-white/90 backdrop-blur-sm">
                  <div className="relative">
                    <img 
                      src={medication.image} 
                      alt={medication.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {medication.requiresPrescription && (
                      <Badge className="absolute top-2 left-2 bg-primary text-white">
                        Prescription Required
                      </Badge>
                    )}
                    {!medication.inStock && (
                      <Badge className="absolute top-2 right-2 bg-destructive text-white">
                        Out of Stock
                      </Badge>
                    )}
                    {medication.originalPrice && (
                      <Badge className="absolute bottom-2 right-2 bg-accent text-white">
                        Save ${(medication.originalPrice - medication.price).toFixed(2)}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">{medication.description}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{medication.manufacturer}</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{medication.rating} ({medication.reviews})</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <strong>Dosage:</strong> {medication.dosage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Quantity:</strong> {medication.quantity}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-foreground">${medication.price}</span>
                          {medication.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              ${medication.originalPrice}
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {medication.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {cartItems[medication.id] ? (
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeFromCart(medication.id)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {cartItems[medication.id]}
                            </span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => addToCart(medication.id)}
                              disabled={!medication.inStock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="medical" 
                            size="sm" 
                            onClick={() => addToCart(medication.id)}
                            disabled={!medication.inStock}
                            className="flex-1"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {medication.inStock ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMedications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No products found matching your criteria
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PharmacyStore;