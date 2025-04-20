import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, Users, MessageSquare, CheckCircle, Award, Gift, Clock, User, LogIn } from 'lucide-react';
import FreeExpertPopup from '@/components/FreeExpertPopup';
import FreeOfferForm from '@/components/FreeOfferForm';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';

const HomePage = () => {
  const [showExpertPopup, setShowExpertPopup] = useState(false);
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [hasUsedOffer, setHasUsedOffer] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has already used the offer (either from localStorage or from database)
  useEffect(() => {
    const checkUserOffer = async () => {
      // First check localStorage for backward compatibility
      const hasUsed = localStorage.getItem('hasUsedExpertOffer') === 'true';
      
      if (hasUsed) {
        setHasUsedOffer(true);
        return;
      }
      
      // If user is logged in, check database
      if (user && user.id) {
        try {
          const { data, error } = await supabase
            .from('event_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('request_type', 'consultation')
            .maybeSingle();
          
          if (error) {
            console.error('Error checking user consultation:', error);
          } else if (data) {
            console.log('User already has a consultation request:', data);
            setHasUsedOffer(true);
            // Update localStorage for future quick checks
            localStorage.setItem('hasUsedExpertOffer', 'true');
          }
        } catch (err) {
          console.error('Error in checkUserOffer:', err);
        }
      }
    };
    
    checkUserOffer();
  }, [user]);
  
  // Check if user is newly logged in (using localStorage)
  useEffect(() => {
    const isNewlyLoggedIn = sessionStorage.getItem('newlyLoggedIn');
    const hasSeenPopup = localStorage.getItem('hasSeenExpertPopup');
    
    if (isNewlyLoggedIn === 'true' && hasSeenPopup !== 'true' && !hasUsedOffer) {
      // Show popup after a slight delay
      const timer = setTimeout(() => {
        setShowExpertPopup(true);
        sessionStorage.removeItem('newlyLoggedIn');
        localStorage.setItem('hasSeenExpertPopup', 'true');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [hasUsedOffer]);

  // Check if user was redirected after login to access the expert planning
  useEffect(() => {
    // Only run this if the user is logged in
    if (user) {
      const redirectTarget = sessionStorage.getItem('redirectAfterLogin');
      if (redirectTarget === 'expertPlanning') {
        // Clear the redirect target
        sessionStorage.removeItem('redirectAfterLogin');
        // Show the expert form
        setShowExpertForm(true);
        // Mark as newly logged in for potential future popup
        sessionStorage.setItem('newlyLoggedIn', 'true');
      }
    }
  }, [user]);

  // Handle when user submits the form successfully
  const handleFormSubmitSuccess = () => {
    setShowExpertForm(false);
    // Mark the offer as used only on successful submission
    localStorage.setItem('hasUsedExpertOffer', 'true');
    setHasUsedOffer(true);
    
    // Show success notification
    alert('Thank you! Our UtsavAI team will connect with you within 24 hours.');
  };
  
  // Handle when user just closes the form without submitting
  const handleFormCancel = () => {
    // Just close the form without marking offer as used
    setShowExpertForm(false);
  };

  // Handle when user clicks to get expert advice
  const handleGetExpertAdvice = () => {
    // Check if user is logged in
    if (user) {
      // User is logged in, show the form
      setShowExpertForm(true);
      setShowExpertPopup(false);
    } else {
      // User is not logged in, show login prompt
      setShowLoginPrompt(true);
      setShowExpertPopup(false);
    }
  };

  const eventTypes = [
    { name: 'Wedding', icon: '👰', color: 'bg-pink-100' },
    { name: 'Birthday', icon: '🎂', color: 'bg-blue-100' },
    { name: 'Corporate', icon: '💼', color: 'bg-gray-100' },
    { name: 'College Fest', icon: '🎓', color: 'bg-yellow-100' },
    { name: 'School Event', icon: '🏫', color: 'bg-green-100' },
    { name: 'Custom', icon: '✨', color: 'bg-purple-100' },
  ];

  const features = [
    { 
      title: 'AI-Powered Suggestions', 
      description: 'Get personalized vendor recommendations based on your event type, budget, and preferences.', 
      icon: <MessageSquare className="h-10 w-10 text-primary" />
    },
    { 
      title: 'Curated Vendors', 
      description: 'All vendors are verified and hand-picked by our team to ensure quality service.', 
      icon: <CheckCircle className="h-10 w-10 text-primary" />
    },
    { 
      title: 'Streamlined Planning', 
      description: 'Plan your entire event through a simple chat interface, from venue to catering to entertainment.', 
      icon: <Calendar className="h-10 w-10 text-primary" />
    },
    { 
      title: 'Personal Assistance', 
      description: 'Our team helps you connect with vendors and answers all your questions.', 
      icon: <Users className="h-10 w-10 text-primary" />
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      event: "Wedding",
      quote: "UtsavAI made planning my dream wedding so much easier! The AI suggested vendors that perfectly matched my style and budget.",
      rating: 5,
    },
    {
      name: "Rahul Mehta",
      event: "Corporate Event",
      quote: "Our company offsite was a huge success thanks to UtsavAI's vendor recommendations. Saved us hours of research!",
      rating: 5,
    },
    {
      name: "Anjali Patel",
      event: "College Fest",
      quote: "As a student organizer, UtsavAI helped us find affordable vendors for our college fest within our limited budget.",
      rating: 4,
    },
  ];

  const handleEventTypeClick = (eventType: string) => {
    if (!user) {
      // Store the event type for after login
      sessionStorage.setItem('selectedEventType', eventType);
      // Set a flag to indicate we need to reset scroll
      sessionStorage.setItem('needsScrollReset', 'true');
      // Navigate to login
      navigate('/login');
      return;
    }
    // If user is logged in, navigate to chat with event type
    navigate(`/chat?event=${eventType}`);
  };

  return (
    <>
      <SEO 
        title="UtsavAI - AI-Powered Event Planning Made Easy"
        description="Transform your event planning with UtsavAI. Get instant vendor recommendations, budget optimization, and expert planning assistance for weddings, corporate events, and more."
        type="website"
      />
      <div className="flex flex-col min-h-screen">
        {/* Special Offer Banner - Only show if not used */}
        {!hasUsedOffer && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 py-3 px-4 text-white relative overflow-hidden shadow-lg">
            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-300 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute left-1/4 -bottom-6 w-20 h-20 bg-pink-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute right-1/3 top-1/2 w-4 h-4 bg-blue-300 rounded-full opacity-60 animate-pulse"></div>
            
            <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-6 relative z-10">
              <div className="flex items-center transform hover:scale-105 transition-transform">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-yellow-300 drop-shadow-glow animate-pulse" />
                <span className="font-semibold text-base sm:text-lg">🎁 FREE Expert Event Planning</span>
              </div>
              <div className="flex items-center backdrop-blur-sm bg-white/10 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-sm sm:text-base">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-yellow-200" />
                <span className="font-medium">Login required - First 7 days trial!</span>
              </div>
              <Button 
                size="sm" 
                className="bg-white text-violet-700 hover:bg-yellow-100 whitespace-nowrap font-semibold shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base mt-2 sm:mt-0"
                onClick={handleGetExpertAdvice}
              >
                Get Free Expert Advice
              </Button>
            </div>
          </div>
        )}
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-light to-white py-10 sm:py-20 px-4 sm:px-6">
          <div className="container mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Plan Your Perfect Event with <span className="text-primary">AI</span> Assistance
              </h1>
              <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-gray-700">
                UtsavAI connects you with the right vendors for your special occasions through smart, AI-powered recommendations.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto">
                  <Link to="/chat">Start Planning with AI</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary-light w-full sm:w-auto mt-3 sm:mt-0">
                  <Link to="/marketplace">Marketplace</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070" 
                alt="Event planning" 
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Event Types Section */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Event Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTypes.map((type) => (
                <Card
                  key={type.name}
                  className="cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  onClick={() => handleEventTypeClick(type.name.toLowerCase())}
                >
                  <div className={`${type.color} rounded-lg p-4 sm:p-6 text-center transition-all duration-300 group-hover:shadow-md transform group-hover:-translate-y-1`}>
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{type.icon}</div>
                    <h3 className="font-medium text-sm sm:text-base text-gray-800">{type.name}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Free Expert Planning Section (Middle of page) - Only show if not used */}
        {!hasUsedOffer && (
          <section className="py-16 px-6 bg-gradient-to-br from-violet-50 to-white border-y border-violet-100">
            <div className="container mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between bg-white rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-all duration-500 relative">
                {/* 3D decorative elements */}
                <div className="absolute -top-8 -left-8 w-16 h-16 bg-violet-300 rounded-full blur-xl opacity-50"></div>
                <div className="absolute -bottom-10 right-1/4 w-32 h-32 bg-pink-200 rounded-full blur-xl opacity-40"></div>
                <div className="absolute top-1/4 right-10 w-6 h-6 bg-yellow-300 rounded-full opacity-70"></div>
                
                <div className="lg:w-1/2 p-8 lg:p-12 relative z-10">
                  <div className="inline-block bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium px-4 py-1.5 rounded-full text-sm mb-4 shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                    🔥 Limited Time Offer
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-purple-600">
                    🎁 Free Expert Event Planning
                  </h2>
                  <p className="text-gray-600 mb-6 drop-shadow-sm">
                    Our team with 7+ years of experience provides personalized event planning advice, creative ideas, and insider knowledge - <span className="font-semibold text-violet-700">free for your first 7 days trial!</span>
                  </p>
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-4 mb-6 shadow-inner relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-yellow-200 rounded-full opacity-40 blur-md"></div>
                    <div className="flex items-center relative z-10">
                      <Clock className="h-6 w-6 text-amber-600 mr-3 animate-pulse" />
                      <p className="text-sm text-amber-800 font-medium">
                        <span className="font-bold">Exclusive for new users:</span> Limited time trial offer!
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-accent to-violet-600 hover:from-accent/90 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] transition-all duration-300"
                    onClick={handleGetExpertAdvice}
                  >
                    Get Free Expert Advice
                  </Button>
                </div>
                <div className="lg:w-1/2 h-64 lg:h-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070" 
                    alt="Event experts" 
                    className="w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How UtsavAI Works</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our AI-powered platform simplifies event planning by connecting you with the perfect vendors tailored to your needs.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-primary text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Planning?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get personalized vendor recommendations and simplify your event planning journey today.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/chat">Chat with UtsavAI</Link>
            </Button>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.event}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 px-6 bg-gray-50">
          <div className="container mx-auto text-center">
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">Trusted by 2000+ Users</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">300+ Verified Vendors</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-primary mr-2" />
                <span className="text-gray-700">500+ Events Planned</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Free Expert Planning Popup */}
        {showExpertPopup && (
          <FreeExpertPopup 
            onClose={() => setShowExpertPopup(false)} 
            onGetAdvice={handleGetExpertAdvice}
          />
        )}
        
        {/* Free Expert Advice Form Modal */}
        {showExpertForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md">
              <FreeOfferForm 
                onClose={handleFormCancel}
                eventType="consultation" 
                onSubmitSuccess={handleFormSubmitSuccess}
              />
            </div>
          </div>
        )}
        
        {/* Login Prompt Dialog */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <h2 className="text-xl font-bold">Sign in Required</h2>
                <p className="text-white/90 mt-1">
                  You need to be signed in to access this feature
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <LogIn className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <p className="text-gray-700">
                    Our Free Expert Event Planning service is exclusively available to registered users.
                    Sign in or create an account to get personalized advice from our team.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLoginPrompt(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      sessionStorage.setItem('redirectAfterLogin', 'expertPlanning');
                      navigate('/login');
                    }}
                  >
                    Sign in / Register
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
