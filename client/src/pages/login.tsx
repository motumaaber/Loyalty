import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { University, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      toast({
        title: "Login successful",
        description: "Welcome to CBO Loyalty System",
      });
      setLocation("/admin");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-border">
          <CardHeader className="p-8 border-b border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <University className="text-primary-foreground text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="app-title">
                {t("app.name")}
              </h1>
              <p className="text-muted-foreground" data-testid="app-subtitle">
                {t("app.subtitle")}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                  {t("login.email")}
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your credentials"
                  className="w-full"
                  data-testid="input-username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  {t("login.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full pr-10"
                    data-testid="input-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: !!checked }))
                    }
                    data-testid="checkbox-remember"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                    {t("login.remember")}
                  </Label>
                </div>
                <button 
                  type="button"
                  className="text-sm text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  {t("login.forgot")}
                </button>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Signing in..." : t("login.submit")}
              </Button>
            </form>
          </CardContent>

          <div className="p-6 border-t border-border">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setLanguage("en")}
                className={`text-sm hover:underline ${language === "en" ? "text-primary" : "text-muted-foreground"}`}
                data-testid="button-lang-en"
              >
                English
              </button>
              <button
                onClick={() => setLanguage("om")}
                className={`text-sm hover:underline ${language === "om" ? "text-primary" : "text-muted-foreground"}`}
                data-testid="button-lang-om"
              >
                Afaan Oromo
              </button>
              <button
                onClick={() => setLanguage("am")}
                className={`text-sm hover:underline ${language === "am" ? "text-primary" : "text-muted-foreground"}`}
                data-testid="button-lang-am"
              >
                አማርኛ
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
