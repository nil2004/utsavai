import { useEffect, useState } from "react";
import { 
  VendorInsert, 
  VENDOR_CATEGORIES, 
  VENDOR_STATUSES, 
  getVendors, 
  deleteVendor, 
  createVendor,
  updateVendor,
  type Vendor,
  type VendorUpdate
} from "@/lib/vendor-service";
import { SupabaseConnectionTest } from "@/components/SupabaseConnectionTest";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, PlusCircle, Search, Trash2, Edit, Star, X, Image, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/lib/supabase";

// Constants
const DEFAULT_VENDOR_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image+Available';

// Define form schema with validation
const vendorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  city: z.string().min(1, "City is required"),
  price: z.number().min(0, "Price cannot be negative"),
  rating: z.number().min(0, "Rating cannot be negative").max(5, "Rating cannot exceed 5"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contact_email: z.string().email("Please enter a valid email").default("contact@utsavai.com"),
  contact_phone: z.string().min(5, "Phone number is required").default("0000000000"),
  image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  status: z.string().min(1, "Please select a status").default(VENDOR_STATUSES.PENDING),
  portfolio_images: z.array(z.string().url("Please enter valid URLs")).default([]),
  portfolio_description: z.string().optional().default(""),
  portfolio_events: z.array(z.string()).default([])
});

