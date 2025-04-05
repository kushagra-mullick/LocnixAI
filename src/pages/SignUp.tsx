
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle, FaDiscord } from 'react-icons/fa'; // Corrected import
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Helmet } from 'react-helmet';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup, signInWithProvider, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Get location state to handle redirects after signup
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  useEffect(() => {
    // If already authenticated, redirect to the originally requested page or dashboard
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const submitSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await signup(email, password, name);
      // After successful signup, the AuthContext should handle the redirection
    } catch (error) {
      console.error('Signup failed', error);
      // Handle signup error (e.g., display error message)
    }
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
        <title>Sign Up - Locnix.ai</title>
        <meta name="description" content="Sign up to Locnix.ai and start creating AI-powered flashcards for faster learning and better retention." />
      </Helmet>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Join our community and start learning!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="mt-6">
                <form onSubmit={submitSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="social" className="mt-6">
                <div className="space-y-4">
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <FaGoogle className="text-lg" />
                    Sign Up with Google
                  </Button>
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-purple-700"
                    onClick={handleDiscordLogin}
                    disabled={isLoading}
                  >
                    <FaDiscord className="text-lg" />
                    Sign Up with Discord
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="px-8 py-4 text-center text-gray-700 dark:text-gray-300">
            Already have an account? <Link to="/signin" className="text-primary hover:underline">Sign In</Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default SignUp;
