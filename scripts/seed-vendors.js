// This script is used to seed the vendors table with sample data
// Run with: node scripts/seed-vendors.js

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kjahicdvhulwvutldaan.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('Error: No Supabase key found. Please set VITE_SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample vendors data matching the structure in the MarketplacePage component
const sampleVendors = [
  {
    name: "Elegant Decorations",
    category: "Decorator",
    city: "Mumbai",
    price: 25000,
    rating: 4.8,
    description: "We specialize in creating elegant and memorable decorations for all types of events.",
    contact_email: "contact@elegantdecorations.com",
    contact_phone: "+91 9876543210",
    image_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    status: "active",
    portfolio_images: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3", "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec"],
    portfolio_description: "We have decorated over 200 events in the past 5 years.",
    portfolio_events: ["Weddings", "Corporate Events", "Birthday Parties"]
  },
  {
    name: "Capture Moments",
    category: "Photographer",
    city: "Delhi",
    price: 40000,
    rating: 4.9,
    description: "Professional photography services to capture your special moments.",
    contact_email: "info@capturemoments.com",
    contact_phone: "+91 9876543211",
    image_url: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?q=80&w=2070",
    status: "active",
    portfolio_images: ["https://images.unsplash.com/photo-1567156345300-e9a8844b19cc"],
    portfolio_description: "Award-winning photography services for all occasions.",
    portfolio_events: ["Weddings", "Fashion", "Product Launches"]
  },
  {
    name: "Tasty Feasts",
    category: "Caterer",
    city: "Bangalore",
    price: 30000,
    rating: 4.7,
    description: "Delicious food options for all types of events and tastes.",
    contact_email: "orders@tastyfeasts.com",
    contact_phone: "+91 9876543212",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We cater to all dietary needs with a wide range of cuisines.",
    portfolio_events: ["Weddings", "Corporate Lunches", "Birthday Parties"]
  },
  {
    name: "Luxury Decorations",
    category: "Decorator",
    city: "Delhi",
    price: 60000,
    rating: 4.9,
    description: "Premium decoration services for luxury events.",
    contact_email: "bookings@luxurydecorations.com",
    contact_phone: "+91 9876543213",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We transform venues into luxurious spaces for memorable events.",
    portfolio_events: ["Celebrity Weddings", "High-end Corporate Events", "Fashion Shows"]
  },
  {
    name: "Budget Decorations",
    category: "Decorator",
    city: "Mumbai",
    price: 12000,
    rating: 4.5,
    description: "Quality decoration services at affordable prices.",
    contact_email: "info@budgetdecorations.com",
    contact_phone: "+91 9876543214",
    image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We believe everyone deserves beautiful decorations for their events.",
    portfolio_events: ["Small Gatherings", "Birthday Parties", "Office Events"]
  },
  {
    name: "PixelPerfect",
    category: "Photographer",
    city: "Bangalore",
    price: 25000,
    rating: 4.7,
    description: "Capturing your memories with pixel-perfect precision.",
    contact_email: "shoot@pixelperfect.com",
    contact_phone: "+91 9876543215",
    image_url: "https://images.unsplash.com/photo-1567156345300-e9a8844b19cc?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "Our photographers have 10+ years of experience in event photography.",
    portfolio_events: ["Weddings", "Corporate Events", "Fashion Shows"]
  },
  {
    name: "Gourmet Delights",
    category: "Caterer",
    city: "Delhi",
    price: 50000,
    rating: 4.8,
    description: "Premium catering services with gourmet food options.",
    contact_email: "events@gourmetdelights.com",
    contact_phone: "+91 9876543216",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We specialize in multi-cuisine gourmet food for high-end events.",
    portfolio_events: ["Celebrity Weddings", "Corporate Galas", "Diplomatic Events"]
  },
  {
    name: "Budget Eats",
    category: "Caterer",
    city: "Mumbai",
    price: 15000,
    rating: 4.3,
    description: "Quality catering services at budget-friendly prices.",
    contact_email: "orders@budgeteats.com",
    contact_phone: "+91 9876543217",
    image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We make delicious food accessible for all types of events.",
    portfolio_events: ["Small Gatherings", "Office Parties", "Birthday Celebrations"]
  },
  {
    name: "Grand Venue",
    category: "Venue",
    city: "Delhi",
    price: 100000,
    rating: 4.9,
    description: "Luxurious venue for your special occasions.",
    contact_email: "bookings@grandvenue.com",
    contact_phone: "+91 9876543218",
    image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    status: "active",
    portfolio_images: [],
    portfolio_description: "Our venue can accommodate up to 1000 guests with premium amenities.",
    portfolio_events: ["Weddings", "Corporate Events", "Exhibitions"]
  },
  {
    name: "Soundscape",
    category: "Sound & Lighting",
    city: "Mumbai",
    price: 35000,
    rating: 4.6,
    description: "Professional sound and lighting services for all events.",
    contact_email: "tech@soundscape.com",
    contact_phone: "+91 9876543219",
    image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "We use state-of-the-art equipment for the perfect audiovisual experience.",
    portfolio_events: ["Concerts", "Corporate Events", "Weddings"]
  },
  {
    name: "Makeup Maven",
    category: "Makeup Artist",
    city: "Bangalore",
    price: 20000,
    rating: 4.8,
    description: "Professional makeup services for all occasions.",
    contact_email: "bookings@makeupmaven.com",
    contact_phone: "+91 9876543220",
    image_url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b5?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "Our team has worked with celebrities and top models.",
    portfolio_events: ["Weddings", "Fashion Shows", "Photo Shoots"]
  },
  {
    name: "Event Anchors",
    category: "Anchor",
    city: "Delhi",
    price: 15000,
    rating: 4.7,
    description: "Professional event hosting and anchoring services.",
    contact_email: "bookings@eventanchors.com",
    contact_phone: "+91 9876543221",
    image_url: "https://images.unsplash.com/photo-1475721027785-f74ec9c409d6?q=80&w=2070",
    status: "active",
    portfolio_images: [],
    portfolio_description: "Our anchors are fluent in multiple languages and have years of experience.",
    portfolio_events: ["Corporate Events", "Weddings", "Award Ceremonies"]
  }
];

async function seedVendors() {
  console.log('Starting to seed vendors table...');
  
  try {
    // First, let's check if we have vendors already
    const { data: existingVendors, error: checkError } = await supabase
      .from('vendors')
      .select('count', { count: 'exact', head: true });
    
    if (checkError) {
      throw new Error(`Error checking existing vendors: ${checkError.message}`);
    }
    
    const count = existingVendors?.count || 0;
    console.log(`Found ${count} existing vendors`);
    
    if (count > 0) {
      const confirmDelete = process.argv.includes('--force');
      if (!confirmDelete) {
        console.log('Vendors table already has data. Use --force to replace it.');
        console.log('Exiting without making changes.');
        process.exit(0);
      }
      
      console.log('--force flag detected, proceeding to delete existing vendors...');
      const { error: deleteError } = await supabase
        .from('vendors')
        .delete()
        .gte('id', 0);
      
      if (deleteError) {
        throw new Error(`Error deleting existing vendors: ${deleteError.message}`);
      }
      
      console.log('Existing vendors deleted successfully.');
    }
    
    // Insert sample vendors
    const { data, error } = await supabase
      .from('vendors')
      .insert(sampleVendors)
      .select();
    
    if (error) {
      throw new Error(`Error inserting vendors: ${error.message}`);
    }
    
    console.log(`Successfully inserted ${data.length} vendors.`);
    console.log('Vendor seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding vendors:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedVendors(); 