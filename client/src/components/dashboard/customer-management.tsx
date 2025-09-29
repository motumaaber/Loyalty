import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Filter, Download, UserPlus, Eye } from "lucide-react";

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["/api/admin/customers"],
  });

  const { data: tiersData } = useQuery({
    queryKey: ["/api/admin/tiers"],
  });

  const customers = customersData?.customers || [];
  const tiers = tiersData?.tiers || [];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === "all" || customer.tier === filterTier;
    const matchesStatus = filterStatus === "all" || customer.status.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="customers-title">
              Customer Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage customer accounts and loyalty program participation
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" data-testid="button-export-customers">
              <Download className="mr-2" size={16} />
              Export
            </Button>
            <Button 
              data-testid="button-add-customer"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus className="mr-2" size={16} />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-customers">
                  {customers.length.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {customers.filter(c => c.status === "Active").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <span className="text-secondary font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Points</p>
                <p className="text-2xl font-bold text-foreground">
                  {customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.points, 0) / customers.length).toLocaleString() : '0'}
                </p>
              </div>
              <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-accent font-bold">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Gold+ Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {customers.filter(c => c.tier === "Gold" || c.tier === "Platinum").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">👑</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-customers"
                />
              </div>
            </div>
            
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-tier">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="mr-2" size={16} />
              More Filters
            </Button>
          </div>

          {/* Customer Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground" data-testid={`customer-name-${customer.id}`}>
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(customer.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-foreground">{customer.email}</p>
                        <p className="text-muted-foreground">{customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`${
                          customer.tier === "Platinum" ? "border-purple-200 text-purple-700" :
                          customer.tier === "Gold" ? "border-yellow-200 text-yellow-700" :
                          "border-gray-200 text-gray-700"
                        }`}
                        data-testid={`customer-tier-${customer.id}`}
                      >
                        {customer.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground" data-testid={`customer-points-${customer.id}`}>
                        {customer.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(customer.lastActivity).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-view-${customer.id}`}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="mr-1" size={14} />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No customers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterTier !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No customers have been registered yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]" data-testid="form-add-customer">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                placeholder="Enter customer name"
                className="col-span-3"
                data-testid="input-customer-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="col-span-3"
                data-testid="input-customer-email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right">
                Phone
              </label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                className="col-span-3"
                data-testid="input-customer-phone"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} data-testid="button-cancel-add">
              Cancel
            </Button>
            <Button data-testid="button-save-customer">
              Save Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Customer Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="customer-details">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold" data-testid="customer-detail-name">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-muted-foreground">
                    Member since {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="mb-3">{selectedCustomer.email}</p>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p>{selectedCustomer.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Loyalty Status</h4>
                  <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
                  <Badge className="mb-3" data-testid="customer-detail-tier">
                    {selectedCustomer.tier}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-1">Points Balance</p>
                  <p className="text-xl font-semibold" data-testid="customer-detail-points">
                    {selectedCustomer.points.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Account Status</h4>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge variant={selectedCustomer.status === "Active" ? "default" : "secondary"}>
                  {selectedCustomer.status}
                </Badge>
                <p className="text-sm text-muted-foreground mb-1 mt-3">Last Activity</p>
                <p>{new Date(selectedCustomer.lastActivity).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => setIsViewModalOpen(false)} data-testid="button-close-details">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
