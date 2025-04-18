import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Eye, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface VendorBooking {
  id: number;
  event_type: string;
  location: string;
  budget: number;
  created_at: string;
  status: string;
  special_requests?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  event_date?: string;
  vendor_count?: number;
  request_type?: string;
}

interface VendorDetail {
  id: number;
  event_request_id: number;
  vendor_id: number;
  vendor_name: string;
  vendor_category: string;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "pending", label: "Pending", className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "in_progress", label: "In Progress", className: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300" },
  { value: "confirmed", label: "Confirmed", className: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300" },
  { value: "cancelled", label: "Cancelled", className: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300" },
  { value: "completed", label: "Completed", className: "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300" },
];

const VendorBookingsPage = () => {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<VendorBooking | null>(null);
  const [vendorDetails, setVendorDetails] = useState<VendorDetail[]>([]);
  const [loadingVendorDetails, setLoadingVendorDetails] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching vendor bookings with status filter:', statusFilter);
      
      let query = supabase
        .from('event_requests')
        .select('*')
        .eq('request_type', 'booking')
        .order('created_at', { ascending: false });
        
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching vendor bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor bookings. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fetched vendor bookings:', data);
      setBookings(data || []);
      
    } catch (error) {
      console.error('Error fetching vendor bookings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading vendor bookings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async (bookingId: number) => {
    try {
      setLoadingVendorDetails(true);
      
      const { data, error } = await supabase
        .from('vendor_interests')
        .select('*')
        .eq('event_request_id', bookingId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor details:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor details. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fetched vendor details:', data);
      setVendorDetails(data || []);
      
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading vendor details.",
        variant: "destructive"
      });
    } finally {
      setLoadingVendorDetails(false);
    }
  };

  const handleViewDetails = async (booking: VendorBooking) => {
    setSelectedBooking(booking);
    await fetchVendorDetails(booking.id);
  };

  useEffect(() => {
    fetchBookings();
    const channel = supabase.channel('bookings_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'event_requests', filter: `request_type=eq.booking` }, (payload) => {
      console.log('Realtime update received:', payload);
      fetchBookings(); // Refresh the bookings when changes occur
    }).subscribe();
    return () => { channel.unsubscribe(); };
  }, [statusFilter]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      console.log('Updating status for booking:', id, 'to:', newStatus);
      
      const { error } = await supabase
        .from('event_requests')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update booking status. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update local state after successful database update
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );
      
      toast({
        title: "Success",
        description: "Booking status updated successfully.",
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating status.",
        variant: "destructive"
      });
    }
  };

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const searchString = searchQuery.toLowerCase();
    
    return (
      (booking.customer_name && booking.customer_name.toLowerCase().includes(searchString)) ||
      (booking.location && booking.location.toLowerCase().includes(searchString)) ||
      (booking.event_type && booking.event_type.toLowerCase().includes(searchString)) ||
      (booking.customer_phone && booking.customer_phone.includes(searchString)) ||
      (booking.id.toString().includes(searchString))
    );
  });

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'No date provided';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and process vendor booking requests from customers.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            View and manage all vendor booking requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search bookings..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">#{booking.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{booking.customer_name || 'N/A'}</span>
                          <span className="text-xs text-gray-500">{booking.customer_phone || 'No phone'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{booking.vendor_count || 0} vendor(s)</span>
                          <span className="text-xs text-gray-500">{booking.event_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleUpdateStatus(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {statusOptions.find(option => option.value === booking.status)?.label || booking.status}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {booking.event_date ? formatDate(booking.event_date) : 'Not specified'}
                      </TableCell>
                      <TableCell>
                        {formatDate(booking.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No bookings found matching your search criteria."
                : "No vendor bookings available."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking Details #{selectedBooking.id}</DialogTitle>
              <DialogDescription>
                {selectedBooking.event_type} booking from {selectedBooking.customer_name || 'Unknown'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Booking Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`${
                    statusOptions.find(opt => opt.value === selectedBooking.status)?.className
                  }`}>
                    {statusOptions.find(opt => opt.value === selectedBooking.status)?.label || selectedBooking.status}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Event Date</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{selectedBooking.event_date ? formatDate(selectedBooking.event_date) : 'Not specified'}</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-lg font-bold">₹{selectedBooking.budget.toLocaleString('en-IN')}</span>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5 text-gray-500">
                        <span className="font-semibold">Name:</span>
                      </div>
                      <div>{selectedBooking.customer_name || 'Not provided'}</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-500">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>{selectedBooking.customer_phone || 'No phone provided'}</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>{selectedBooking.customer_email || 'No email provided'}</div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5 text-gray-500">
                        <span className="font-semibold">Location:</span>
                      </div>
                      <div>{selectedBooking.location || 'Not specified'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Special Requests</h3>
                <Card className="h-[calc(100%-36px)]">
                  <CardContent className="p-4">
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedBooking.special_requests || 'No special requests provided'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Vendor Information</h3>
              {loadingVendorDetails ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : vendorDetails.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorDetails.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.vendor_name}</TableCell>
                          <TableCell>{vendor.vendor_category}</TableCell>
                          <TableCell>
                            <Badge className={`${
                              statusOptions.find(opt => opt.value === vendor.status)?.className
                            }`}>
                              {statusOptions.find(opt => opt.value === vendor.status)?.label || vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(vendor.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 border rounded-md">
                  No vendor details available for this booking.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Select
                value={selectedBooking.status}
                onValueChange={(value) => {
                  handleUpdateStatus(selectedBooking.id, value);
                  setSelectedBooking({...selectedBooking, status: value});
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue>
                    {statusOptions.find(option => option.value === selectedBooking.status)?.label || selectedBooking.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VendorBookingsPage; 