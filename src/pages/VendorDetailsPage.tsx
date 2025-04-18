import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Star, Calendar, ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { getVendorById, Vendor } from '@/lib/vendor-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

// Import the sample vendors data as fallback
import { sampleVendors } from './MarketplacePage';

const VendorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadVendorDetails = async () => {
      try {
        setLoading(true);
        const vendorData = await getVendorById(Number(id));
        
        if (vendorData) {
          setVendor(vendorData);
          setError(null);
        } else {
          // Try to find in sample data as fallback
          const sampleVendor = sampleVendors.find(v => v.id === Number(id));
          if (sampleVendor) {
            // Convert sample vendor to match Vendor type
            setVendor({
              id: sampleVendor.id,
              name: sampleVendor.name,
              category: sampleVendor.category,
              city: sampleVendor.city,
              price: sampleVendor.price,
              rating: sampleVendor.rating,
              description: "Sample vendor description",
              contact_email: "contact@example.com",
              contact_phone: "+91 98765 43210",
              image_url: sampleVendor.image,
              created_at: new Date().toISOString(),
              status: "active",
              portfolio_images: [
                "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
                "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
                "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3"
              ],
              portfolio_description: "Sample portfolio showcasing our best work",
              portfolio_events: ["Wedding at Grand Hotel", "Corporate Event at Tech Park", "Birthday Celebration"]
            });
            setError("Using sample data as fallback");
          } else {
            setError("Vendor not found");
          }
        }
      } catch (err) {
        console.error('Error loading vendor details:', err);
        setError("Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    loadVendorDetails();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First create an event request record for admin tracking
      const eventRequestData = {
        event_type: 'vendor_booking',
        location: bookingForm.message.includes('location') ? bookingForm.message : 'Not specified',
        budget: vendor?.price || 0,
        customer_name: bookingForm.name,
        customer_phone: bookingForm.phone,
        customer_email: bookingForm.email,
        special_requests: bookingForm.message,
        status: 'pending',
        vendor_count: 1,
        request_type: 'booking',
        event_date: bookingForm.date
      };
      
      console.log('Creating event request with data:', eventRequestData);
      
      // Insert the event request to track in admin panel
      const { data: requestData, error: requestError } = await supabase
        .from('event_requests')
        .insert(eventRequestData)
        .select('id')
        .single();
      
      if (requestError) {
        console.error('Error creating event request:', requestError);
        throw new Error(`Failed to create booking request: ${requestError.message}`);
      }
      
      const eventRequestId = requestData?.id;
      
      if (!eventRequestId) {
        throw new Error('No event request ID returned from database');
      }
      
      // Now create the vendor interest record to link the vendor to this request
      const vendorInterestData = {
        event_request_id: eventRequestId,
        vendor_id: vendor?.id || 0,
        vendor_name: vendor?.name || '',
        vendor_category: vendor?.category || '',
        status: 'pending'
      };
      
      console.log('Creating vendor interest with data:', vendorInterestData);
      
      // Insert the vendor interest record
      const { error: interestError } = await supabase
        .from('vendor_interests')
        .insert(vendorInterestData);
      
      if (interestError) {
        console.error('Error creating vendor interest:', interestError);
        // Continue anyway since the main event request was created
      }

      // Show success message
      toast({
        title: "Booking Request Submitted!",
        description: `Your booking request with ${vendor?.name} has been sent. Request ID: #${eventRequestId}`,
      });

      // Close dialog and reset form
      setIsBookingDialogOpen(false);

      // Navigate to confirmation page with booking details
      navigate('/booking-confirmation', {
        state: {
          bookingDetails: {
            requestId: eventRequestId,
            vendorName: vendor?.name,
            vendorCategory: vendor?.category,
            date: bookingForm.date,
            customerName: bookingForm.name,
            customerEmail: bookingForm.email,
            customerPhone: bookingForm.phone
          }
        }
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "There was an error processing your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample additional vendor details
  const vendorDetails = {
    services: [
      "Full venue decoration",
      "Theme-based setups",
      "Flower arrangements",
      "Lighting design",
      "Stage decoration",
      "Entry gate decoration"
    ],
    availability: {
      nextAvailable: "2024-04-15",
      typicalBookingNotice: "2-3 weeks",
      peakSeasons: ["October-December", "February-March"],
    },
    portfolio: [
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
      "https://images.unsplash.com/photo-1519741497674-611481863552",
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330",
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-xl font-medium text-gray-600">Loading vendor details...</h1>
        </div>
      </div>
    );
  }

  if (error === "Vendor not found" || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor not found</h1>
          <Button asChild>
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50/50">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={vendor.image_url || "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6"}
          alt={vendor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-4 left-4">
          <Button variant="outline" size="sm" asChild className="bg-white/90 backdrop-blur-sm">
            <Link to="/marketplace" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
        {error && (
          <div className="absolute top-4 right-4 bg-yellow-400/90 text-yellow-900 px-3 py-1 rounded-md text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full text-sm border border-yellow-100">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-bold">{vendor.rating}</span>
                  <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 20} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{vendorDetails.availability.typicalBookingNotice} booking notice</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About {vendor.name}</h2>
              <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
              <div className="grid grid-cols-2 gap-4">
                {vendorDetails.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-gray-600">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vendor.portfolio_images && vendor.portfolio_images.length > 0 ? (
                  vendor.portfolio_images.map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No portfolio images available
                  </div>
                )}
              </div>
              {vendor.portfolio_description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Portfolio Description</h3>
                  <p className="text-gray-600">{vendor.portfolio_description}</p>
                </div>
              )}
              {vendor.portfolio_events && vendor.portfolio_events.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Past Events</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {vendor.portfolio_events.map((event, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-gray-600">
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Pricing</h3>
              <p className="text-3xl font-bold text-primary mb-4">₹{vendor.price.toLocaleString('en-IN')}</p>
              <Button 
                className="w-full mb-4"
                onClick={() => setIsBookingDialogOpen(true)}
              >
                Request Booking
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </Card>

            {/* Availability Card */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Availability</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Next Available Date</p>
                  <p className="text-gray-900">{vendorDetails.availability.nextAvailable}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Peak Seasons</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {vendorDetails.availability.peakSeasons.map((season, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {season}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Booking with {vendor.name}</DialogTitle>
            <DialogDescription>
              Fill out the form below to request this vendor for your event. Your request will be sent to our team for processing, and we'll contact you to confirm the details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  value={bookingForm.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Your contact number"
                  required
                  value={bookingForm.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                required
                value={bookingForm.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                value={bookingForm.date}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Additional Details</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us more about your event requirements, location, number of guests, etc."
                rows={4}
                value={bookingForm.message}
                onChange={handleInputChange}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDetailsPage; 