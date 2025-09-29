import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Code, Play, Book, Settings, CheckCircle, AlertTriangle } from "lucide-react";

export default function ApiManagement() {
  const { toast } = useToast();
  const [selectedEndpoint, setSelectedEndpoint] = useState("/api/earnPoints");
  const [testPayload, setTestPayload] = useState('{\n  "customerId": "customer-id",\n  "category": "banking",\n  "serviceType": "transfer",\n  "amount": 1000\n}');

  const apiEndpoints = [
    {
      method: "POST",
      path: "/api/earnPoints",
      description: "Award points to a customer",
      parameters: ["customerId", "category", "serviceType", "amount", "metadata"],
      status: "active"
    },
    {
      method: "POST", 
      path: "/api/redeemPoints",
      description: "Redeem customer points for rewards",
      parameters: ["customerId", "rewardId"],
      status: "active"
    },
    {
      method: "GET",
      path: "/api/checkBalance/:customerId",
      description: "Get customer points balance and tier",
      parameters: ["customerId"],
      status: "active"
    },
    {
      method: "GET",
      path: "/api/getHistory/:customerId",
      description: "Get customer transaction history",
      parameters: ["customerId", "limit"],
      status: "active"
    }
  ];

  const webhookEvents = [
    {
      event: "points.earned",
      description: "Triggered when points are awarded to a customer",
      status: "active"
    },
    {
      event: "points.redeemed", 
      description: "Triggered when points are redeemed",
      status: "active"
    },
    {
      event: "tier.upgraded",
      description: "Triggered when customer tier is upgraded",
      status: "active"
    },
    {
      event: "campaign.completed",
      description: "Triggered when a campaign ends",
      status: "inactive"
    }
  ];

  const handleCopyApiKey = () => {
    const mockApiKey = "cbo_live_sk_123456789abcdef";
    navigator.clipboard.writeText(mockApiKey);
    toast({
      title: "API Key copied",
      description: "The API key has been copied to your clipboard",
    });
  };

  const handleTestEndpoint = () => {
    try {
      JSON.parse(testPayload);
      toast({
        title: "Test successful",
        description: "The API endpoint responded successfully",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your request payload",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="api-title">
              API Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage API access, documentation, and integration settings
            </p>
          </div>
          <Button data-testid="button-generate-key">
            <Key className="mr-2" size={16} />
            Generate New Key
          </Button>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints" data-testid="tab-endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="keys" data-testid="tab-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="docs" data-testid="tab-docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Endpoints List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="mr-2" size={20} />
                  Available Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, index) => (
                    <div 
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedEndpoint === endpoint.path ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint.path)}
                      data-testid={`endpoint-${endpoint.path.replace('/', '').replace(':', '')}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <Badge variant={endpoint.status === "active" ? "default" : "secondary"}>
                          {endpoint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* API Tester */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="mr-2" size={20} />
                  API Tester
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="endpoint-select">Endpoint</Label>
                  <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                    <SelectTrigger data-testid="select-test-endpoint">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {apiEndpoints.map((endpoint) => (
                        <SelectItem key={endpoint.path} value={endpoint.path}>
                          {endpoint.method} {endpoint.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="api-key"
                      type="password" 
                      value="cbo_live_sk_************************"
                      readOnly
                      data-testid="input-api-key"
                    />
                    <Button variant="outline" onClick={handleCopyApiKey} data-testid="button-copy-key">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="test-payload">Request Payload</Label>
                  <Textarea
                    id="test-payload"
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                    data-testid="textarea-test-payload"
                  />
                </div>

                <Button onClick={handleTestEndpoint} className="w-full" data-testid="button-test-endpoint">
                  <Play className="mr-2" size={16} />
                  Test Endpoint
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2" size={20} />
                API Keys Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">Production Key</h4>
                      <p className="text-sm text-muted-foreground">Created Jan 15, 2024</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        <CheckCircle className="mr-1" size={12} />
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                  <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="production-key">
                    cbo_live_sk_************************
                  </code>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">Test Key</h4>
                      <p className="text-sm text-muted-foreground">Created Jan 15, 2024</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <AlertTriangle className="mr-1" size={12} />
                        Test
                      </Badge>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                  <code className="text-sm bg-muted px-2 py-1 rounded" data-testid="test-key">
                    cbo_test_sk_************************
                  </code>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Security Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Never expose API keys in client-side code</li>
                  <li>• Regenerate keys regularly</li>
                  <li>• Use test keys for development and staging</li>
                  <li>• Monitor API key usage in the dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2" size={20} />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input 
                    id="webhook-url"
                    placeholder="https://your-app.com/webhooks/cbo-loyalty"
                    data-testid="input-webhook-url"
                  />
                </div>

                <div>
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <Input 
                    id="webhook-secret"
                    type="password"
                    placeholder="webhook_secret_key"
                    data-testid="input-webhook-secret"
                  />
                </div>

                <div>
                  <Label>Event Subscriptions</Label>
                  <div className="space-y-3 mt-2">
                    {webhookEvents.map((webhook, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-foreground" data-testid={`webhook-event-${index}`}>
                            {webhook.event}
                          </h4>
                          <p className="text-sm text-muted-foreground">{webhook.description}</p>
                        </div>
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                          {webhook.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full" data-testid="button-save-webhook">
                  Save Webhook Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2" size={20} />
                API Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Start Guide</h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">1. Authentication</h4>
                    <code className="block text-sm bg-muted p-2 rounded mb-3">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                    
                    <h4 className="font-medium mb-2">2. Earn Points Example</h4>
                    <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
{`curl -X POST https://api.cbo-loyalty.com/api/earnPoints \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "customer_123",
    "category": "banking",
    "serviceType": "transfer",
    "amount": 1000
  }'`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Response Format</h3>
                  <div className="bg-muted/20 rounded-lg p-4">
                    <pre className="text-sm text-muted-foreground">
{`{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn_123456",
      "customerId": "customer_123",
      "points": 250,
      "type": "earn",
      "status": "completed"
    },
    "pointsEarned": 250
  }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Error Handling</h3>
                  <div className="space-y-3">
                    <div className="bg-muted/20 rounded-lg p-3">
                      <h4 className="font-medium text-destructive">400 Bad Request</h4>
                      <p className="text-sm text-muted-foreground">Invalid request parameters</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <h4 className="font-medium text-destructive">401 Unauthorized</h4>
                      <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <h4 className="font-medium text-destructive">404 Not Found</h4>
                      <p className="text-sm text-muted-foreground">Customer or resource not found</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-download-docs">
                  <Book className="mr-2" size={16} />
                  Download Full Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
