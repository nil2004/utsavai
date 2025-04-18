import { supabase } from './supabase';
import { VENDOR_STATUSES, VENDOR_CATEGORIES } from './vendor-service';

/**
 * Seed the database with sample vendors and event requests
 * This function can be called to initialize test data
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log("Starting database seeding...");
    
    // Check if vendors already exist
    const { count: vendorCount, error: vendorError } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });
      
    if (vendorError) {
      console.error('Error checking vendors:', vendorError);
      return;
    }
    
    // Only seed if no vendors exist
    if (vendorCount === 0) {
      console.log("No vendors found, seeding sample vendors...");
      
      // Sample cities
      const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur"];
      
      // Generate 20 sample vendors
      const sampleVendors = [];
      
      for (let i = 1; i <= 30; i++) {
        const categoryIndex = Math.floor(Math.random() * VENDOR_CATEGORIES.length);
        const cityIndex = Math.floor(Math.random() * cities.length);
        const rating = parseFloat((3 + Math.random() * 2).toFixed(1)); // Rating between 3 and 5
        const price = Math.floor(15000 + Math.random() * 85000); // Price between 15k and 100k
        
        // Determine status with 70% active, 20% pending, 10% inactive
        let status;
        const statusRand = Math.random();
        if (statusRand < 0.7) status = VENDOR_STATUSES.ACTIVE;
        else if (statusRand < 0.9) status = VENDOR_STATUSES.PENDING;
        else status = VENDOR_STATUSES.INACTIVE;
        
        const vendor = {
          name: getVendorName(VENDOR_CATEGORIES[categoryIndex], i),
          category: VENDOR_CATEGORIES[categoryIndex],
          city: cities[cityIndex],
          price: price,
          rating: rating,
          description: getVendorDescription(VENDOR_CATEGORIES[categoryIndex]),
          contact_email: `vendor${i}@example.com`,
          contact_phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          image_url: getRandomImageUrl(VENDOR_CATEGORIES[categoryIndex]),
          status: status
        };
        
        sampleVendors.push(vendor);
      }
      
      // Insert vendors in batch
      const { error: insertError } = await supabase
        .from('vendors')
        .insert(sampleVendors);
        
      if (insertError) {
        console.error('Error inserting sample vendors:', insertError);
        return;
      }
      
      console.log(`Successfully added ${sampleVendors.length} sample vendors`);
    } else {
      console.log(`Found ${vendorCount} existing vendors, skipping vendor seeding`);
    }
    
    // Check if event requests already exist
    const { count: eventCount, error: eventError } = await supabase
      .from('event_requests')
      .select('*', { count: 'exact', head: true });
      
    if (eventError) {
      console.error('Error checking event requests:', eventError);
      return;
    }
    
    // Only seed if no event requests exist
    if (eventCount === 0) {
      console.log("No event requests found, seeding sample event requests...");
      
      // Event types 
      const eventTypes = ["wedding", "birthday", "corporate", "collegeFest", "schoolEvent", "custom"];
      // Cities (reuse from above)
      const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur"];
      // Statuses
      const statuses = ["pending", "in_progress", "completed", "cancelled"];
      
      // Generate 15 sample event requests
      const sampleEvents = [];
      const now = new Date();
      
      for (let i = 1; i <= 15; i++) {
        const eventTypeIndex = Math.floor(Math.random() * eventTypes.length);
        const cityIndex = Math.floor(Math.random() * cities.length);
        const statusIndex = Math.floor(Math.random() * statuses.length);
        const budget = Math.floor(100000 + Math.random() * 900000); // Budget between 100k and 1M
        
        // Create date for the last 30 days
        const createdAt = new Date(now);
        createdAt.setDate(now.getDate() - Math.floor(Math.random() * 30));
        
        const event = {
          event_type: eventTypes[eventTypeIndex],
          location: cities[cityIndex],
          budget: budget,
          status: statuses[statusIndex],
          special_requests: getRandomSpecialRequest(eventTypes[eventTypeIndex]),
          created_at: createdAt.toISOString()
        };
        
        sampleEvents.push(event);
      }
      
      // Insert events in batch
      const { error: insertEventError } = await supabase
        .from('event_requests')
        .insert(sampleEvents);
        
      if (insertEventError) {
        console.error('Error inserting sample events:', insertEventError);
        return;
      }
      
      console.log(`Successfully added ${sampleEvents.length} sample event requests`);
    } else {
      console.log(`Found ${eventCount} existing event requests, skipping event seeding`);
    }
    
    console.log("Database seeding completed!");
  } catch (error) {
    console.error('Unexpected error during database seeding:', error);
  }
};

// Helper functions for generating realistic sample data
function getVendorName(category: string, index: number): string {
  const prefixes = {
    'Caterer': ['Royal', 'Delicious', 'Spice', 'Gourmet', 'Elite', 'Tasty', 'Premium'],
    'Decorator': ['Elegant', 'Luxe', 'Dream', 'Perfect', 'Creative', 'Golden', 'Royal'],
    'Photographer': ['Click', 'Moments', 'Capture', 'Frame', 'Lens', 'Vision', 'Shutterbox'],
    'Venue': ['Grand', 'Royal', 'Majestic', 'Paradise', 'Luxury', 'Elite', 'Imperial'],
    'Entertainment': ['Star', 'Prime', 'Elite', 'Royal', 'Supreme', 'Dynamic', 'Vibrant'],
    'Sound & Lighting': ['Acoustic', 'Bright', 'Sound', 'Clear', 'Vibrant', 'Premium', 'Peak'],
    'Makeup Artist': ['Glam', 'Beauty', 'Stunning', 'Gorgeous', 'Flawless', 'Perfect', 'Elite'],
    'Wedding Planner': ['Dream', 'Perfect', 'Royal', 'Elegant', 'Supreme', 'Ultimate', 'Elite'],
  };
  
  const suffixes = {
    'Caterer': ['Caterers', 'Foods', 'Kitchen', 'Delights', 'Cuisines', 'Eats', 'Feast'],
    'Decorator': ['Decors', 'Designs', 'Decorators', 'Interiors', 'Spaces', 'Elegance', 'Arts'],
    'Photographer': ['Studios', 'Productions', 'Photography', 'Pictures', 'Memories', 'Films', 'Shots'],
    'Venue': ['Palace', 'Gardens', 'Banquets', 'Halls', 'Resort', 'Manor', 'Plaza'],
    'Entertainment': ['Entertainment', 'Performers', 'Artists', 'Shows', 'Productions', 'Events', 'Stars'],
    'Sound & Lighting': ['Systems', 'Productions', 'Audio', 'Solutions', 'Tech', 'Equipment', 'Services'],
    'Makeup Artist': ['Makeovers', 'Beauty', 'Studio', 'Looks', 'Faces', 'Makeup', 'Styles'],
    'Wedding Planner': ['Weddings', 'Events', 'Planners', 'Celebrations', 'Organizers', 'Occasions', 'Affairs'],
  };
  
  const defaultPrefixes = ['Premium', 'Deluxe', 'Super', 'Elite', 'First-Class', 'Top', 'Prime'];
  const defaultSuffixes = ['Services', 'Solutions', 'Experts', 'Professionals', 'Group', 'Team', 'Specialists'];
  
  const prefix = (prefixes[category] || defaultPrefixes)[Math.floor(Math.random() * (prefixes[category] || defaultPrefixes).length)];
  const suffix = (suffixes[category] || defaultSuffixes)[Math.floor(Math.random() * (suffixes[category] || defaultSuffixes).length)];
  
  return `${prefix} ${suffix}`;
}

function getVendorDescription(category: string): string {
  const descriptions = {
    'Caterer': 'We provide exceptional catering services for all types of events. Our menu includes a variety of cuisines tailored to your preferences. With years of experience, we ensure high-quality food and presentation.',
    'Decorator': 'Transform your venue into a magical space with our decoration services. We specialize in creating beautiful, memorable settings for all occasions, with attention to every detail.',
    'Photographer': 'Capture your special moments with our professional photography services. We specialize in candid shots and creative compositions to preserve your memories forever.',
    'Venue': 'A beautiful venue perfect for your special occasion. Our space offers a stunning ambiance, professional staff, and all the amenities you need for a memorable event.',
    'Entertainment': 'Add excitement to your event with our entertainment services. We provide various options from live music to interactive performances tailored to your event type.',
    'Sound & Lighting': 'Create the perfect atmosphere with our professional sound and lighting services. We ensure high-quality audio and stunning visual effects for your event.',
    'Makeup Artist': 'Look your best on your special day with our expert makeup services. We use high-quality products and techniques to enhance your natural beauty.',
    'Wedding Planner': 'Let us handle all the details of your wedding day. Our experienced team will coordinate everything from venue selection to vendor management, ensuring a stress-free experience.',
    'Transportation': 'Arrive in style with our luxury transportation services. We offer a fleet of well-maintained vehicles and professional drivers.',
    'Florist': 'Add beauty to your event with our floral arrangements. We create custom designs to match your theme and preferences.',
    'Anchor': 'Keep your event flowing smoothly with our professional emcee services. Our anchors are experienced in engaging audiences and maintaining event timelines.',
    'Cake Designer': 'Delight your guests with our custom cake designs. We create beautiful, delicious cakes tailored to your event theme and preferences.',
    'DJ': 'Keep the energy high with our professional DJ services. We curate playlists to match your preferences and keep guests entertained.',
    'Invitation Designer': 'Make a great first impression with our custom invitation designs. We create beautiful, personalized invitations that set the tone for your event.',
    'Jewelry': 'Complete your look with our exquisite jewelry collection. We offer a range of styles to complement any outfit and occasion.',
  };
  
  return descriptions[category] || 'We provide high-quality professional services for your event. Our experienced team ensures attention to detail and customer satisfaction.';
}

function getRandomImageUrl(category: string): string {
  // For a real app, you'd use actual images based on the vendor type
  // Here we're using placeholder images for demonstration
  const placeholderSizes = ['800x600', '600x400', '400x300', '500x500'];
  const size = placeholderSizes[Math.floor(Math.random() * placeholderSizes.length)];
  
  return `https://via.placeholder.com/${size}?text=${encodeURIComponent(category.replace(' & ', ' and '))}`;
}

function getRandomSpecialRequest(eventType: string): string {
  const specialRequests = {
    'wedding': [
      'We would like a traditional ceremony with modern reception',
      'Need accommodation for out-of-town guests',
      'Require vegetarian food options for some guests',
      'Would like to include cultural traditions in our ceremony',
      'Need child-friendly arrangements and menu options'
    ],
    'birthday': [
      'Looking for a surprise party setup',
      'Need a custom cake with specific design',
      'Want entertainment suitable for children',
      'Require themed decorations',
      'Need allergy-friendly food options'
    ],
    'corporate': [
      'Need presentation equipment and tech support',
      'Require breakout rooms for team activities',
      'Want a formal dinner arrangement after the conference',
      'Need transportation for attendees from hotel',
      'Want team-building activities incorporated'
    ],
    'collegeFest': [
      'Need multiple stages for different performances',
      'Require high-capacity sound systems',
      'Want food stalls with diverse options',
      'Need security arrangements for large crowd',
      'Require backstage areas for performers'
    ],
    'schoolEvent': [
      'Need child-safe decorations and setup',
      'Want age-appropriate entertainment',
      'Require parent seating areas',
      'Need photography that includes all students',
      'Want activities that involve student participation'
    ],
    'custom': [
      'Have specific theme requirements',
      'Need customization in food and decor',
      'Require special arrangements for elderly guests',
      'Want unique entertainment options',
      'Need accessibility arrangements for disabled attendees'
    ]
  };
  
  const requests = specialRequests[eventType] || specialRequests.custom;
  return requests[Math.floor(Math.random() * requests.length)];
} 