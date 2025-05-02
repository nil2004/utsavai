import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Calendar, ExternalLink, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vendor } from '@/lib/vendor-service';

interface VendorDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor;
}

const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({
  isOpen,
  onClose,
  vendor,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{vendor.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Hero Image */}
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={vendor.image_url}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{vendor.city}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-bold">{vendor.rating}</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
              <p className="font-semibold">{vendor.category}</p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Starting Price</h4>
              <p className="font-semibold">₹{vendor.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Experience and Events */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-violet-50/50 rounded-lg border border-violet-100/50">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-violet-500" />
                <h4 className="text-sm font-medium text-gray-500">Years of Experience</h4>
              </div>
              <p className="font-semibold text-lg">{vendor.experience_years} Years</p>
            </div>
            <div className="p-4 bg-violet-50/50 rounded-lg border border-violet-100/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-violet-500" />
                <h4 className="text-sm font-medium text-gray-500">Events Completed</h4>
              </div>
              <p className="font-semibold text-lg">{vendor.completed_events}+ Events</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Services Offered</h3>
            <div className="grid grid-cols-2 gap-2">
              {vendor.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-gray-600">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button className="flex-1">Request Booking</Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to={`/vendor/${vendor.id}`}>
                View Full Profile
                <ExternalLink className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsDialog; 