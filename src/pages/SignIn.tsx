import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle, FaDiscord } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signInWithProvider, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Get location state to handle redirects after login
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect to the originally requested page or dashboard
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // No need to navigate here, AuthContext will handle redirect
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  const submitSignUp = () => {
    navigate('/signup');
  };

  // Inside handleGoogleLogin and handleDiscordLogin, update to pass the redirect location
  const handleGoogleLogin = async () => {
    try {
      await signInWithProvider('google');
      // The redirect is handled by Supabase directly
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      await signInWithProvider('discord');
      // The redirect is handled by Supabase directly
    } catch (error) {
      console.error('Discord login error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In - Locnix.ai</title>
        <meta name="description" content="Sign in to Locnix.ai to access your personalized flashcards and learning tools." />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Welcome back!
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Sign in to continue learning.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="sign-in" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                      <TabsTrigger value="sign-up" onClick={submitSignUp}>Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sign-in" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          placeholder="Enter your email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          placeholder="Enter your password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <Button className="w-full" onClick={submitLogin} disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Or continue with
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="outline"
                      className="rounded-full p-2"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <FaGoogle className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full p-2"
                      onClick={handleDiscordLogin}
                      disabled={isLoading}
                    >
                      <FaDiscord className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <Link to="/forgot-password" className="hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
