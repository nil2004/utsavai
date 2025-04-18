import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

interface BookingDetails {
  vendorName: string;
  vendorCategory: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // In a real application, you would get the booking details from the location state
  // or from an API call using a booking ID passed in the URL
  const bookingDetails: BookingDetails = location.state?.bookingDetails || {
    vendorName: 'Elegant Decor',
    vendorCategory: 'Decorator',
    date: new Date().toLocaleDateString(),
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+91 98765 43210'
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex justify-center items-center bg-green-100 text-green-800 rounded-full p-3 mb-6">
          <CheckCircle className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your booking with {bookingDetails.vendorName} has been confirmed
        </p>
        
        <Card className="p-8 mb-8 text-left">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-medium">{formatDate(bookingDetails.date)}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendor</p>
                    <p className="font-medium">{bookingDetails.vendorName}</p>
                    <p className="text-sm text-gray-500">{bookingDetails.vendorCategory}</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Your Information</h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{bookingDetails.customerEmail}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{bookingDetails.customerPhone}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Card>
        
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">What's Next?</h2>
          <p className="text-gray-600">
            The vendor will contact you shortly to confirm the details of your booking.
            You'll also receive a confirmation email with all the information.
          </p>
        </div>
        
        <div className="space-x-4">
          <Button onClick={() => navigate('/marketplace')}>
            Browse More Vendors
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
        
        <div className="mt-12 p-4 border border-amber-200 bg-amber-50 rounded-lg inline-flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <ArrowRight className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-amber-800">
            Need help with your booking? Contact our support team at support@eventbuddy.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
