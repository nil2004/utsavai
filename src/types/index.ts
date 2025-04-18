export interface Vendor {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  price: number;
  image: string;
  city: string;
}

export interface VendorChecklistItem {
  id: string;
  name: string;
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string | VendorChecklistItem[];
  isVendorList?: boolean;
  isVendorSuggestions?: boolean;
  vendors?: Vendor[];
}

export interface EventType {
  id: string;
  name: string;
  emoji: string;
} 