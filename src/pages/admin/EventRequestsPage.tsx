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
import { Search, Loader2, Eye, Phone, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface EventRequest {
  id: number;
  event_type: string;
  location: string;
  budget: number;
  created_at: string;
  status: string;
  special_requests?: string;
  user_id?: string;
  customer_name?: string;
  customer_phone?: string;
  vendor_count?: number;
  request_type?: string;
}

interface VendorInterest {
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
  { value: "completed", label: "Completed", className: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300" },
  { value: "cancelled", label: "Cancelled", className: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300" },
];

const EventRequestsPage = () => {
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [vendorInterests, setVendorInterests] = useState<VendorInterest[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const { toast } = useToast();

  const fetchEventRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching event requests with status filter:', statusFilter);
      
      let query = supabase
        .from('event_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching event requests:', error);
        toast({
          title: "Error",
          description: "Failed to load event requests. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fetched event requests:', data);
      setEventRequests(data || []);
      
    } catch (error) {
      console.error('Error fetching event requests:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading event requests.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorInterests = async (requestId: number) => {
    try {
      setLoadingVendors(true);
      
      const { data, error } = await supabase
        .from('vendor_interests')
        .select('*')
        .eq('event_request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor interests:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor details. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Fetched vendor interests:', data);
      setVendorInterests(data || []);
      
    } catch (error) {
      console.error('Error fetching vendor interests:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading vendor details.",
        variant: "destructive"
      });
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleViewVendors = async (request: EventRequest) => {
    setSelectedRequest(request);
    await fetchVendorInterests(request.id);
  };

  useEffect(() => {
    fetchEventRequests();
    const channel = supabase.channel('event_requests_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'event_requests' }, (payload) => {
      console.log('Realtime update received:', payload);
      if (payload.eventType === 'INSERT') {
        setEventRequests(prev => [payload.new as EventRequest, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setEventRequests(prev => prev.map(request => request.id === payload.new.id ? { ...request, ...payload.new } : request));
      } else if (payload.eventType === 'DELETE') {
        setEventRequests(prev => prev.filter(request => request.id !== payload.old.id));
      }
    }).subscribe();
    return () => { channel.unsubscribe(); };
  }, [statusFilter]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      console.log('Updating status for request:', id, 'to:', newStatus);
      
      const { error } = await supabase
        .from('event_requests')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update request status. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update local state after successful database update
      setEventRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: newStatus } : request
        )
      );
      
      toast({
        title: "Success",
        description: "Event request status updated successfully.",
      });
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the status.",
        variant: "destructive"
      });
    }
  };

  // Filter event requests by search query
  const filteredRequests = eventRequests.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      request.event_type.toLowerCase().includes(searchLower) ||
      request.location.toLowerCase().includes(searchLower) ||
      request.budget.toString().includes(searchLower) ||
      (request.special_requests || "").toLowerCase().includes(searchLower) ||
      (request.customer_name || "").toLowerCase().includes(searchLower) ||
      (request.customer_phone || "").toLowerCase().includes(searchLower) ||
      (request.request_type || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Requests</h1>
        <p className="text-muted-foreground">
          Manage and monitor all event requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Requests</CardTitle>
          <CardDescription>
            View and manage all event requests submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative w-full sm:w-1/2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by event type, location, budget or customer..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-1/4">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No event requests found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        {request.customer_name ? (
                          <div>
                            <div className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span>{request.customer_name}</span>
                            </div>
                            {request.customer_phone && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{request.customer_phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No data</span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{request.event_type}</TableCell>
                      <TableCell>{request.location}</TableCell>
                      <TableCell>₹{request.budget.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        {request.request_type === 'consultation' ? (
                          <Badge variant="secondary" className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                            Consultation
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100">
                            Vendor Interest
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.status || "pending"}
                          onValueChange={(value) => handleUpdateStatus(request.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                                className={status.className}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleViewVendors(request)}
                          disabled={!request.vendor_count || request.vendor_count === 0}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>
                            {request.vendor_count || 0} Vendors
                          </span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vendor Interests</DialogTitle>
            <DialogDescription>
              Event Request #{selectedRequest?.id} - {selectedRequest?.customer_name}
              {selectedRequest?.request_type === 'consultation' && (
                <Badge variant="outline" className="ml-2 bg-violet-100 text-violet-800">
                  Consultation Request
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {loadingVendors ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vendorInterests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vendor interest data found
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorInterests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell className="font-medium">{interest.vendor_name}</TableCell>
                      <TableCell>{interest.vendor_category}</TableCell>
                      <TableCell>
                        <Badge variant={interest.status === 'pending' ? 'outline' : 'default'}>
                          {interest.status === 'pending' ? 'Pending' : 
                           interest.status === 'contacted' ? 'Contacted' :
                           interest.status === 'confirmed' ? 'Confirmed' : 'Rejected'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventRequestsPage; 