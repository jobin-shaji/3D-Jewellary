import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/services/auth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Login = () => {
  const { toast } = useToast();
  const { login, googleLogin, user } = useAuth(); // Get user from context
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Google OAuth configuration
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const { isLoaded, initializeGoogleAuth } = useGoogleAuth({
    clientId,
    onSuccess: async (credential) => {
      setIsLoading(true);
      try {
        await googleLogin(credential);
        toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting to homepage...",
        });
        navigate("/");
      } catch (error: any) {
        console.error("Google login failed:", error);
        toast({
          title: "Google Login Failed",
          description: error.response?.data?.message || "Google login failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Auth Error:", error);
      toast({
        title: "Google Login Error",
        description: "Failed to initialize Google login. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && user.id) {
      console.log('User already logged in so not displaying login page redirecting to homepage...');
      navigate("/");
    }
  }, [user, navigate]);

  // Initialize Google Auth when component mounts and Google script is loaded
  useEffect(() => {
    if (isLoaded && clientId) {
      initializeGoogleAuth('google-login-button');
    }
  }, [isLoaded, clientId, initializeGoogleAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(' Login form submitted...');
      const response = await login(email, password);
      console.log(' Login response:', response);
      
      // Check if token was actually saved
      const savedToken = localStorage.getItem('token');
      console.log(' Token check after login:', savedToken ? 'SAVED' : 'NOT SAVED');
      
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to homepage...",
      });
      
      navigate("/");
      
    } catch (error: any) {
      console.error(' Login failed:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add loading fallback
  

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue shopping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Or</span>
              </div>
              <div className="mt-4 space-y-2">
                {/* Google OAuth Button */}
                <div id="google-login-button" className="w-full">
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
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

    </div>
  );
};

export default Login;
