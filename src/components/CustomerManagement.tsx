import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/useToast';
import { hasActiveSubscription, TEST_CUSTOMER, type CustomerData, type SubscriptionType } from '@/lib/customerSchema';
import { Users, Crown, Mail, Calendar, Plus, Edit, Search, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function CustomerManagement() {
  const { data: customers = [], isLoading } = useCustomers();
  const { mutateAsync: createCustomer } = useCreateCustomer();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  
  // Form state
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formSubscription, setFormSubscription] = useState<SubscriptionType>('none');
  const [formNotes, setFormNotes] = useState('');

  const filteredCustomers = customers.filter(customer => 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubscribers = customers.filter(hasActiveSubscription).length;

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCustomer({
        email: formEmail,
        name: formName,
        subscriptionType: formSubscription,
        createdAt: Date.now() / 1000,
        notes: formNotes || undefined,
      });

      toast({
        title: 'Customer added',
        description: `${formName} has been added successfully`,
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to add customer',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      await createCustomer({
        email: formEmail,
        name: formName,
        subscriptionType: formSubscription,
        createdAt: selectedCustomer.createdAt,
        lastPurchaseAt: selectedCustomer.lastPurchaseAt,
        totalPurchases: selectedCustomer.totalPurchases,
        notes: formNotes || undefined,
      });

      toast({
        title: 'Customer updated',
        description: `${formName} has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Failed to update customer',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTestAccount = async () => {
    try {
      await createCustomer({
        ...TEST_CUSTOMER,
        email: TEST_CUSTOMER.email,
        name: TEST_CUSTOMER.name,
        subscriptionType: TEST_CUSTOMER.subscriptionType,
        createdAt: TEST_CUSTOMER.createdAt,
        notes: TEST_CUSTOMER.notes,
      });

      toast({
        title: 'Test account created',
        description: 'Admin Non-Nostr test account created with unlimited access',
      });
    } catch (error) {
      toast({
        title: 'Failed to create test account',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setFormEmail(customer.email);
    setFormName(customer.name);
    setFormSubscription(customer.subscriptionType);
    setFormNotes(customer.notes || '');
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormEmail('');
    setFormName('');
    setFormSubscription('none');
    setFormNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeSubscribers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Test Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {customers.filter(c => c.subscriptionType === 'test').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Customer Management
              </CardTitle>
              <CardDescription>
                Manage non-Nostr customers and subscriptions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Create a customer account manually
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCustomer} className="space-y-4">
                    <div>
                      <Label htmlFor="add-email">Email</Label>
                      <Input
                        id="add-email"
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="customer@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-name">Name</Label>
                      <Input
                        id="add-name"
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Customer Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-subscription">Subscription Type</Label>
                      <Select value={formSubscription} onValueChange={(v) => setFormSubscription(v as SubscriptionType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="unlimited">Unlimited</SelectItem>
                          <SelectItem value="test">Test (Free)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="add-notes">Notes (optional)</Label>
                      <Textarea
                        id="add-notes"
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="Internal notes..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">Add Customer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={handleCreateTestAccount}>
                <Crown className="w-4 h-4 mr-2" />
                Create Test Account
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search customers by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const isActive = hasActiveSubscription(customer);
                    
                    return (
                      <TableRow key={customer.email}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {customer.subscriptionType === 'test' ? (
                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                                <Crown className="w-3 h-3 mr-1" />
                                Test
                              </Badge>
                            ) : customer.subscriptionType === 'unlimited' ? (
                              <Badge variant="default" className="bg-green-600">
                                <Crown className="w-3 h-3 mr-1" />
                                Unlimited
                              </Badge>
                            ) : (
                              <Badge variant="secondary">None</Badge>
                            )}
                            {isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {formatDistanceToNow(new Date(customer.createdAt * 1000), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{customer.totalPurchases || 0}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and subscription
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCustomer} className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-subscription">Subscription Type</Label>
              <Select value={formSubscription} onValueChange={(v) => setFormSubscription(v as SubscriptionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="test">Test (Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
            {selectedCustomer && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs space-y-1">
                <div>Created: {new Date(selectedCustomer.createdAt * 1000).toLocaleString()}</div>
                {selectedCustomer.lastPurchaseAt && (
                  <div>Last Purchase: {new Date(selectedCustomer.lastPurchaseAt * 1000).toLocaleString()}</div>
                )}
                <div>Total Purchases: {selectedCustomer.totalPurchases || 0}</div>
              </div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
