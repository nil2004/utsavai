import React, { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Star, Calendar, ArrowLeft, Share2, Loader2, Plus, X, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { getVendorById, updateVendorServices, updateVendorExperience, Vendor } from '@/lib/vendor-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth-context';
import { useAdminAuth } from '@/lib/admin-auth-context';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// Import the sample vendors data as fallback
import { sampleVendors } from './MarketplacePage';

// Create a context for video control
const VideoContext = createContext<{
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
}>({
  playingId: null,
  setPlayingId: () => {},
});

// Custom Video Player Component
const VideoPlayer: React.FC<{
  src: string;
  poster: string;
  id: string;
}> = ({ src, poster, id }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    const handleOtherVideoPlay = (event: Event) => {
      const playingVideo = event.target as HTMLVideoElement;
      if (playingVideo !== currentVideo && !currentVideo.paused) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
      }
    };

    // Listen for play events on all videos
    document.addEventListener('play', handleOtherVideoPlay, true);

    return () => {
      document.removeEventListener('play', handleOtherVideoPlay, true);
    };
  }, []);

  // Force pause other videos when this one plays
  const handlePlay = () => {
    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    document.querySelectorAll('video').forEach(video => {
      if (video !== currentVideo && !video.paused) {
        try {
          video.pause();
          video.currentTime = 0;
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }
    });
  };

  // Reset video position when it ends
  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      controls
      playsInline
      preload="auto"
      controlsList="nodownload"
      poster={poster}
      onPlay={handlePlay}
      onEnded={handleEnded}
      onError={(e) => {
        const target = e.target as HTMLVideoElement;
        target.onerror = null;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm p-4 text-center';
        errorDiv.textContent = 'Video could not be loaded. Please make sure the video URL is publicly accessible.';
        target.parentElement?.parentElement?.appendChild(errorDiv);
      }}
    >
      <source src={src} type="video/mp4" />
      <source src={src} type="video/webm" />
      <source src={src} type="video/ogg" />
      Your browser does not support the video tag.
    </video>
  );
};

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [portfolioActiveIndex, setPortfolioActiveIndex] = useState(0);
  const [portfolioCarouselApi, setPortfolioCarouselApi] = useState<CarouselApi>();
  const { user } = useAuth();
  const { adminUser } = useAdminAuth();

  // Check if current user has edit permissions
  const hasEditPermissions = React.useMemo(() => {
    return adminUser !== null || (user && vendor && user.email === vendor.contact_email);
  }, [adminUser, user, vendor]);

  // Handle slide change - pause all videos
  useEffect(() => {
    if (!carouselApi) return undefined;

    const handleSlideChange = () => {
      // Pause all videos when changing slides
      document.querySelectorAll('video').forEach(video => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", handleSlideChange);
    return () => {
      carouselApi.off("select", handleSlideChange);
    };
  }, [carouselApi]);

  // Handle portfolio carousel slide change
  useEffect(() => {
    if (!portfolioCarouselApi) return undefined;

    const handlePortfolioSlideChange = () => {
      setPortfolioActiveIndex(portfolioCarouselApi.selectedScrollSnap());
    };

    portfolioCarouselApi.on("select", handlePortfolioSlideChange);
    return () => {
      portfolioCarouselApi.off("select", handlePortfolioSlideChange);
    };
  }, [portfolioCarouselApi]);

  const handlePrevSlide = () => {
    if (carouselApi) {
      // Pause all videos
      document.querySelectorAll('video').forEach(video => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
      carouselApi.scrollPrev();
    }
  };

  const handleNextSlide = () => {
    if (carouselApi) {
      // Pause all videos
      document.querySelectorAll('video').forEach(video => {
        if (!video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
      carouselApi.scrollNext();
    }
  };

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

  // Function to convert Google Drive URL to direct playable URL
  const getVideoUrl = (url: string): string => {
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      }
      
      if (fileId) {
        // Use the preview URL format which is more reliable for video playback
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

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
              portfolio_events: ["Wedding at Grand Hotel", "Corporate Event at Tech Park", "Birthday Celebration"],
              instagram_reels: [],
              services: [],
              experience_years: 0,
              completed_events: 0
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Services Offered</h2>
                {hasEditPermissions && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const service = window.prompt('Enter new service:');
                      if (service && vendor) {
                        const newServices = [...(vendor.services || []), service];
                        updateVendorServices(vendor.id, newServices).then(success => {
                          if (success) {
                            setVendor(prev => prev ? { ...prev, services: newServices } : null);
                            toast({
                              title: "Service added successfully",
                              description: `Added "${service}" to services list.`,
                            });
                          }
                        });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {vendor?.services?.map((service, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-gray-600">{service}</span>
                    </div>
                    {hasEditPermissions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-500"
                        onClick={() => {
                          if (vendor) {
                            const newServices = vendor.services.filter((_, i) => i !== index);
                            updateVendorServices(vendor.id, newServices).then(success => {
                              if (success) {
                                setVendor(prev => prev ? { ...prev, services: newServices } : null);
                                toast({
                                  title: "Service removed",
                                  description: `Removed "${service}" from services list.`,
                                });
                              }
                            });
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Experience</h2>
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Years of Experience</p>
                        <p className="text-lg font-semibold">{vendor?.experience_years || 0} years</p>
                      </div>
                    </div>
                    {hasEditPermissions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const years = window.prompt('Enter years of experience:');
                          if (years && vendor && !isNaN(Number(years))) {
                            updateVendorExperience(vendor.id, Number(years), vendor.completed_events || 0).then(success => {
                              if (success) {
                                setVendor(prev => prev ? { ...prev, experience_years: Number(years) } : null);
                                toast({
                                  title: "Experience updated",
                                  description: `Updated years of experience to ${years}.`,
                                });
                              }
                            });
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-gray-500">Events Completed</p>
                        <p className="text-lg font-semibold">{vendor?.completed_events || 0} events</p>
                      </div>
                    </div>
                    {hasEditPermissions && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const events = window.prompt('Enter number of completed events:');
                          if (events && vendor && !isNaN(Number(events))) {
                            updateVendorExperience(vendor.id, vendor.experience_years || 0, Number(events)).then(success => {
                              if (success) {
                                setVendor(prev => prev ? { ...prev, completed_events: Number(events) } : null);
                                toast({
                                  title: "Experience updated",
                                  description: `Updated completed events to ${events}.`,
                                });
                              }
                            });
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              
              {/* Images */}
              <div className="mb-8">
                {vendor.portfolio_images && vendor.portfolio_images.length > 0 ? (
                  <div className="relative">
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                        skipSnaps: false,
                        containScroll: "trimSnaps"
                      }}
                      className="w-full portfolio-carousel"
                      setApi={setPortfolioCarouselApi}
                    >
                      <CarouselContent>
                        {vendor.portfolio_images.map((image, index) => (
                          <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                            <div className="aspect-square rounded-lg overflow-hidden mx-2">
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
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious 
                        className="h-6 w-6 absolute -left-3 bg-primary/10 hover:bg-primary hover:text-white border-primary/20 transition-all duration-300 ease-out hover:scale-110 hover:-translate-x-1 animate-in fade-in" 
                      />
                      <CarouselNext 
                        className="h-6 w-6 absolute -right-3 bg-primary/10 hover:bg-primary hover:text-white border-primary/20 transition-all duration-300 ease-out hover:scale-110 hover:translate-x-1 animate-in fade-in" 
                      />
                      <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center gap-2 py-2">
                        {vendor.portfolio_images.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              portfolioActiveIndex === index ? 'bg-primary w-4' : 'bg-primary/20'
                            }`}
                            onClick={() => carouselApi?.scrollTo(index)}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </Carousel>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No portfolio images available
                  </div>
                )}
              </div>

              {/* Video Reels */}
              {vendor.instagram_reels && vendor.instagram_reels.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Video Reels</h3>
                  <div className="relative px-4 md:px-12">
                    <VideoContext.Provider value={{ playingId: playingVideoId, setPlayingId: setPlayingVideoId }}>
                      <Carousel
                        opts={{
                          align: "start",
                          loop: true,
                          skipSnaps: false,
                          containScroll: "trimSnaps",
                          dragFree: true
                        }}
                        className="w-full embla"
                        setApi={setCarouselApi}
                      >
                        <CarouselContent className="-ml-6 md:-ml-8">
                          {vendor.instagram_reels.map((reelUrl, index) => (
                            <CarouselItem 
                              key={index} 
                              className="pl-6 md:pl-8 basis-[85%] sm:basis-[45%] md:basis-[35%] lg:basis-[25%]"
                            >
                              <div className="mx-2 aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 relative shadow-lg">
                                {reelUrl.includes('drive.google.com') ? (
                                  <iframe
                                    src={getVideoUrl(reelUrl)}
                                    className="w-full h-full"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="relative w-full h-full">
                                    <VideoPlayer
                                      key={`video-${index}`}
                                      id={`video-${index}`}
                                      src={reelUrl}
                                      poster={vendor.image_url || "https://via.placeholder.com/300x533?text=Loading+Video"}
                                    />
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 to-transparent"></div>
                                  </div>
                                )}
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious 
                          className="h-6 w-6 absolute -left-3 bg-primary/10 hover:bg-primary hover:text-white border-primary/20 transition-all duration-300 ease-out hover:scale-110 hover:-translate-x-1 animate-in fade-in" 
                        />
                        <CarouselNext 
                          className="h-6 w-6 absolute -right-3 bg-primary/10 hover:bg-primary hover:text-white border-primary/20 transition-all duration-300 ease-out hover:scale-110 hover:translate-x-1 animate-in fade-in" 
                        />
                      </Carousel>
                    </VideoContext.Provider>
                  </div>
                </div>
              )}

              {/* Portfolio Description */}
              {vendor.portfolio_description && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Portfolio Description</h3>
                  <p className="text-gray-600">{vendor.portfolio_description}</p>
                </div>
              )}

              {/* Past Events */}
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