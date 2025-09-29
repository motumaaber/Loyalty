import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Users, Star, X, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

type Campaign = {
  id: string;
  name: string;
  description: string;
  type: 'multiplier' | 'bonus' | 'special';
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
  participants: number;
  spent: number;
  budget?: number;
  rules: {
    pointsMultiplier?: number;
    bonusPoints?: number;
    minPurchase?: number;
  };
};

type CampaignsResponse = {
  campaigns: Campaign[];
};

const campaignFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["multiplier", "bonus", "special"]),
  startDate: z.date(),
  endDate: z.date(),
  rules: z.object({
    minPurchase: z.number().optional(),
    pointsMultiplier: z.number().min(1).optional(),
    bonusPoints: z.number().min(0).optional(),
  }),
  targetCustomers: z.array(z.string()).optional(),
  budget: z.number().min(0).optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

// Helper functions
const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Authentication required. Please log in again.');
  }
  return token;
};

export default function CampaignManagement() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch campaigns data
  const fetchCampaigns = async (): Promise<CampaignsResponse> => {
    const token = getAuthToken();
    const response = await fetch("/api/admin/campaigns", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }
    
    return response.json();
  };
  
  const { data: campaignsData, isLoading } = useQuery<CampaignsResponse>({
    queryKey: ["/api/admin/campaigns"],
    queryFn: fetchCampaigns,
  });
  
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      type: "multiplier",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      rules: {
        minPurchase: 0,
        pointsMultiplier: 1,
        bonusPoints: 0,
      },
      targetCustomers: [],
      budget: 0,
    },
  });
  
  // Watch form values to trigger validation
  const formValues = form.watch();


  const createCampaign = useMutation({
    mutationFn: async (campaignData: any) => {
      const token = getAuthToken();
      console.log('Sending campaign data:', campaignData);
      
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(campaignData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create campaign: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast.success("Campaign created successfully");
      setIsCreating(false);
      form.reset();
    },
    onError: (error: Error) => {
      console.error('Campaign creation error:', error);
      toast.error(error.message || "Failed to create campaign");
    }
  });

  const onSubmit = async (data: CampaignFormValues) => {
    console.log('Form submitted:', data);
    
    try {
      // Trigger form validation
      const isValid = await form.trigger();
      
      if (!isValid) {
        toast.error('Please fill in all required fields correctly');
        return;
      }
      
      // Prepare campaign data
      const campaignData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        rules: {
          minPurchase: Number(data.rules.minPurchase) || 0,
          pointsMultiplier: Number(data.rules.pointsMultiplier) || 1,
          bonusPoints: Number(data.rules.bonusPoints) || 0,
        },
        status: 'active',
      };
      
      console.log('Submitting campaign:', campaignData);
      
      // Proceed with campaign creation
      await createCampaign.mutateAsync(campaignData);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred. Please try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const campaigns = campaignsData?.campaigns || [];
  const activeCampaigns = campaigns.filter((c: Campaign) => c.status === "active");
  const scheduledCampaigns = campaigns.filter((c: Campaign) => c.status === "scheduled");

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="campaigns-title">
              Campaign Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage loyalty campaigns and promotions
            </p>
          </div>
          {!isCreating ? (
            <Button 
              data-testid="button-create-campaign"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="mr-2" size={16} />
              Create Campaign
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsCreating(false)}
            >
              <X className="mr-2" size={16} />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Creation Form */}
      {isCreating && (
        <Card className="mb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Create New Campaign</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsCreating(false);
                      form.reset();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Summer Sale 2023" 
                            {...field} 
                            data-testid="input-campaign-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a campaign type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="multiplier">Points Multiplier</SelectItem>
                            <SelectItem value="bonus">Bonus Points</SelectItem>
                            <SelectItem value="special">Special Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => 
                                date < (form.getValues("startDate") || new Date())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rules.pointsMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points Multiplier</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            step={0.1}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          How many points customers earn per dollar spent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum points to be issued (leave empty for unlimited)
                        </FormDescription>
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
                          placeholder="Describe your campaign..."
                          className="resize-none min-h-[100px]"
                          data-testid="input-campaign-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    form.reset();
                  }}
                  disabled={createCampaign.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCampaign.isPending || !form.formState.isValid}
                  data-testid="button-submit-campaign"
                  className="mt-4 w-full"
                >
                  {createCampaign.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {/* Active Campaigns */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCampaigns.length > 0 ? (
            activeCampaigns.map((campaign: Campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" data-testid={`campaign-name-${campaign.id}`}>
                      {campaign.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{campaign.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="text-foreground">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="text-foreground">{campaign.participants} customers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget Used:</span>
                      <span className="text-foreground">{campaign.spent}/{campaign.budget} points</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex space-x-3">
                      <Button variant="link" className="p-0 text-primary" data-testid={`button-view-${campaign.id}`}>
                        View Details
                      </Button>
                      <Button variant="link" className="p-0 text-primary">
                        Edit
                      </Button>
                      <Button variant="link" className="p-0 text-destructive">
                        End Campaign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-8 text-center">
                  <Skeleton className="w-16 h-16 rounded-lg mx-auto mb-4" />
                  <p className="text-muted-foreground">Summer Savings Boost</p>
                  <p className="text-sm text-muted-foreground">Double points on savings deposits over ETB 5,000</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Campaigns */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Scheduled Campaigns</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scheduledCampaigns.length > 0 ? (
            scheduledCampaigns.map((campaign: Campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                      Scheduled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{campaign.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="text-foreground">{new Date(campaign.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="text-foreground">{campaign.budget} points</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex space-x-3">
                      <Button variant="link" className="p-0 text-primary">
                        View Details
                      </Button>
                      <Button variant="link" className="p-0 text-primary">
                        Edit
                      </Button>
                      <Button variant="link" className="p-0 text-muted-foreground">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2">
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-accent text-2xl" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">New Year Welcome</h3>
                  <p className="text-muted-foreground text-sm mb-4">Bonus points for new customer registrations</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="text-foreground">January 1, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonus Amount:</span>
                      <span className="text-foreground">1,000 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="text-foreground">50,000 points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
