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
  Gift,
  Award
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
import { Vendor, getVendorById } from '@/lib/vendor-service';

// Define TypeScript interfaces
interface ChatVendor extends Vendor {
  reviewCount: number;
  priceRange: string;
  image: string;
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
  vendors?: ChatVendor[];
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
const sampleVendors: ChatVendor[] = [
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
    description: "Professional decoration services for all types of events",
    contact_email: "contact@elegantdeco.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Full venue decoration", "Theme-based setups", "Flower arrangements"],
    experience_years: 5,
    completed_events: 200,
    portfolio_images: [],
    portfolio_description: "",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Luxurious decoration services for special occasions",
    contact_email: "luxury@decorations.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Luxury decoration", "Custom theme setups", "Flower arrangements"],
    experience_years: 7,
    completed_events: 150,
    portfolio_images: [],
    portfolio_description: "Luxury decoration portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Affordable decoration services for budget-conscious clients",
    contact_email: "budget@decorations.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Basic decoration", "Themed setups", "Flower arrangements"],
    experience_years: 3,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Budget decoration portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional photography services for all types of events",
    contact_email: "photography@capturemoments.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event photography", "Portrait photography", "Commercial photography"],
    experience_years: 6,
    completed_events: 120,
    portfolio_images: [],
    portfolio_description: "Photography portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "High-quality photography services for all types of events",
    contact_email: "photography@pixelperfect.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1567156345300-e9a8844b19cc?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event photography", "Portrait photography", "Commercial photography"],
    experience_years: 5,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Photography portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Cinematic photography services for all types of events",
    contact_email: "cinematic@visions.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2688",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event photography", "Portrait photography", "Commercial photography"],
    experience_years: 7,
    completed_events: 90,
    portfolio_images: [],
    portfolio_description: "Cinematic photography portfolio",
    portfolio_events: [],
    instagram_reels: []
  },
  
  // Caterers
  {
    id: 3,
    name: "Tasty Feasts",
    category: "Caterer",
    rating: 4.7,
    reviewCount: 156,
    priceRange: "₹500 - ₹1,200",
    price: 30000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Bangalore",
    description: "Delicious catering services for all types of events",
    contact_email: "catering@tastyfeasts.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Buffet catering", "Plated meals", "Customized menus"],
    experience_years: 4,
    completed_events: 180,
    portfolio_images: [],
    portfolio_description: "Catering portfolio",
    portfolio_events: [],
    instagram_reels: []
  },
  {
    id: 7,
    name: "Gourmet Delights",
    category: "Caterer",
    rating: 4.8,
    reviewCount: 178,
    priceRange: "₹800 - ₹2,000",
    price: 50000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Delhi",
    description: "High-end catering services for special occasions",
    contact_email: "gourmet@delights.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Fine dining", "Customized menus", "Catering for large groups"],
    experience_years: 6,
    completed_events: 160,
    portfolio_images: [],
    portfolio_description: "Gourmet catering portfolio",
    portfolio_events: [],
    instagram_reels: []
  },
  {
    id: 8,
    name: "Budget Eats",
    category: "Caterer",
    rating: 4.3,
    reviewCount: 87,
    priceRange: "₹300 - ₹600",
    price: 15000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Mumbai",
    description: "Affordable catering services for budget-conscious clients",
    contact_email: "budget@eats.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Buffet catering", "Plated meals", "Customized menus"],
    experience_years: 3,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Budget catering portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Luxurious venue for all types of events",
    contact_email: "venue@grandplaza.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Full venue decoration", "Themed setups", "Catering services"],
    experience_years: 7,
    completed_events: 180,
    portfolio_images: [],
    portfolio_description: "Venue portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Beautiful banquet hall for all types of events",
    contact_email: "venue@sunsetbanquet.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Full venue decoration", "Themed setups", "Catering services"],
    experience_years: 6,
    completed_events: 150,
    portfolio_images: [],
    portfolio_description: "Venue portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Beautiful resort venue for all types of events",
    contact_email: "venue@gardenviewresort.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Full venue decoration", "Themed setups", "Catering services"],
    experience_years: 5,
    completed_events: 120,
    portfolio_images: [],
    portfolio_description: "Venue portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional sound and lighting services for all types of events",
    contact_email: "sound@dynamicsystems.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Sound system setup", "Lighting setup", "Customized music"],
    experience_years: 5,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Sound and lighting portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "High-end audio visual services for all types of events",
    contact_email: "audio@elitevisual.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Sound system setup", "Lighting setup", "Customized music"],
    experience_years: 7,
    completed_events: 120,
    portfolio_images: [],
    portfolio_description: "Audio visual portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Affordable sound and lighting services for budget-conscious clients",
    contact_email: "sound@budgetsolutions.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Sound system setup", "Lighting setup", "Customized music"],
    experience_years: 3,
    completed_events: 80,
    portfolio_images: [],
    portfolio_description: "Sound and lighting portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional entertainment services for all types of events",
    contact_email: "entertainment@rhythmband.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Live music", "DJ services", "Customized entertainment"],
    experience_years: 6,
    completed_events: 150,
    portfolio_images: [],
    portfolio_description: "Entertainment portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional comedy entertainment for all types of events",
    contact_email: "comedy@centralgroup.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2024",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Stand-up comedy", "Improv comedy", "Customized comedy"],
    experience_years: 5,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Comedy entertainment portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional magic entertainment for all types of events",
    contact_email: "magic@momentsshow.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Close-up magic", "Stage magic", "Customized magic"],
    experience_years: 4,
    completed_events: 90,
    portfolio_images: [],
    portfolio_description: "Magic entertainment portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional event hosting services for all types of events",
    contact_email: "anchor@eliteanchors.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1564510714747-69c3bc1fab41?q=80&w=1000",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event hosting", "Hosting for large groups", "Customized hosting"],
    experience_years: 7,
    completed_events: 150,
    portfolio_images: [],
    portfolio_description: "Anchor portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional event hosting services for all types of events",
    contact_email: "host@professionalhosts.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event hosting", "Hosting for large groups", "Customized hosting"],
    experience_years: 6,
    completed_events: 120,
    portfolio_images: [],
    portfolio_description: "Anchor portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional event hosting services for all types of events",
    contact_email: "event@masters.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=2070",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Event hosting", "Hosting for large groups", "Customized hosting"],
    experience_years: 5,
    completed_events: 100,
    portfolio_images: [],
    portfolio_description: "Anchor portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Professional makeup services for all occasions with expertise in bridal, party, and photoshoot makeup",
    contact_email: "glamour@touch.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Bridal Makeup", "Party Makeup", "HD Makeup", "Airbrush Makeup"],
    experience_years: 8,
    completed_events: 450,
    portfolio_images: [],
    portfolio_description: "Glamour Touch Portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Specialized in bridal makeup with expertise in both traditional and modern styles",
    contact_email: "bridal@beauty.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Bridal Makeup", "Engagement Makeup", "Reception Makeup", "Trial Makeup"],
    experience_years: 10,
    completed_events: 600,
    portfolio_images: [],
    portfolio_description: "Bridal Beauty Portfolio",
    portfolio_events: [],
    instagram_reels: []
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
    description: "Affordable and professional makeup services for all types of events",
    contact_email: "perfect@look.com",
    contact_phone: "+91 98765 43210",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
    created_at: new Date().toISOString(),
    status: "active",
    services: ["Party Makeup", "Event Makeup", "Natural Makeup", "Professional Makeup"],
    experience_years: 5,
    completed_events: 300,
    portfolio_images: [],
    portfolio_description: "Perfect Look Portfolio",
    portfolio_events: [],
    instagram_reels: []
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
  vendors?: ChatVendor[];
  onBookVendor?: (vendor: ChatVendor) => void;
  onConfirm?: () => void;
  selectedVendors?: ChatVendor[];
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
  const [localContent, setLocalContent] = useState<VendorChecklistItem[]>(
    Array.isArray(content) ? [...content] : []
  );
  const [selectedVendor, setSelectedVendor] = useState<ChatVendor | null>(null);
  const [completeVendorData, setCompleteVendorData] = useState<ChatVendor | null>(null);

  useEffect(() => {
    if (Array.isArray(content)) {
      setLocalContent([...content]);
    }
  }, [content]);

  useEffect(() => {
    const fetchCompleteVendorData = async () => {
      if (selectedVendor) {
        const vendorData = await getVendorById(selectedVendor.id);
        if (vendorData) {
          const chatVendor: ChatVendor = {
            ...vendorData,
            reviewCount: selectedVendor.reviewCount,
            priceRange: selectedVendor.priceRange,
            image: selectedVendor.image
          };
          setCompleteVendorData(chatVendor);
        }
      }
    };
    
    fetchCompleteVendorData();
  }, [selectedVendor]);

  const handleItemToggle = (id: string) => {
    setLocalContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  if (isVendorList) {
    return (
      <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
        <div className={`${
          sender === 'user' 
            ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md' 
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        } rounded-2xl p-5 max-w-[85%]`}>
          <div className="font-medium mb-3 text-lg">Please select the vendors you need:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {localContent.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                  item.selected ? 'bg-primary text-white' : 'bg-primary/5 hover:bg-primary/10'
                }`}
                onClick={() => handleItemToggle(item.id)}
                data-state={item.selected ? 'checked' : 'unchecked'}
              >
                <div className="flex items-center">
                  {getVendorIcon(item.name)}
                  <label 
                    htmlFor={`vendor-${item.id}`}
                    className="font-medium ml-2 cursor-pointer"
                  >
                    {item.name}
                  </label>
                </div>
                {item.selected && <span className="ml-2 text-lg">✓</span>}
              </div>
            ))}
          </div>
          <Button 
            className="mt-6 bg-accent hover:bg-accent/90 shadow-sm transition-all hover:shadow w-full" 
            onClick={() => onConfirm()}
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    );
  }
  
  if (isVendorSuggestions) {
    const categorizedVendors: Record<string, ChatVendor[]> = {};
    
    // Group vendors by category
    if (Array.isArray(vendors)) {
      vendors.forEach((vendor) => {
        if (!categorizedVendors[vendor.category]) {
          categorizedVendors[vendor.category] = [];
        }
        categorizedVendors[vendor.category].push(vendor);
      });
    }

    return (
      <div className="flex justify-start mb-6 animate-fadeIn">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-800 rounded-2xl p-5 max-w-[95%] w-full shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="whitespace-pre-wrap break-words">{typeof content === 'string' ? content : 'No description available'}</div>
              </div>
        {selectedVendor && completeVendorData && (
          <VendorDetailsDialog
            isOpen={!!selectedVendor}
            onClose={() => {
              setSelectedVendor(null);
              setCompleteVendorData(null);
            }}
            vendor={completeVendorData}
          />
        )}
      </div>
    );
  }

  // Regular text message
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className="flex items-start max-w-[85%] group">
        {sender === 'bot' && (
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-3 rounded-2xl mr-3 shadow-[0_8px_16px_rgba(139,92,246,0.3)] transform hover:scale-105 transition-all duration-300">
            <Bot className="h-6 w-6" />
                      </div>
        )}
        <div 
          className={`${
            sender === 'user' 
              ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-[0_8px_16px_rgba(139,92,246,0.2)] hover:shadow-[0_12px_20px_rgba(139,92,246,0.3)] transform hover:-translate-y-0.5' 
              : 'bg-white border border-gray-200/50 text-gray-800 shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_20px_rgba(0,0,0,0.08)] transform hover:-translate-y-0.5'
          } rounded-2xl px-6 py-4 text-base backdrop-blur-sm transition-all duration-300 ${
            sender === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
          }`}
        >
          {typeof content === 'string' ? content : 'Invalid message content'}
                          </div>
        {sender === 'user' && (
          <div className="bg-gradient-to-br from-accent to-accent/80 text-white p-3 rounded-2xl ml-3 shadow-[0_8px_16px_rgba(249,115,22,0.3)] transform hover:scale-105 transition-all duration-300">
            <User className="h-6 w-6" />
                          </div>
        )}
                        </div>
    </div>
  );
};

interface BookingFormProps {
  vendor: ChatVendor;
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
    if (e.key === 'Enter' && budget.trim()) {
      onConfirm();
    }
  };

  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-800 rounded-2xl p-5 max-w-[85%] shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="font-medium mb-3 text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">What's your approximate budget?</div>
        <div className="flex items-center mb-4 border rounded-lg p-2 bg-white/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60">
          <span className="text-lg font-semibold text-gray-500 px-2">₹</span>
          <Input
            type="number"
            placeholder="e.g. 100000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-transparent bg-transparent"
          />
        </div>
        <div className="mb-2 text-sm text-gray-500">Common budget ranges:</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => setBudget("50000")} className="text-sm py-1 h-7">₹50,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("100000")} className="text-sm py-1 h-7">₹1,00,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("200000")} className="text-sm py-1 h-7">₹2,00,000</Button>
          <Button variant="outline" size="sm" onClick={() => setBudget("500000")} className="text-sm py-1 h-7">₹5,00,000</Button>
        </div>
        <Button 
          onClick={onConfirm} 
          className="bg-accent hover:bg-accent/90 w-full shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_16px_rgba(249,115,22,0.4)]"
          disabled={!budget.trim()}
        >
          Confirm Budget
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
  const popularCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"];
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && location.trim()) {
      onConfirm();
    }
  };

  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-800 rounded-2xl p-5 max-w-[85%] shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="font-medium mb-3 text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Where will your event be held?</div>
        <div className="flex items-center mb-4 border rounded-lg p-2 bg-white/50 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60">
          <MapPin className="text-gray-500 h-5 w-5 mx-2" />
          <Input
            type="text"
            placeholder="Enter city name"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-transparent bg-transparent"
          />
            </div>
        <div className="mb-2 text-sm text-gray-500">Popular cities:</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {popularCities.map(city => (
            <Button 
              key={city} 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation(city)}
              className={`text-sm py-1 h-7 ${location === city ? "bg-primary/10 border-primary/30 text-primary" : ""}`}
            >
              {city}
            </Button>
          ))}
          </div>
        <Button 
          onClick={onConfirm} 
          className="bg-accent hover:bg-accent/90 w-full shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_16px_rgba(249,115,22,0.4)]"
          disabled={!location.trim()}
        >
          Confirm Location
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      content: "Hello! I'm your event buddy. I can help you plan your event and find the right vendors. What kind of event are you planning?",
    },
  ]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [vendorChecklist, setVendorChecklist] = useState<VendorChecklistItem[]>([]);
  const [showingVendorsList, setShowingVendorsList] = useState<boolean>(false);
  const [suggestedVendors, setSuggestedVendors] = useState<ChatVendor[]>([]);
  const [location, setLocation] = useState<string>('');
  const [showingLocationInput, setShowingLocationInput] = useState<boolean>(false);
  const [budget, setBudget] = useState<string>('');
  const [showingBudgetInput, setShowingBudgetInput] = useState<boolean>(false);
  const [bookingVendor, setBookingVendor] = useState<ChatVendor | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<ChatVendor[]>([]);
  const [submittedInterest, setSubmittedInterest] = useState<boolean>(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);
  const [selectedVendor, setSelectedVendor] = useState<ChatVendor | null>(null);
  const [showingUserDetailsForm, setShowingUserDetailsForm] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [showingBudgetAllocation, setShowingBudgetAllocation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRequestId, setLastRequestId] = useState<number | undefined>(undefined);
  const [showingFreeOfferForm, setShowingFreeOfferForm] = useState<boolean>(false);

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
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
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

  // Add helper functions and restore necessary state updates
  const generateId = () => Date.now().toString();

  const showVendorSuggestions = async () => {
    try {
      setLoading(true);
      // Get selected vendor types
      const selectedTypes = vendorChecklist.filter(item => item.selected).map(item => item.name);
      
      // Pass city as a filter
      const vendors = await getFrontendVendors({ city: location });
      // Filter vendors by selected types
      const filteredVendors = vendors.filter(vendor => selectedTypes.includes(vendor.category));
      // Convert Vendor to ChatVendor - keep all original vendor data
      const chatVendors: ChatVendor[] = filteredVendors.map(vendor => ({
        ...vendor,
        reviewCount: Math.floor(Math.random() * 100) + 20,
        priceRange: `₹${vendor.price.toLocaleString('en-IN')}`,
        image: vendor.image_url
      }));
      setSuggestedVendors(chatVendors);
      setMessages(prev => [...prev, {
        id: generateId(),
          sender: 'bot', 
        content: `Here are some vendors that match your requirements in ${selectedTypes.join(', ')}:`,
        isVendorSuggestions: true,
        vendors: chatVendors
      }]);
      setShowingBudgetAllocation(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Use sample data as fallback, but filter it by selected types
      const selectedTypes = vendorChecklist.filter(item => item.selected).map(item => item.name);
      const filteredSampleVendors = sampleVendors.filter(vendor => selectedTypes.includes(vendor.category));
      setSuggestedVendors(filteredSampleVendors);
      setMessages(prev => [...prev, {
        id: generateId(),
            sender: 'bot', 
        content: `Here are some sample vendors in ${selectedTypes.join(', ')} (using fallback data):`,
        isVendorSuggestions: true,
        vendors: filteredSampleVendors
      }]);
      setShowingBudgetAllocation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookVendor = (vendor: ChatVendor) => {
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

  const renderVendorSuggestions = (vendors: ChatVendor[]) => {
    // Group vendors by category
    const categorizedVendors = vendors.reduce((acc, vendor) => {
      if (!acc[vendor.category]) {
        acc[vendor.category] = [];
      }
      acc[vendor.category].push(vendor);
      return acc;
    }, {} as Record<string, ChatVendor[]>);

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
                  <Card key={vendor.id} className="vendor-card flex flex-col h-full">
                    <div className="image-container h-48 relative overflow-hidden">
                      <img 
                        src={vendor.image} 
                        alt={vendor.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                      />
                    </div>
                    <div className="card-content flex-1 p-4 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg truncate flex-1">{vendor.name}</h3>
                        <div className="flex items-center shrink-0">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="font-bold">{vendor.rating}</span>
                          <span className="text-gray-500 text-sm ml-1">({vendor.reviewCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-2">
                        <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                        <span className="truncate">{vendor.city}</span>
                      </div>
                      <div className="font-medium mt-2">
                        {vendor.priceRange.replace(/ per plate/gi, '')}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-violet-500" />
                          <span>{vendor.experience_years}y exp</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-violet-500" />
                          <span>{vendor.completed_events}+ events</span>
                        </div>
                      </div>
                      <div className="button-container mt-4 flex gap-2">
                        <Button
                          onClick={() => handleBookVendor(vendor)}
                          className={`transition-all ${
                            isSelected
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-violet-500 hover:bg-violet-600'
                          } text-sm py-1 px-4 rounded-md flex-1`}
                          size="sm"
                        >
                          {isSelected ? 'Selected ✓' : 'Interested'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm py-1 px-4 rounded-md border-gray-300"
                          onClick={async () => {
                            const fullVendor = await getVendorById(vendor.id);
                            if (fullVendor) setSelectedVendor({
                              ...fullVendor,
                              reviewCount: vendor.reviewCount ?? 0,
                              priceRange: vendor.priceRange ?? `₹${fullVendor.price?.toLocaleString('en-IN')}`,
                              image: fullVendor.image_url
                            });
                          }}
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-violet-50 via-white to-violet-50/50">
      <div className="flex-grow overflow-hidden relative">
        <ScrollArea 
          className="h-full px-4 md:px-8 py-6 pb-36" 
          onWheel={handleScroll}
          ref={scrollAreaRef}
        >
          <div className="flex flex-col min-h-full max-w-4xl mx-auto">
            <div className="flex-grow space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`animate-in slide-in-from-${message.sender === 'bot' ? 'left' : 'right'} duration-300 delay-${index % 3}00`}
                >
                <Message 
                    sender={message.sender}
                    content={message.content}
                    isVendorList={message.isVendorList}
                    isVendorSuggestions={message.isVendorSuggestions}
                    vendors={message.vendors || []}
                  onBookVendor={handleBookVendor}
                    onConfirm={
                      message.isVendorList ? handleVendorChecklistConfirm : undefined
                    }
                    selectedVendors={selectedVendors}
                  />
                  {message.isVendorSuggestions && message.vendors && message.vendors.length > 0 && 
                    <div className="mt-2 mb-8">
                      {renderVendorSuggestions(message.vendors)}
                    </div>
                  }
                </div>
              ))}
              
              {showingLocationInput && (
                <div className="animate-in slide-in-from-bottom duration-300">
                <LocationInput 
                  location={location}
                  setLocation={setLocation}
                  onConfirm={handleLocationConfirm}
                />
          </div>
              )}
              
              {showingBudgetInput && (
                <div className="animate-in slide-in-from-bottom duration-300">
                <BudgetInput 
                  budget={budget}
                  setBudget={setBudget}
                  onConfirm={handleBudgetConfirm}
                />
          </div>
              )}
              
              {showingBudgetAllocation && selectedEvent && (
                <div className="animate-in slide-in-from-bottom duration-300">
                  <BudgetAllocation 
                    eventType={selectedEvent}
                    budget={budget}
                  />
          </div>
              )}
              
              {showingUserDetailsForm && (
                <UserDetailsForm 
                  onSubmit={handleUserDetailsSubmit}
                  onCancel={() => setShowingUserDetailsForm(false)}
                  selectedVendorsCount={selectedVendors.length}
                />
              )}
              
              {showingFreeOfferForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                  <div className="w-full max-w-md">
                    <FreeOfferForm 
                      onClose={() => setShowingFreeOfferForm(false)}
                      eventType={selectedEvent || undefined}
                      budget={budget || undefined}
                      location={location || undefined}
                    />
          </div>
                </div>
              )}
              
              {!selectedEvent && (
                <div className="flex justify-start mb-4 animate-in slide-in-from-bottom duration-300">
                  <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-800 rounded-2xl p-6 max-w-[90%] shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] transition-all duration-500">
                    <div className="font-medium mb-4 text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Please select an event type:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eventTypes.map((eventType) => {
                        // Get recommended vendors for this event type
                        const recommendedVendors = defaultVendorChecklists[eventType.id]
                          ?.filter(item => item.selected)
                          .map(item => item.name)
                          .slice(0, 3) || [];
                        
                        return (
                          <button
                            key={eventType.id}
                            className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 hover:border-primary/60 transition-all hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:scale-105 transform cursor-pointer hover:shadow-[0_8px_16px_rgba(139,92,246,0.15)]"
                            onClick={() => handleEventSelect(eventType.id)}
                          >
                            <span className="text-4xl mb-3 group-hover:scale-110 transition-all duration-300 transform-gpu">{eventType.emoji}</span>
                            <span className="font-medium text-base text-gray-700 group-hover:text-primary transition-colors">{eventType.name}</span>
                            
                            {/* Show recommended vendors */}
                            <div className="mt-2 w-full">
                              <div className="text-xs text-gray-500 mb-1">Recommended vendors:</div>
                              <div className="flex flex-wrap gap-1">
                                {recommendedVendors.map((vendor, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-violet-50 text-violet-600 border border-violet-100"
                                  >
                                    {vendor}
                                  </span>
                                ))}
          </div>
        </div>
                          </button>
                        );
                      })}
            </div>
            </div>
          </div>
              )}
          </div>
            <div ref={messagesEndRef} className="h-px" />
          </div>
        </ScrollArea>

        {showScrollButton && (
              <Button 
            className="fixed bottom-28 right-8 rounded-full p-3 bg-primary/90 hover:bg-primary shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 hover:scale-110 z-10"
            onClick={scrollToBottom}
                size="icon"
              >
            <ArrowDown className="h-5 w-5 text-white" />
          </Button>
        )}
        
        <div className="sticky bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl px-4 md:px-8 pb-4">
            {!showingVendorsList && !showingLocationInput && !showingBudgetInput && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("What vendors do you recommend?")}
                  className="text-xs py-1 h-7 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 transform-gpu shadow-sm hover:shadow-md"
                >
                  Vendor recommendations
            </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("How much does it typically cost?")}
                  className="text-xs py-1 h-7 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 transform-gpu shadow-sm hover:shadow-md"
                >
                  Cost estimates
            </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("I need help with planning")}
                  className="text-xs py-1 h-7 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:scale-105 transform-gpu shadow-sm hover:shadow-md"
                >
                  Planning assistance
            </Button>
          </div>
            )}
            <div className="relative flex items-end w-full bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
              <textarea
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) handleSendMessage();
                  }
                }}
                className="w-full resize-none rounded-xl border-0 bg-transparent py-3 pl-4 pr-12 focus:ring-0 focus-visible:ring-0 md:py-3 md:pl-5 text-sm"
                style={{
                  minHeight: '20px',
                  maxHeight: '120px',
                  height: 'auto',
                  overflowY: 'hidden'
                }}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <div className="absolute bottom-1 right-1 flex items-center justify-center gap-2">
                {suggestedVendors.length > 0 && selectedVendors.length > 0 && !submittedInterest && (
              <Button 
                    onClick={handleSubmitAllInterests}
                    className="h-8 rounded-lg px-3 text-xs bg-accent hover:bg-accent/90 shadow-md transition-all"
              >
                    Submit Interest ({selectedVendors.length})
              </Button>
                )}
                <Button 
                  onClick={handleSendMessage} 
                  className={`h-8 w-8 rounded-lg p-0 transition-all duration-300 transform hover:scale-110 ${
                    input.trim() 
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_16px_rgba(139,92,246,0.4)]' 
                      : 'text-gray-400 bg-transparent hover:bg-transparent'
                  }`}
                  disabled={!input.trim()}
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
          </div>
            <div className="mt-1.5 text-center text-[10px] text-gray-500">
              Press Enter to send, Shift + Enter for new line
      </div>
          </div>
          <div className="h-8 bg-gradient-to-t from-white via-white to-transparent" />
        </div>
      </div>
      
      {bookingVendor && (
        <BookingForm vendor={bookingVendor} onClose={handleCloseBookingForm} />
      )}
      
      {showSuccessPopup && (
        <SuccessPopup 
          onClose={() => setShowSuccessPopup(false)} 
          requestId={lastRequestId} 
        />
      )}
    </div>
  );
};

export default ChatPage;