// Add this new component before the VendorsPage component
const PortfolioPreviewDialog = ({ vendor, open, onOpenChange }: { 
  vendor: Vendor; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor.name}'s Portfolio</DialogTitle>
          <DialogDescription>
            View portfolio details and past events
          </DialogDescription>
        </DialogHeader>
        
        {vendor.portfolio_description && (
          <div className="space-y-2">
            <h3 className="font-medium">Portfolio Description</h3>
            <p className="text-sm text-gray-600">{vendor.portfolio_description}</p>
          </div>
        )}
        
        {vendor.portfolio_images && vendor.portfolio_images.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Portfolio Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vendor.portfolio_images.map((url, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                  {url ? (
                    <img 
                      src={url} 
                      alt={`Portfolio image ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200?text=Failed+to+load';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {vendor.portfolio_events && vendor.portfolio_events.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Past Events</h3>
            <div className="border rounded-lg divide-y">
              {vendor.portfolio_events.map((event, index) => (
                <div key={index} className="p-3 text-sm">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const VendorsPage = () => {
  console.log('VendorsPage component rendering');
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [previewVendor, setPreviewVendor] = useState<Vendor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition using react-hook-form
  const form = useForm<z.infer<typeof vendorFormSchema>>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      category: "",
      city: "",
      price: 0,
      rating: 0,
      description: "",
      contact_email: "contact@utsavai.com",
      contact_phone: "0000000000",
      image_url: "",
      status: VENDOR_STATUSES.PENDING,
      portfolio_images: [],
      portfolio_description: "",
      portfolio_events: []
    }
  });

  // Watch form values for debugging
  const formValues = form.watch();
  useEffect(() => {
    console.log('Form values:', formValues);
  }, [formValues]);

  // Load vendors
  const loadVendors = async () => {
    console.log('loadVendors called with filters:', {
      category: categoryFilter,
      status: statusFilter,
      search: searchQuery
    });
    
    setLoading(true);
    setError(null);
    try {
      const filters = {
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined
      };
      
      console.log('Fetching vendors with filters:', filters);
      const data = await getVendors(filters);
      console.log('Vendors loaded successfully:', data);
      
      if (!Array.isArray(data)) {
        console.error('Unexpected data format:', data);
        throw new Error('Received invalid data format from server');
      }
      
      setVendors(data);
      console.log('Updated vendors state with', data.length, 'vendors');
      
      toast({
        title: "Vendors loaded",
        description: `Successfully loaded ${data.length} vendors.`,
      });
    } catch (error) {
      console.error('Error in loadVendors:', error);
      setError(`Error loading vendors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: "Error loading vendors",
        description: "There was a problem fetching the vendor data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('Finished loading vendors, loading state set to false');
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    console.log('useEffect triggered for loadVendors');
    loadVendors();
  }, [categoryFilter, statusFilter, searchQuery]);

  // Handle form submission for new/edit vendor
  const onSubmit = async (data: z.infer<typeof vendorFormSchema>) => {
    console.log('Form submitted with data:', JSON.stringify(data, null, 2));
    setIsSubmitting(true);
    try {
      setError(null);
      if (editingVendor) {
        // Update existing vendor
        const updated = await updateVendor(editingVendor.id, data as VendorUpdate);
        if (updated) {
          toast({
            title: "Success",
            description: `Successfully updated ${updated.name}`,
            variant: "default"
          });
          await loadVendors();
          setIsDialogOpen(false);
          setEditingVendor(null);
        }
      } else {
        // Create new vendor
        console.log('Creating new vendor with data:', data);
        const vendorData: VendorInsert = {
          name: data.name,
          category: data.category,
          city: data.city,
          price: data.price,
          description: data.description,
          contact_email: "contact@utsavai.com",
          contact_phone: "0000000000",
          rating: data.rating || 0,
          image_url: data.image_url || DEFAULT_VENDOR_IMAGE,
          status: data.status || VENDOR_STATUSES.PENDING,
          portfolio_images: data.portfolio_images || [],
          portfolio_description: data.portfolio_description || "",
          portfolio_events: data.portfolio_events || []
        };

        const newVendor = await createVendor(vendorData);
        if (newVendor) {
          console.log('Vendor created successfully:', newVendor);
          toast({
            title: "Success",
            description: `Successfully created vendor ${newVendor.name}`,
            variant: "default"
          });
          setIsDialogOpen(false);
          form.reset();
          await loadVendors();
        } else {
          throw new Error('Failed to create vendor - no response received');
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error creating/updating vendor",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle vendor deletion
  const handleDeleteVendor = async (id: number) => {
    try {
      const success = await deleteVendor(id);
      if (success) {
        toast({
          title: "Vendor removed",
          description: "Vendor has been successfully removed.",
        });
        await loadVendors();
      } else {
        throw new Error("Failed to delete vendor");
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error deleting vendor",
        description: "There was a problem removing the vendor.",
        variant: "destructive"
      });
    }
  };

  // Handle edit button click - load vendor data into form
  const handleEditVendor = (vendor: Vendor) => {
    console.log('Editing vendor:', vendor);
    setEditingVendor(vendor);
    
    // Reset form with vendor values - ensure all fields are properly set
    form.reset({
      name: vendor.name,
      category: vendor.category,
      city: vendor.city,
      price: vendor.price,
      rating: vendor.rating || 0,
      description: vendor.description,
      contact_email: "contact@utsavai.com",
      contact_phone: "0000000000",
      image_url: vendor.image_url || "",
      status: vendor.status,
      portfolio_images: vendor.portfolio_images || [],
      portfolio_description: vendor.portfolio_description || "",
      portfolio_events: vendor.portfolio_events || []
    });
    
    // Set dialog state after form reset
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 0);
  };

  // Handle new vendor button click
  const handleNewVendor = () => {
    setEditingVendor(null);
    form.reset({
      name: "",
      category: "",
      city: "",
      price: 0,
      rating: 0,
      description: "",
      contact_email: "contact@utsavai.com",
      contact_phone: "0000000000",
      image_url: "",
      status: VENDOR_STATUSES.PENDING
    });
    setIsDialogOpen(true);
  };

  // Helper for status class
  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case VENDOR_STATUSES.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case VENDOR_STATUSES.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case VENDOR_STATUSES.INACTIVE:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // New helper function to render the vendor form
  const renderVendorForm = () => {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Royal Caterers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {VENDOR_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Mumbai" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="25000" 
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Base price for services</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={VENDOR_STATUSES.ACTIVE}>Active</SelectItem>
                      <SelectItem value={VENDOR_STATUSES.PENDING}>Pending</SelectItem>
                      <SelectItem value={VENDOR_STATUSES.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0-5)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="4.5" 
                      step={0.1}
                      min={0}
                      max={5}
                      {...field}
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>Optional vendor image</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide detailed information about vendor services..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="portfolio_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your past work and experience..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Highlight your best work and experience</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="portfolio_images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio Images</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...field.value];
                              newUrls[index] = e.target.value;
                              field.onChange(newUrls);
                            }}
                            placeholder="https://example.com/image.jpg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newUrls = field.value.filter((_, i) => i !== index);
                              field.onChange(newUrls);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          field.onChange([...field.value, ""]);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Image URL
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>Add URLs of your portfolio images</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="portfolio_events"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Past Events</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((event, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={event}
                            onChange={(e) => {
                              const newEvents = [...field.value];
                              newEvents[index] = e.target.value;
                              field.onChange(newEvents);
                            }}
                            placeholder="Event name or description"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newEvents = field.value.filter((_, i) => i !== index);
                              field.onChange(newEvents);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          field.onChange([...field.value, ""]);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Past Event
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>List your notable past events</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingVendor ? "Update Vendor" : "Create Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <SupabaseConnectionTest />
        <Button 
          onClick={loadVendors}
          disabled={loading}
          className="ml-4"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Refresh Vendors
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>Manage event vendors and their details.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search vendors..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Category filter */}
            <div className="w-full md:w-48">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {VENDOR_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status filter */}
            <div className="w-full md:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={VENDOR_STATUSES.ACTIVE}>Active</SelectItem>
                  <SelectItem value={VENDOR_STATUSES.PENDING}>Pending</SelectItem>
                  <SelectItem value={VENDOR_STATUSES.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Add new vendor button */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setEditingVendor(null);
                form.reset({
                  name: "",
                  category: "",
                  city: "",
                  price: 0,
                  rating: 0,
                  description: "",
                  contact_email: "contact@utsavai.com",
                  contact_phone: "0000000000",
                  image_url: "",
                  status: VENDOR_STATUSES.PENDING,
                  portfolio_images: [],
                  portfolio_description: "",
                  portfolio_events: []
                });
              }
              setIsDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingVendor(null);
                  setIsDialogOpen(true);
                }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new vendor below.
                  </DialogDescription>
                </DialogHeader>
                {renderVendorForm()}
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Vendor table */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading vendors...</span>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No vendors found.</p>
              {error ? (
                <p className="text-sm mt-2">Try checking your database connection or refreshing the page.</p>
              ) : (
                <p className="text-sm mt-2">Try adjusting your filters or add a new vendor.</p>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.category}</TableCell>
                      <TableCell>{vendor.city}</TableCell>
                      <TableCell>₹{vendor.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span>{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(vendor.portfolio_images?.length > 0 || 
                            vendor.portfolio_events?.length > 0 || 
                            vendor.portfolio_description) && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setPreviewVendor(vendor)}
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                          )}
                          <Dialog open={isDialogOpen && editingVendor?.id === vendor.id} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setEditingVendor(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleEditVendor(vendor)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
                              <DialogHeader>
                                <DialogTitle>Edit Vendor</DialogTitle>
                                <DialogDescription>
                                  Update the vendor information below.
                                </DialogDescription>
                              </DialogHeader>
                              {renderVendorForm()}
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {vendor.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {previewVendor && (
        <PortfolioPreviewDialog
          vendor={previewVendor}
          open={!!previewVendor}
          onOpenChange={(open) => !open && setPreviewVendor(null)}
        />
      )}
    </div>
  );
};

export default VendorsPage; 