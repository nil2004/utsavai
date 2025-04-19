import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  SendHorizontal, 
  Bot, 
  PlusCircle, 
  Filter, 
  Cake, 
  Camera, 
  Mic, 
  Building, 
  PaintRoller, 
  ArrowDown, 
  Star,
  CheckCircle,
  Calendar,
  Phone,
  MapPin,
  User,
  MessageSquare,
  Gift
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import VendorDetailsDialog from '@/components/VendorDetailsDialog';
import { saveCompleteEventRequest, createEventRequest } from '@/lib/event-service';
import { getFrontendVendors } from '@/lib/vendor-service';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { saveFormDataToEmail } from '@/lib/email-service';
import FreeOfferForm from '@/components/FreeOfferForm';
import { useAdminAuth } from '@/lib/admin-auth-context';

// Define TypeScript interfaces
interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  price: number;
  image: string;
  city: string;
}

interface VendorChecklistItem {
  id: string;
  name: string;
  selected: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string | VendorChecklistItem[];
  isVendorList?: boolean;
  isVendorSuggestions?: boolean;
  vendors?: Vendor[];
}

interface EventType {
  id: string;
  name: string;
  emoji: string;
}

// Event types for selection
const eventTypes: EventType[] = [
  { id: 'wedding', name: 'Wedding', emoji: '👰' },
  { id: 'collegeFest', name: 'College Fest', emoji: '🎓' },
  { id: 'schoolEvent', name: 'School Event', emoji: '🏫' },
  { id: 'corporate', name: 'Corporate Event', emoji: '💼' },
  { id: 'birthday', name: 'Birthday', emoji: '🎂' },
  { id: 'custom', name: 'Custom Event', emoji: '✨' },
];

// Expanded sample vendor data for demonstration, grouped by type
const sampleVendors: Vendor[] = [
  // Decorators
  {
    id: 1,
    name: "Elegant Decorations",
    category: "Decorator",
    rating: 4.8,
    reviewCount: 124,
    priceRange: "₹15,000 - ₹50,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    city: "Mumbai",
  },
  {
    id: 4,
    name: "Luxury Decorations",
    category: "Decorator",
    rating: 4.9,
    reviewCount: 142,
    priceRange: "₹30,000 - ₹100,000",
    price: 60000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    city: "Delhi",
  },
  {
    id: 5,
    name: "Budget Decorations",
    category: "Decorator",
    rating: 4.5,
    reviewCount: 98,
    priceRange: "₹8,000 - ₹20,000",
    price: 12000,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070",
    city: "Mumbai",
  },
  
  // Photographers
  {
    id: 2,
    name: "Capture Moments",
    category: "Photographer",
    rating: 4.9,
    reviewCount: 89,
    priceRange: "₹20,000 - ₹80,000",
    price: 40000,
    image: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?q=80&w=2070",
    city: "Delhi",
  },
  {
    id: 6,
    name: "PixelPerfect",
    category: "Photographer",
    rating: 4.7,
    reviewCount: 105,
    priceRange: "₹15,000 - ₹60,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1567156345300-e9a8844b19cc?q=80&w=2070",
    city: "Bangalore",
  },
  {
    id: 22,
    name: "Cinematic Visions",
    category: "Photographer",
    rating: 4.8,
    reviewCount: 76,
    priceRange: "₹22,000 - ₹95,000",
    price: 35000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2688",
    city: "Mumbai",
  },
  
  // Caterers
  {
    id: 3,
    name: "Tasty Feasts",
    category: "Caterer",
    rating: 4.7,
    reviewCount: 156,
    priceRange: "₹500 - ₹1,200 per plate",
    price: 30000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Bangalore",
  },
  {
    id: 7,
    name: "Gourmet Delights",
    category: "Caterer",
    rating: 4.8,
    reviewCount: 178,
    priceRange: "₹800 - ₹2,000 per plate",
    price: 50000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Delhi",
  },
  {
    id: 8,
    name: "Budget Eats",
    category: "Caterer",
    rating: 4.3,
    reviewCount: 87,
    priceRange: "₹300 - ₹600 per plate",
    price: 15000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Mumbai",
  },
  
  // Venues
  {
    id: 9,
    name: "Grand Plaza Hotel",
    category: "Venue",
    rating: 4.8,
    reviewCount: 215,
    priceRange: "₹75,000 - ₹200,000",
    price: 100000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    city: "Mumbai",
  },
  {
    id: 10,
    name: "Sunset Banquet Hall",
    category: "Venue",
    rating: 4.6,
    reviewCount: 168,
    priceRange: "₹50,000 - ₹150,000",
    price: 80000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    city: "Delhi",
  },
  {
    id: 11,
    name: "Garden View Resort",
    category: "Venue",
    rating: 4.5,
    reviewCount: 142,
    priceRange: "₹40,000 - ₹120,000",
    price: 60000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    city: "Bangalore",
  },
  
  // Sound & Lighting
  {
    id: 12,
    name: "Dynamic Sound Systems",
    category: "Sound & Lighting",
    rating: 4.7,
    reviewCount: 93,
    priceRange: "₹25,000 - ₹80,000",
    price: 40000,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    city: "Mumbai",
  },
  {
    id: 13,
    name: "Elite Audio Visual",
    category: "Sound & Lighting",
    rating: 4.9,
    reviewCount: 107,
    priceRange: "₹35,000 - ₹100,000",
    price: 55000,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    city: "Delhi",
  },
  {
    id: 14,
    name: "Budget Sound Solutions",
    category: "Sound & Lighting",
    rating: 4.4,
    reviewCount: 68,
    priceRange: "₹15,000 - ₹40,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    city: "Bangalore",
  },
  
  // Entertainment
  {
    id: 15,
    name: "Rhythm Band",
    category: "Entertainment",
    rating: 4.8,
    reviewCount: 124,
    priceRange: "₹30,000 - ₹80,000",
    price: 50000,
    image: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070",
    city: "Mumbai",
  },
  {
    id: 16,
    name: "Comedy Central Group",
    category: "Entertainment",
    rating: 4.7,
    reviewCount: 98,
    priceRange: "₹25,000 - ₹60,000",
    price: 35000,
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2024",
    city: "Delhi",
  },
  {
    id: 17,
    name: "Magic Moments Show",
    category: "Entertainment",
    rating: 4.6,
    reviewCount: 86,
    priceRange: "₹20,000 - ₹50,000",
    price: 30000,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074",
    city: "Bangalore",
  },
  
  // Anchors
  {
    id: 18,
    name: "Elite Anchors",
    category: "Anchor",
    rating: 4.9,
    reviewCount: 115,
    priceRange: "₹15,000 - ₹40,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1564510714747-69c3bc1fab41?q=80&w=1000",
    city: "Mumbai",
  },
  {
    id: 19,
    name: "Professional Hosts",
    category: "Anchor",
    rating: 4.8,
    reviewCount: 92,
    priceRange: "₹12,000 - ₹35,000",
    price: 20000,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000",
    city: "Delhi",
  },
  {
    id: 20,
    name: "Event Masters",
    category: "Anchor",
    rating: 4.7,
    reviewCount: 78,
    priceRange: "₹10,000 - ₹30,000",
    price: 18000,
    image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=2070",
    city: "Bangalore",
  },
  
  // Makeup Artists
  {
    id: 21,
    name: "Glamour Touch",
    category: "Makeup Artist",
    rating: 4.9,
    reviewCount: 145,
    priceRange: "₹15,000 - ₹50,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    city: "Mumbai",
  },
  {
    id: 23,
    name: "Bridal Beauty",
    category: "Makeup Artist",
    rating: 4.8,
    reviewCount: 132,
    priceRange: "₹18,000 - ₹60,000",
    price: 35000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    city: "Delhi",
  },
  {
    id: 24,
    name: "Perfect Look",
    category: "Makeup Artist",
    rating: 4.7,
    reviewCount: 118,
    priceRange: "₹12,000 - ₹40,000",
    price: 20000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    city: "Bangalore",
  },
];

