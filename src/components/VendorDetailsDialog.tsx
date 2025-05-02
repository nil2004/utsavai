import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Calendar, ExternalLink, Award, CheckCircle, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vendor } from '@/lib/vendor-service';

interface VendorDetailsDialogProps {
  vendor: Vendor;
  onClose: () => void;
  onInterested: () => void;
  isInterested: boolean;
}

const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({
  vendor,
  onClose,
  onInterested,
  isInterested
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{vendor.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-video">
              <img
                src={vendor.image_url}
                alt={vendor.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 font-semibold">{vendor.rating}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="ml-1">{vendor.city}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">About</h3>
              <p className="text-gray-600">{vendor.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Services</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold">{vendor.experience_years} years</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-violet-500" />
                <div>
                  <p className="text-sm text-gray-600">Events Completed</p>
                  <p className="font-semibold">{vendor.completed_events}+</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span>{vendor.contact_phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span>{vendor.contact_email}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={isInterested ? "secondary" : "default"}
            onClick={onInterested}
          >
            {isInterested ? "Interested ✓" : "Interested"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsDialog; 