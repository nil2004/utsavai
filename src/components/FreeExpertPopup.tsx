import React from 'react';
import { X, Clock, Gift, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FreeExpertPopupProps {
  onClose: () => void;
  onGetAdvice: () => void;
}

const FreeExpertPopup: React.FC<FreeExpertPopupProps> = ({ onClose, onGetAdvice }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        {/* Header with background */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-1 bg-white/20 hover:bg-white/40 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center justify-center mb-3">
            <Gift className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-1">
            🎁 FREE Expert Event Planning
          </h2>
          <p className="text-white/90 text-center">
            Exclusive offer for new users
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Limited time offer:</span> Only available for 7 days after signup!
            </p>
          </div>
          
          <h3 className="text-lg font-semibold mb-3">What you'll get:</h3>
          <ul className="space-y-3 mb-4">
            <li className="flex items-start">
              <div className="bg-violet-100 p-1 rounded-full mr-2 mt-0.5">
                <Calendar className="h-4 w-4 text-violet-700" />
              </div>
              <span className="text-gray-700">Personalized event planning from experts with 7+ years of experience</span>
            </li>
            <li className="flex items-start">
              <div className="bg-violet-100 p-1 rounded-full mr-2 mt-0.5">
                <Calendar className="h-4 w-4 text-violet-700" />
              </div>
              <span className="text-gray-700">Creative ideas and insider knowledge to make your event special</span>
            </li>
            <li className="flex items-start">
              <div className="bg-violet-100 p-1 rounded-full mr-2 mt-0.5">
                <Calendar className="h-4 w-4 text-violet-700" />
              </div>
              <span className="text-gray-700">Vendor recommendations tailored to your budget and preferences</span>
            </li>
          </ul>
          
          <div className="flex flex-col space-y-3">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white"
              onClick={onGetAdvice}
            >
              Get Free Expert Advice
            </Button>
            <button 
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeExpertPopup; 