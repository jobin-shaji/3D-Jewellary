import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/services/auth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, googleLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  // Google OAuth configuration
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const { isLoaded, initializeGoogleAuth } = useGoogleAuth({
    clientId,
    onSuccess: async (credential) => {
      try {
        await googleLogin(credential);
        toast({
          title: "Registration Successful!",
          description: "Welcome! You are now logged in.",
        });
        navigate("/");
      } catch (error: any) {
        console.error("Google registration failed:", error);
        toast({
          title: "Google Registration Failed",
          description: error.response?.data?.message || "Google registration failed. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Google Auth Error:", error);
      toast({
        title: "Google Registration Error",
        description: "Failed to initialize Google registration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Initialize Google Auth when component mounts and Google script is loaded
  useEffect(() => {
    if (isLoaded && clientId) {
      initializeGoogleAuth('google-register-button');
    }
  }, [isLoaded, clientId, initializeGoogleAuth]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    toast({
      title: "Password Mismatch",
      description: "Passwords do not match. Please try again.",
      variant: "destructive"
    });
    return;
  }

  try {
    await register({
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      password: formData.password,
    });

    navigate("/");
    toast({
      title: "Account Created Successfully!",
      description: "Welcome! You are now logged in.",
    });
  } catch (error: any) {
    console.error("Registration failed:", error);
    toast({
      title: "Registration Failed",
      description: error.response?.data?.message || "Registration failed. Please try again.",
      variant: "destructive"
    });
  }
};


  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join us and start your jewelry collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateFormData("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => updateFormData("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={!formData.agreeToTerms}>
                Create Account
              </Button>
            </form>
            
            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Or
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {/* Google OAuth Button */}
                <div id="google-register-button" className="w-full">
                  {/* Google button will be rendered here */}
                </div>

                {/* Fallback button if Google script doesn't load */}
                {!isLoaded && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={true}
                  >
                    Loading Google Sign-In...
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
