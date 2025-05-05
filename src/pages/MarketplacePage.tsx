import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Star, Filter, Search } from 'lucide-react';
import { RangeSlider } from '@/components/ui/range-slider';
import { getFrontendVendors, type Vendor } from '@/lib/vendor-service';
import '@/styles/marketplace.css';

// Interface for sample vendors (matches hardcoded data structure)
interface SampleVendor {
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

// Keep sampleVendors as fallback
export const sampleVendors: SampleVendor[] = [
  {
    id: 1,
    name: "Elegant Decorations",
    category: "Decorator",
    rating: 4.8,
    reviewCount: 124,
    priceRange: "₹15,000 - ₹50,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070",
    city: "Mumbai",
  },
  {
    id: 2,
    name: "Capture Moments",
    category: "Photographer",
    rating: 4.9,
    reviewCount: 89,
    priceRange: "₹20,000 - ₹80,000",
    price: 40000,
    image: "https://images.unsplash.com/photo-1554941829-202a0b2403b8?q=80&w=2070",
    city: "Delhi",
  },
  {
    id: 3,
    name: "Tasty Feasts",
    category: "Caterer",
    rating: 4.7,
    reviewCount: 156,
    priceRange: "₹500 - ₹1,200",
    price: 30000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Bangalore",
  },
  {
    id: 4,
    name: "Luxury Decorations",
    category: "Decorator",
    rating: 4.9,
    reviewCount: 142,
    priceRange: "₹30,000 - ₹100,000",
    price: 60000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098",
    city: "Delhi",
  },
  {
    id: 5,
    name: "Budget Decorations",
    category: "Decorator",
    rating: 4.5,
    reviewCount: 98,
    priceRange: "₹8,000 - ₹20,000",
    price: 12000,
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2070",
    city: "Mumbai",
  },
  {
    id: 6,
    name: "PixelPerfect",
    category: "Photographer",
    rating: 4.7,
    reviewCount: 105,
    priceRange: "₹15,000 - ₹60,000",
    price: 25000,
    image: "https://images.unsplash.com/photo-1567156345300-e9a8844b19cc?q=80&w=2070",
    city: "Bangalore",
  },
  {
    id: 7,
    name: "Gourmet Delights",
    category: "Caterer",
    rating: 4.8,
    reviewCount: 178,
    priceRange: "₹800 - ₹2,000",
    price: 50000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Delhi",
  },
  {
    id: 8,
    name: "Budget Eats",
    category: "Caterer",
    rating: 4.3,
    reviewCount: 87,
    priceRange: "₹300 - ₹600",
    price: 15000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070",
    city: "Mumbai",
  },
];

const categories = ["All", "Decorator", "Photographer", "Caterer", "Venue", "Sound & Lighting", "Entertainment", "Anchor", "Makeup Artist"];
const cities = ["All", "Mumbai", "Delhi", "Bangalore"];
const sortOptions = ["Rating: High to Low", "Price: Low to High", "Price: High to Low"];

const MarketplacePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Initialize price range with explicit values
  const minPrice = 5000;
  const maxPrice = 10000000; // 1 crore
  const step = 1000;
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  // Handle price range change with debounce
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([
      Math.max(minPrice, Math.round(value[0] / step) * step),
      Math.min(maxPrice, Math.round(value[1] / step) * step)
    ]);
  };

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const data = await getFrontendVendors();
        console.log(`Loaded ${data.length} vendors from database for marketplace`);
        setVendors(data);
        setUsingSampleData(false);
        setError(null);
      } catch (err) {
        console.error('Error loading vendors:', err);
        setError('Failed to load vendors. Using sample data instead.');
        setUsingSampleData(true);
        // Don't set vendors here, we'll handle sample vendors in the filtering
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  // Format price to Indian currency format with ₹ symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Use sample vendors if we have an error, otherwise use real vendors
  const sourceData = usingSampleData ? sampleVendors : vendors;

  const filteredVendors = sourceData
    .filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (vendor.category && vendor.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (vendor.city && vendor.city.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || vendor.category === selectedCategory;
      const matchesCity = selectedCity === "All" || vendor.city === selectedCity;
      const matchesPriceRange = vendor.price >= priceRange[0] && vendor.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesCity && matchesPriceRange;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case "Rating: High to Low":
          return (b.rating || 0) - (a.rating || 0);
        case "Price: Low to High":
          return (a.price || 0) - (b.price || 0);
        case "Price: High to Low":
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

  // Helper function to get the image URL based on vendor type
  const getVendorImage = (vendor: any): string => {
    if (usingSampleData) {
      return (vendor as SampleVendor).image;
    } else {
      return (vendor as Vendor).image_url || 'https://images.unsplash.com/photo-1496115965489-21be7e6e59a0?q=80&w=2940';
    }
  };

  // Helper function to get review count
  const getReviewCount = (vendor: any): number => {
    if (usingSampleData) {
      return (vendor as SampleVendor).reviewCount;
    } else {
      // Generate a random number for vendors from DB
      return Math.floor(Math.random() * 100) + 20;
    }
  };

  // Helper function to get price display
  const getPriceDisplay = (vendor: any): string => {
    if (usingSampleData) {
      return (vendor as SampleVendor).priceRange.replace(/ per plate/gi, '');
    } else {
      return `₹${(vendor as Vendor).price?.toLocaleString('en-IN') || '0'}`;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-violet-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
            <p className="mt-2 text-gray-600">Find the perfect vendors for your event</p>
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                Showing all {filteredVendors.length} vendors 
                {usingSampleData ? " (sample data)" : " from our database"}
              </p>
            )}
            {error && (
              <p className="text-sm text-amber-600 mt-1">{error}</p>
            )}
        </div>
          <div className="w-full md:w-auto flex gap-2">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              </Button>
            </div>
          </div>
          
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">City</Label>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Button
                    key={city}
                    variant={selectedCity === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCity(city)}
                    className="text-sm"
                  >
                    {city}
                  </Button>
                ))}
          </div>
        </div>
        
            <div>
              <Label className="text-sm font-medium mb-2 block">Sort By</Label>
              <div className="flex flex-col gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option}
                    variant={selectedSort === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSort(option)}
                    className="text-sm justify-start"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Price Range</Label>
              <div className="space-y-4">
                <div className="price-range-display">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <RangeSlider
                  min={minPrice}
                  max={maxPrice}
                  step={step}
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  className="price-slider"
                />
                <div className="price-preset-buttons">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([5000, 25000])}
                    className={`price-preset-button ${priceRange[0] === 5000 && priceRange[1] === 25000 ? 'active' : ''}`}
                  >
                    Budget
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([25000, 50000])}
                    className={`price-preset-button ${priceRange[0] === 25000 && priceRange[1] === 50000 ? 'active' : ''}`}
                  >
                    Mid-Range
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPriceRange([50000, 10000000])}
                    className={`price-preset-button ${priceRange[0] === 50000 && priceRange[1] === 10000000 ? 'active' : ''}`}
                  >
                    Premium
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <p className="col-span-full text-center py-12">Loading vendors...</p>
              ) : filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={getVendorImage(vendor)}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium border border-gray-200/50">
                      {vendor.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{vendor.city}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full text-sm border border-yellow-100">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-0.5" />
                        <span className="font-bold">{vendor.rating || 0}</span>
                        <span className="text-gray-500 ml-0.5">
                          ({getReviewCount(vendor)})
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {getPriceDisplay(vendor)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/vendor/${vendor.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
        
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
                <p className="text-gray-500">No vendors found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
