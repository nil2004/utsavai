import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  MessageCircle, 
  Users, 
  Award, 
  Heart, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

const AboutPage = () => {
  // Commented out team data as it's not needed for now
  // const team = [
  //   {
  //     name: "Rahul Verma",
  //     role: "Founder & CEO",
  //     image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974",
  //     bio: "Event industry veteran with 10+ years experience"
  //   },
  //   {
  //     name: "Priya Sharma",
  //     role: "Lead AI Developer",
  //     image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974",
  //     bio: "AI specialist focusing on personalized recommendations"
  //   },
  //   {
  //     name: "Vikram Patel",
  //     role: "Vendor Relations",
  //     image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974",
  //     bio: "Curates our vendor list to ensure quality service"
  //   },
  // ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About UtsavAI</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We're revolutionizing event planning with AI technology that makes finding the perfect vendors simple and stress-free.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069" 
                alt="Team meeting" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                UtsavAI was born out of a simple observation: planning events in India is unnecessarily complicated, with endless phone calls, visits, and negotiations with vendors.
              </p>
              <p className="text-gray-700 mb-4">
                Founded in 2023, we set out to create a platform that combines the power of AI with personalized human support to help event planners find the perfect vendors quickly and efficiently.
              </p>
              <p className="text-gray-700 mb-4">
                Our team of event industry veterans, AI specialists, and customer support experts work together to provide a seamless experience for both event planners and vendors.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/chat">Start Planning Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
            To simplify event planning in India by creating meaningful connections between event organizers and quality vendors through technology and personalized support.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Planning</h3>
              <p className="text-gray-600">
                Our intelligent assistant helps you identify your exact needs and matches you with vendors who meet your requirements.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                We manually verify all vendors on our platform to ensure they meet our high standards for quality and reliability.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personal Support</h3>
              <p className="text-gray-600">
                Our team provides personalized assistance throughout your planning journey, ensuring a smooth experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-primary text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2000+</div>
              <p>Happy Clients</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">300+</div>
              <p>Verified Vendors</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p>Events Planned</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <p>Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="relative">
            <div className="text-6xl text-primary opacity-20 absolute top-0 left-0">"</div>
            <blockquote className="text-2xl text-gray-700 italic font-light px-12 mb-6">
              UtsavAI transformed our wedding planning process. Their AI suggested vendors that perfectly matched our vision, and their team was always available to answer questions. Couldn't have done it without them!
            </blockquote>
            <div className="text-6xl text-primary opacity-20 absolute bottom-0 right-0">"</div>
          </div>
          <div className="mt-6">
            <p className="font-bold text-lg">Anjali & Rohit</p>
            <p className="text-gray-500">Wedding in Bangalore, 2023</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-primary text-white p-8">
                <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>+91 8974894143</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>utsav.ai.event@gmail.com</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 mt-1" />
                    <span>Lmd Er Foundation Inst, 22km Milestone Kanjibans, Roorkee City, Haridwar, Roorkee, Uttarakhand, India, 247667</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-8">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      rows={4} 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    ></textarea>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-accent text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Planning Your Event?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our AI assistant guide you through the process and connect you with the perfect vendors.
          </p>
          <Button asChild size="lg" className="bg-white text-accent hover:bg-gray-100">
            <Link to="/chat">Chat with UtsavAI Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