// Default checklist items based on event type
const defaultVendorChecklists: Record<string, VendorChecklistItem[]> = {
  wedding: [
    { id: 'decorator', name: 'Decorator', selected: true },
    { id: 'photographer', name: 'Photographer', selected: true },
    { id: 'caterer', name: 'Caterer', selected: true },
    { id: 'makeup', name: 'Makeup Artist', selected: true },
    { id: 'venue', name: 'Venue', selected: true },
    { id: 'sound', name: 'Sound & Lighting', selected: true },
    { id: 'entertainment', name: 'Entertainment', selected: false },
    { id: 'anchor', name: 'Anchor', selected: false },
  ],
  birthday: [
    { id: 'caterer', name: 'Caterer', selected: true },
    { id: 'decorator', name: 'Decorator', selected: true },
    { id: 'photographer', name: 'Photographer', selected: true },
    { id: 'entertainment', name: 'Entertainment', selected: true },
    { id: 'venue', name: 'Venue', selected: false },
    { id: 'sound', name: 'Sound & Lighting', selected: false },
    { id: 'anchor', name: 'Anchor', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ],
  corporate: [
    { id: 'venue', name: 'Venue', selected: true },
    { id: 'caterer', name: 'Caterer', selected: true },
    { id: 'sound', name: 'Sound & Lighting', selected: true },
    { id: 'anchor', name: 'Anchor', selected: true },
    { id: 'photographer', name: 'Photographer', selected: true },
    { id: 'decorator', name: 'Decorator', selected: false },
    { id: 'entertainment', name: 'Entertainment', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ],
  collegeFest: [
    { id: 'sound', name: 'Sound & Lighting', selected: true },
    { id: 'entertainment', name: 'Entertainment', selected: true },
    { id: 'anchor', name: 'Anchor', selected: true },
    { id: 'photographer', name: 'Photographer', selected: true },
    { id: 'caterer', name: 'Caterer', selected: false },
    { id: 'decorator', name: 'Decorator', selected: false },
    { id: 'venue', name: 'Venue', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ],
  schoolEvent: [
    { id: 'decorator', name: 'Decorator', selected: true },
    { id: 'photographer', name: 'Photographer', selected: true },
    { id: 'caterer', name: 'Caterer', selected: true },
    { id: 'sound', name: 'Sound & Lighting', selected: true },
    { id: 'anchor', name: 'Anchor', selected: false },
    { id: 'entertainment', name: 'Entertainment', selected: false },
    { id: 'venue', name: 'Venue', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ],
  custom: [
    { id: 'decorator', name: 'Decorator', selected: false },
    { id: 'photographer', name: 'Photographer', selected: false },
    { id: 'caterer', name: 'Caterer', selected: false },
    { id: 'venue', name: 'Venue', selected: false },
    { id: 'sound', name: 'Sound & Lighting', selected: false },
    { id: 'entertainment', name: 'Entertainment', selected: false },
    { id: 'anchor', name: 'Anchor', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ],
  default: [
    { id: 'decorator', name: 'Decorator', selected: false },
    { id: 'photographer', name: 'Photographer', selected: false },
    { id: 'caterer', name: 'Caterer', selected: false },
    { id: 'anchor', name: 'Anchor', selected: false },
    { id: 'sound', name: 'Sound & Lighting', selected: false },
    { id: 'venue', name: 'Venue', selected: false },
    { id: 'entertainment', name: 'Entertainment', selected: false },
    { id: 'makeup', name: 'Makeup Artist', selected: false },
  ]
};

// Get vendor icon based on category
const getVendorIcon = (category: string) => {
  switch(category.toLowerCase()) {
    case 'caterer':
      return <Cake className="h-5 w-5" />;
    case 'photographer':
      return <Camera className="h-5 w-5" />;
    case 'decorator':
      return <PaintRoller className="h-5 w-5" />;
    case 'venue':
      return <Building className="h-5 w-5" />;
    case 'entertainment':
      return <Mic className="h-5 w-5" />;
    case 'anchor':
      return <Mic className="h-5 w-5" />;
    default:
      return <PlusCircle className="h-5 w-5" />;
  }
};

interface MessageProps {
  sender: 'user' | 'bot';
  content: string | VendorChecklistItem[];
  isVendorList?: boolean;
  isVendorSuggestions?: boolean;
  vendors?: Vendor[];
  onBookVendor?: (vendor: Vendor) => void;
  onConfirm?: () => void;
  selectedVendors?: Vendor[];
}

// Message component to display chat messages
const Message: React.FC<MessageProps> = ({ 
  sender, 
  content, 
  isVendorList = false, 
  isVendorSuggestions = false, 
  vendors = [], 
  onBookVendor = () => {}, 
  onConfirm = () => {},
  selectedVendors = []
}) => {
  const [checklist, setChecklist] = useState<VendorChecklistItem[]>(content as VendorChecklistItem[]);
  
  const handleItemToggle = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {sender === 'bot' && (
        <div className="mr-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot size={18} className="text-blue-600" />
          </div>
        </div>
      )}
      
      <div className={`rounded-lg p-3 max-w-[85%] sm:max-w-[75%] ${
        sender === 'user' 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-800 rounded-bl-none'
      }`}>
        {isVendorList ? (
          <div>
            <p className="font-medium mb-3">Please select the vendors you need:</p>
            <div className="space-y-2">
              {(content as VendorChecklistItem[]).map((item) => (
                <div key={item.id} className="flex items-center">
                  <Checkbox 
                    id={item.id} 
                    checked={item.selected}
                    onCheckedChange={() => handleItemToggle(item.id)}
                  />
                  <label htmlFor={item.id} className="ml-2 text-sm cursor-pointer">
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
            <Button className="mt-3 w-full sm:w-auto" onClick={onConfirm}>
              Confirm Selection
            </Button>
          </div>
        ) : isVendorSuggestions ? (
          <div>
            <p className="font-medium mb-3">Here are some vendor suggestions based on your needs:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden border shadow-sm hover:shadow transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={vendor.image} 
                      alt={vendor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm">{vendor.name}</h3>
                      <div className="flex items-center text-amber-500">
                        <Star size={14} className="fill-current" />
                        <span className="text-xs ml-1">{vendor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin size={12} className="mr-1" />
                      <span>{vendor.city}</span>
                    </div>
                    <div className="text-xs font-medium mb-2">{vendor.priceRange}</div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs h-8"
                      onClick={() => onBookVendor(vendor)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-3 text-xs">
              {selectedVendors.length > 0 && (
                <p className="font-medium">You've selected {selectedVendors.length} vendor(s) so far.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm sm:text-base">{content as string}</p>
        )}
      </div>
      
      {sender === 'user' && (
        <div className="ml-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

interface BookingFormProps {
  vendor: Vendor;
  onClose: (success: boolean) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ vendor, onClose }) => {
  const [date, setDate] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      onClose(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Book {vendor.name}</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
          <div>
                <Label htmlFor="date">Event Date</Label>
            <Input 
                  id="date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
                <Label htmlFor="requirements">Special Requirements</Label>
            <textarea 
                  id="requirements"
                  className="min-h-[100px] w-full border rounded-md p-3 resize-none"
                  placeholder="Any specific requirements or preferences..."
            />
          </div>
          
              <div className="pt-4 flex justify-end space-x-2">
                        <Button 
              type="button" 
              variant="outline" 
              onClick={() => onClose(false)}
            >
              Cancel
                        </Button>
                <Button type="submit">Express Interest</Button>
                      </div>
          </div>
        </form>
                    </div>
                  </Card>
              </div>
  );
};

interface BudgetInputProps {
  budget: string;
  setBudget: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: () => void;
}

const BudgetInput: React.FC<BudgetInputProps> = ({ budget, setBudget, onConfirm }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Label htmlFor="budget" className="whitespace-nowrap">Enter your budget (₹):</Label>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          id="budget"
          type="number"
          min="5000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-32"
          placeholder="e.g. 50000"
        />
        <Button onClick={onConfirm} disabled={!budget}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

interface LocationInputProps {
  location: string;
  setLocation: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ location, setLocation, onConfirm }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      <Label htmlFor="location" className="whitespace-nowrap">Event Location:</Label>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full"
          placeholder="e.g. Mumbai"
        />
        <Button onClick={onConfirm} disabled={!location}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

// First, let's create a new component for collecting user details
interface UserDetailsFormProps {
  onSubmit: (name: string, phone: string, specialRequests: string) => void;
  onCancel: () => void;
  selectedVendorsCount: number;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({ onSubmit, onCancel, selectedVendorsCount }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(name, phone, specialRequests);
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Contact Details
          </h2>
          <p className="text-gray-600 mb-4">
            Please provide your contact information for {selectedVendorsCount} selected vendors
          </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              required
                className="bg-white/50"
                disabled={isSubmitting}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
                className="bg-white/50"
                disabled={isSubmitting}
            />
          </div>
          <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
            <textarea 
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements or preferences..."
                className="w-full min-h-[80px] rounded-md border border-gray-300 bg-white/50 px-3 py-2 text-sm"
                disabled={isSubmitting}
            />
          </div>
            <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
                onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
                className="bg-accent hover:bg-accent/90"
              disabled={isSubmitting}
            >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting...</span>
            </div>
                ) : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
      </Card>
    </div>
  );
};

// Add a success popup component
interface SuccessPopupProps {
  onClose: () => void;
  requestId?: number;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ onClose, requestId }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);  // Auto close after 6 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300 pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md pointer-events-auto animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
          <div>
              <h3 className="font-semibold text-lg">Thank you!</h3>
              <p className="text-gray-600">Our UtsavAI team will connect with you within 24 hours.</p>
          </div>
        </div>
          
          {requestId && (
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Request ID:</span> #{requestId}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please save this ID for your reference
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Update the budget allocation helper function
const getBudgetAllocation = (eventType: string, totalBudget: number, equalSplit: boolean = false): Record<string, number> => {
  // Default allocation percentages for different event types
  const allocationPercentages: Record<string, Record<string, number>> = {
    wedding: {
      'Decorator': 25,
      'Photographer': 15,
      'Caterer': 30,
      'Venue': 15,
      'Makeup Artist': 8,
      'Sound & Lighting': 5,
      'Entertainment': 2
    },
    birthday: {
      'Caterer': 35,
      'Decorator': 20,
      'Photographer': 15,
      'Entertainment': 15,
      'Venue': 10,
      'Sound & Lighting': 5
    },
    corporate: {
      'Venue': 30,
      'Caterer': 35,
      'Sound & Lighting': 15,
      'Photographer': 10,
      'Anchor': 10
    },
    collegeFest: {
      'Sound & Lighting': 30,
      'Entertainment': 25,
      'Venue': 20,
      'Anchor': 15,
      'Photographer': 10
    },
    schoolEvent: {
      'Decorator': 25,
      'Caterer': 30,
      'Venue': 20,
      'Sound & Lighting': 15,
      'Photographer': 10
    },
    custom: {
      'Decorator': 15,
      'Photographer': 15,
      'Caterer': 20,
      'Venue': 20,
      'Sound & Lighting': 10,
      'Entertainment': 10,
      'Anchor': 5,
      'Makeup Artist': 5
    }
  };

  // Get the allocation percentages for the selected event type or use custom as default
  const percentages = allocationPercentages[eventType] || allocationPercentages.custom;
  
  // Calculate the allocated budget for each vendor type
  const allocations: Record<string, number> = {};
  
  if (equalSplit) {
    // Equal split - divide budget equally among selected vendor types
    const selectedVendorTypes = Object.keys(percentages).filter(type => 
      percentages[type] > 0
    );
    
    const equalAmount = Math.floor(totalBudget / selectedVendorTypes.length);
    let remaining = totalBudget;
    
    selectedVendorTypes.forEach((vendorType, index) => {
      // Last item gets remaining amount to avoid rounding errors
      if (index === selectedVendorTypes.length - 1) {
        allocations[vendorType] = remaining;
      } else {
        allocations[vendorType] = equalAmount;
        remaining -= equalAmount;
      }
    });
  } else {
    // Proportional split based on percentages
    let totalAllocated = 0;
    
    // First pass - allocate based on percentages
    Object.entries(percentages).forEach(([vendorType, percentage]) => {
      const amount = Math.floor((percentage / 100) * totalBudget);
      allocations[vendorType] = amount;
      totalAllocated += amount;
    });
    
    // Handle any rounding discrepancy
    const remainingAmount = totalBudget - totalAllocated;
    if (remainingAmount > 0) {
      // Find the vendor type with the highest percentage and add the remainder to it
      const highestVendorType = Object.entries(percentages)
        .sort(([, a], [, b]) => b - a)[0][0];
      allocations[highestVendorType] += remainingAmount;
    }
  }
  
  return allocations;
};

// Budget allocation component
interface BudgetAllocationProps {
  eventType: string;
  budget: string;
}

const BudgetAllocation: React.FC<BudgetAllocationProps> = ({ eventType, budget }) => {
  const [isEqualSplit, setIsEqualSplit] = useState<boolean>(false);
  const totalBudget = parseInt(budget) || 0;
  const allocations = getBudgetAllocation(eventType, totalBudget, isEqualSplit);
  
  // Sort allocations by budget amount (descending)
  const sortedAllocations = Object.entries(allocations)
    .sort(([, amountA], [, amountB]) => amountB - amountA);

  // Calculate total to verify accuracy
  const totalAllocated = sortedAllocations.reduce((sum, [, amount]) => sum + amount, 0);
  const isAccurate = totalAllocated === totalBudget;

  return (
    <div className="flex justify-start mb-6 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-5 max-w-[95%] w-full shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Budget Allocation for {eventTypes.find(e => e.id === eventType)?.name || 'Your Event'}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Split Equally</label>
            <div 
              role="checkbox"
              aria-checked={isEqualSplit}
              tabIndex={0}
              onClick={() => setIsEqualSplit(!isEqualSplit)}
              className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${isEqualSplit ? 'bg-accent' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${isEqualSplit ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between font-medium">
            <span>Vendor Type</span>
            <span>Allocation</span>
          </div>
          
          {sortedAllocations.map(([vendorType, amount], index) => {
            const percentage = Math.round((amount / totalBudget) * 100);
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getVendorIcon(vendorType)}
                    <span>{vendorType}</span>
            </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">₹{amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{percentage}% of budget</span>
            </div>
          </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
          </div>
          </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between p-3 bg-violet-50/50 rounded-lg border border-violet-100/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Budget:</span>
            {isAccurate && <span className="text-xs text-green-500 px-1.5 py-0.5 bg-green-50 rounded-full">Accurate Split</span>}
          </div>
          <div className="font-bold text-lg">₹{totalBudget.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

const ChatPage: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      content: "Hello! I'm your event buddy. I can help you plan your event and find the right vendors. What kind of event are you planning?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showingVendorsList, setShowingVendorsList] = useState<boolean>(false);
  const [vendorChecklist, setVendorChecklist] = useState<VendorChecklistItem[]>([]);
  const [showingLocationInput, setShowingLocationInput] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('');
  const [showingBudgetInput, setShowingBudgetInput] = useState<boolean>(false);
  const [budget, setBudget] = useState<string>('');
  const [showingBudgetAllocation, setShowingBudgetAllocation] = useState<boolean>(false);
  const [suggestedVendors, setSuggestedVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [bookingVendor, setBookingVendor] = useState<Vendor | null>(null);
  const [showingUserDetailsForm, setShowingUserDetailsForm] = useState<boolean>(false);
  const [submittedInterest, setSubmittedInterest] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [lastRequestId, setLastRequestId] = useState<number | undefined>(undefined);
  const [showingFreeOfferForm, setShowingFreeOfferForm] = useState<boolean>(false);
  const [showEventTypes, setShowEventTypes] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [eventProgress, setEventProgress] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConsultationForm, setShowConsultationForm] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Add function to reset chat
  const resetChat = () => {
    setMessages([
      {
        id: '1',
        sender: 'bot',
        content: "Hello! I'm your event buddy. I can help you plan your event and find the right vendors. What kind of event are you planning?",
      },
    ]);
    setInput('');
    setSelectedEvent(null);
    setShowingVendorsList(false);
    setVendorChecklist([]);
    setShowingLocationInput(false);
    setLocation('');
    setShowingBudgetInput(false);
    setBudget('');
    setShowingBudgetAllocation(false);
    setSuggestedVendors([]);
    setSelectedVendors([]);
    setSubmittedInterest(false);
    setEventProgress(0);
    setShowEventTypes(false);
  };

  useEffect(() => {
    // Only scroll if auto-scroll is enabled and the user is near the bottom
    if (!shouldAutoScroll) {
      setShouldAutoScroll(true); // Re-enable auto-scroll for next message
      return;
    }

    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const { scrollHeight, scrollTop, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom || messages.length <= 1) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }, 100);
      }
    }
  }, [messages, shouldAutoScroll]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;
    
    setShouldAutoScroll(isScrolledToBottom);
    setShowScrollToBottom(!isScrolledToBottom);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    setShouldAutoScroll(true); // Enable auto-scroll for new messages
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Show "Coming Soon" message
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
          sender: 'bot', 
        content: "🔜 This feature is coming soon! Currently, we're focused on helping you plan events through our guided flow. Please select an event type to get started.",
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleEventSelect = (eventType: string) => {
    setSelectedEvent(eventType);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: `I'm planning a ${eventTypes.find(e => e.id === eventType)?.name}`,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add bot response and show vendor checklist
    setTimeout(() => {
      const checklist = defaultVendorChecklists[eventType] || defaultVendorChecklists.default;
      setVendorChecklist(checklist);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
          sender: 'bot', 
        content: checklist,
        isVendorList: true,
      };
      
      setMessages(prev => [...prev, botResponse]);
      setShowingVendorsList(true);
    }, 1000);
  };

  const handleVendorChecklistConfirm = () => {
    setShouldAutoScroll(true); // Enable auto-scroll for vendor checklist confirmation
    setShowingVendorsList(false);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: `I've selected the vendors I need.`,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
          sender: 'bot', 
        content: "Great! Now, where will your event be held?",
      };
      
      setMessages(prev => [...prev, botResponse]);
      setShowingLocationInput(true);
    }, 1000);
  };

  const handleLocationConfirm = () => {
    setShowingLocationInput(false);
    
    // Add user message with location
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: location,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add bot response asking for budget
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
          sender: 'bot', 
        content: "Thank you! What's your approximate budget for this event?",
      };
      
      setMessages(prev => [...prev, botResponse]);
      setShowingBudgetInput(true);
    }, 1000);
  };

  // Handle budget confirmation
  const handleBudgetConfirm = () => {
    setShowingBudgetInput(false);
    
    // Format the budget for display
    const formattedBudget = parseInt(budget).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    
    // Add user message about budget
    const userBudgetMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: `My budget is ${formattedBudget}`
    };
    
    setMessages(prev => [...prev, userBudgetMessage]);
    
    // Show "thinking" while loading budget allocation
    setShowingBudgetAllocation(true);
    
    // Add bot response acknowledging budget
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
          sender: 'bot', 
      content: `Great! Here's how you might allocate your budget of ${formattedBudget} for your ${eventTypes.find(e => e.id === selectedEvent)?.name || 'event'}:`
    };
    
    setMessages(prev => [...prev, botResponse]);
    
    // Wait to show budget allocation before proceeding to vendor suggestions
    setTimeout(() => {
      // Show vendor suggestions after budget allocation has been shown
      showVendorSuggestions().catch(error => {
        console.error('Error showing vendor suggestions:', error);
      });
    }, 2000); // 2 seconds to view the budget allocation
  };

  const showVendorSuggestions = async () => {
    try {
      setLoading(true);
      
      // Filter criteria for getting relevant vendors
      const filterCriteria = {
        city: location,
        maxPrice: parseInt(budget) || undefined
        // No status filter to ensure we show all vendors
      };
      
      // Get vendors from Supabase
      const supabaseVendors = await getFrontendVendors(filterCriteria);
      
      console.log(`Loaded ${supabaseVendors.length} vendors from database`);
      
      // If no vendors found, use sample data as fallback (for development)
      let availableVendors = supabaseVendors.length > 0 ? supabaseVendors : sampleVendors;
      
      // Map Supabase vendors to the interface expected by the UI
      availableVendors = availableVendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        rating: vendor.rating,
        reviewCount: Math.floor(Math.random() * 100) + 50, // Not stored in DB, generate for UI
        priceRange: `₹${(vendor.price * 0.7).toLocaleString()} - ₹${(vendor.price * 1.3).toLocaleString()}`,
        price: vendor.price,
        image: vendor.image_url || "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
        city: vendor.city
      }));
      
      // Filter only vendors in requested location (if any)
      if (location && location !== '') {
        availableVendors = availableVendors.filter(vendor => 
          vendor.city.toLowerCase() === location.toLowerCase()
        );
      }
      
      // Budget filter (if specified)
      if (budget && budget !== '') {
        const maxBudget = parseInt(budget);
        availableVendors = availableVendors.filter(vendor => vendor.price <= maxBudget);
      }

      // IMPORTANT: Filter vendors to only show categories that the user selected
      const selectedVendorCategories = messages
        .filter(msg => msg.isVendorList && Array.isArray(msg.content))
        .flatMap(msg => Array.isArray(msg.content) 
          ? msg.content.filter(item => item.selected).map(item => item.name) 
          : []
        );

      console.log("Selected vendor categories:", selectedVendorCategories);
      
      if (selectedVendorCategories.length > 0) {
        availableVendors = availableVendors.filter(vendor => 
          selectedVendorCategories.includes(vendor.category)
        );
      }
      
      // Get prioritized vendor types based on event type
      let priorityVendorTypes: string[] = [];
      
      // Customize priorities based on event type
      switch (selectedEvent) {
        case 'wedding':
          priorityVendorTypes = ['Venue', 'Caterer', 'Photographer', 'Decorator'];
          break;
        case 'birthday':
          priorityVendorTypes = ['Caterer', 'Decorator', 'Photographer'];
          break;
        case 'corporate':
          priorityVendorTypes = ['Venue', 'Caterer', 'Sound & Lighting'];
          break;
        case 'collegeFest':
          priorityVendorTypes = ['Sound & Lighting', 'Caterer', 'Entertainment'];
          break;
        case 'schoolEvent':
          priorityVendorTypes = ['Decorator', 'Caterer', 'Photographer'];
          break;
        default:
          priorityVendorTypes = ['Venue', 'Caterer', 'Photographer', 'Decorator'];
      }
      
      // Sort vendors based on priority for this event type
      availableVendors.sort((a, b) => {
        const aIndex = priorityVendorTypes.indexOf(a.category);
        const bIndex = priorityVendorTypes.indexOf(b.category);
        
        // If both have priority, sort by priority
        if (aIndex >= 0 && bIndex >= 0) {
          return aIndex - bIndex;
        }
        // If only one has priority, it comes first
        else if (aIndex >= 0) return -1;
        else if (bIndex >= 0) return 1;
        // If neither has priority, sort by rating
        return b.rating - a.rating;
      });
      
      // Use all available vendors instead of limiting to 10
      const suggestedVendors = availableVendors;
      
      // Update the state variable
      setSuggestedVendors(suggestedVendors);
      
      console.log(`Displaying ${suggestedVendors.length} vendors to user`);
      
      // Prepare the message based on event type
      let message = '';
      switch(selectedEvent) {
        case 'wedding':
          message = "Based on your wedding plans, these vendors would be perfect. I've prioritized venue, catering, and decoration services that match your budget.";
          break;
        case 'birthday':
          message = "For your birthday celebration, I recommend these vendors. I've highlighted catering and decoration services within your budget range.";
          break;
        case 'corporate':
          message = "For your corporate event, these professional vendors would be ideal. I've prioritized venues and services that will make your business event successful.";
          break;
        case 'collegeFest':
          message = "These vendors would be perfect for your college fest! I've focused on sound systems, catering, and entertainment options that students will love.";
          break;
        case 'schoolEvent':
          message = "For your school event, these vendors would work well. I've selected professional services that are appropriate for educational settings.";
          break;
        default:
          message = "Based on your requirements, here are some vendor suggestions that fit your budget and location preferences.";
      }
      
      // Add the suggestions message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
          sender: 'bot', 
        content: message,
        isVendorSuggestions: true,
        vendors: suggestedVendors
      };
      
      setMessages(prev => [...prev, newMessage]);
      setShowingBudgetAllocation(false);
    } catch (error) {
      console.error('Error showing vendor suggestions:', error);
      
      // Fallback to sample data in case of error - use all vendors, but filter by selected categories
      const selectedVendorCategories = messages
        .filter(msg => msg.isVendorList && Array.isArray(msg.content))
        .flatMap(msg => Array.isArray(msg.content) 
          ? msg.content.filter(item => item.selected).map(item => item.name) 
          : []
        );
      
      const filteredVendors = selectedVendorCategories.length > 0 
        ? sampleVendors.filter(vendor => selectedVendorCategories.includes(vendor.category))
        : sampleVendors;
        
      // Update the state with the fallback vendors
      setSuggestedVendors(filteredVendors);
        
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
            sender: 'bot', 
        content: "I found these vendors that might work for your event:",
        isVendorSuggestions: true,
        vendors: filteredVendors
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setShowingBudgetAllocation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookVendor = (vendor: Vendor) => {
    setSelectedVendors(prev => {
      const isAlreadySelected = prev.some(v => v.id === vendor.id);
      if (isAlreadySelected) {
        return prev.filter(v => v.id !== vendor.id);
      } else {
        return [...prev, vendor];
      }
    });
  };

  const handleCloseBookingForm = (success: boolean) => {
    if (success && bookingVendor) {
      // If not already in selected vendors, add it
      if (!selectedVendors.some(v => v.id === bookingVendor.id)) {
        setSelectedVendors([...selectedVendors, bookingVendor]);
      }
      
      setBookingVendor(null);
    } else {
      setBookingVendor(null);
    }
  };

  const handleSubmitAllInterests = () => {
    setShowingUserDetailsForm(true);
  };

  const handleUserDetailsSubmit = async (name: string, phone: string, specialRequests: string) => {
    setShowingUserDetailsForm(false);
    
    // Show loading state
    const loadingMessage: ChatMessage = {
      id: Date.now().toString(),
          sender: 'bot', 
      content: "Submitting your request...",
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      // Save data to Supabase
      const result = await saveCompleteEventRequest(
        selectedEvent || 'custom',
        location,
        budget,
        name,
        phone,
        specialRequests,
        selectedVendors
      );
      
      if (result.success) {
        // Store the request ID
        setLastRequestId(result.request_id);
        
        // Show success message
        setSubmittedInterest(true);
        setShowSuccessPopup(true);
        
        // Update the loading message with success and request ID
        const botResponse: ChatMessage = {
          id: Date.now().toString(),
          sender: 'bot',
          content: `✅ Thank you! Your event request #${result.request_id} has been submitted. Our UtsavAI team will connect with you within 24 hours.`,
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMessage.id ? botResponse : msg
        ));
      } else {
        // Show error message
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'bot',
          content: "❌ There was an error saving your request. Please try again or contact support.",
        };
        
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMessage.id ? errorMessage : msg
        ));
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'bot',
        content: "❌ There was an error saving your request. Please try again or contact support.",
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? errorMessage : msg
      ));
    }
  };

  const renderVendorSuggestions = (vendors: Vendor[]) => {
    // Group vendors by category
    const categorizedVendors = vendors.reduce((acc, vendor) => {
      if (!acc[vendor.category]) {
        acc[vendor.category] = [];
      }
      acc[vendor.category].push(vendor);
      return acc;
    }, {} as Record<string, Vendor[]>);

    // Count vendors by category and prepare text summary
    const totalVendorsCount = vendors.length;
    const categoryCountText = Object.entries(categorizedVendors)
      .map(([category, vendorsList]) => `${category}: ${vendorsList.length}`)
      .join(', ');

  return (
            <div>
        <div className="font-medium mb-6 text-lg">
          Vendor recommendations for your event
            </div>
        
        <div className="text-sm text-gray-500 mb-4">
          Found {totalVendorsCount} vendors across {Object.keys(categorizedVendors).length} categories ({categoryCountText})
          </div>
          
        {Object.entries(categorizedVendors).map(([category, categoryVendors]) => (
          <div key={category} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-3 p-3 bg-violet-50/50 rounded-lg border border-violet-100/50">
              {getVendorIcon(category)}
              <h3 className="text-lg font-semibold">{category}s ({categoryVendors.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {categoryVendors.map((vendor) => {
                const isSelected = selectedVendors.some(v => v.id === vendor.id);
                
                return (
                  <Card key={vendor.id} className="overflow-hidden">
                    <div className="w-full h-40 relative">
                      <img 
                        src={vendor.image} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <div className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="font-bold">{vendor.rating}</span>
                          <span className="text-gray-500 text-sm ml-1">({vendor.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {vendor.city}
                      </div>
                      <div className="mt-2 font-medium">
                        ₹{vendor.price.toLocaleString()} - ₹{(vendor.price * 1.5).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleBookVendor(vendor)}
                          className={`transition-all ${
                            isSelected
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-violet-500 hover:bg-violet-600'
                          } text-sm py-1 px-4 rounded-md`}
                          size="sm"
                        >
                          {isSelected ? 'Selected ✓' : 'Interested'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm py-1 px-4 rounded-md border-gray-300"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          View Details
                        </Button>
                    </div>
                  </div>
                  </Card>
                );
              })}
                </div>
          </div>
        ))}
        
        {/* Add Free Event Planning Offer */}
        <div className="mt-8 mb-4 p-6 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-white">
          <h3 className="text-xl font-semibold mb-4 text-violet-800">🎁 Free Expert Event Planning</h3>
          <p className="mb-4 text-gray-700">
            Want expert help planning your perfect event? Our team with 7+ years of experience provides insider knowledge and ideas to plan your event.
          </p>
          <Button
            className="bg-accent hover:bg-accent/90 text-white"
            onClick={() => {
              // Show consultation form directly without adding message to chat
              setShowingFreeOfferForm(true);
            }}
          >
            Get Free Expert Advice
          </Button>
        </div>
        
        {selectedVendor && (
          <VendorDetailsDialog
            isOpen={!!selectedVendor}
            onClose={() => setSelectedVendor(null)}
            vendor={selectedVendor}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Main chat container */}
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar section - hidden on mobile by default, toggleable */}
        <div className={`${showEventTypes ? 'block' : 'hidden'} md:block md:w-1/4 lg:w-1/5 bg-slate-50 border-r overflow-y-auto p-4`}>
          <h2 className="text-lg font-semibold mb-4">Event Types</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {eventTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedEventType === type.id ? "default" : "outline"}
                className="justify-start text-left h-auto py-3"
                onClick={() => handleEventSelect(type.id)}
              >
                <span className="mr-2 text-xl">{type.emoji}</span>
                <span>{type.name}</span>
              </Button>
            ))}
          </div>

          {selectedVendors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">Selected Vendors</h3>
              
              <div className="space-y-2">
                {selectedVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center bg-white rounded-md p-2 border text-sm">
                    {getVendorIcon(vendor.category)}
                    <span className="ml-2 truncate">{vendor.name}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleSubmitAllInterests}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Interest'}
              </Button>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header - now responsive */}
          <div className="bg-white border-b p-3 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                className="md:hidden mr-2" 
                onClick={() => setShowEventTypes(!showEventTypes)}
              >
                <Filter size={20} />
              </Button>
              <h1 className="text-xl font-semibold">UtsavAI Chat</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="text-xs sm:text-sm px-2 py-1 h-auto"
                onClick={() => setShowConsultationForm(true)}
              >
                <Gift className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Get Free Consultation</span>
                <span className="sm:hidden">Free Consult</span>
              </Button>

              {eventProgress > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={resetChat}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">New Chat</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Chat messages area */}
          <ScrollArea 
            className="flex-1 p-4 overflow-y-auto" 
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div key={message.id || index} className="flex flex-col">
                  <Message 
                    sender={message.sender} 
                    content={message.content} 
                    isVendorList={message.isVendorList}
                    isVendorSuggestions={message.isVendorSuggestions}
                    vendors={message.vendors || []}
                    onBookVendor={handleBookVendor}
                    onConfirm={handleVendorChecklistConfirm}
                    selectedVendors={selectedVendors}
                  />
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                  <Bot size={20} />
                  <div>UtsavAI is thinking...</div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* Input area - now responsive */}
          <div className="border-t p-3 bg-white">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping}>
                  <SendHorizontal size={18} />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              
              {showScrollToBottom && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-20 right-8 rounded-full opacity-70 hover:opacity-100 md:bottom-24"
                  onClick={scrollToBottom}
                >
                  <ArrowDown size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs remain unchanged */}
      {/* ... existing dialogs ... */}
    </div>
  );
};

export default ChatPage;
