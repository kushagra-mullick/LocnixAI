import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters"
  }),
  email: z.string().email({
    message: "Invalid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  }),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});
const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const {
    signup,
    loginWithOAuth,
    isAuthenticated,
    isLoading: authLoading
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, {
        replace: true
      });
    }
  }, [isAuthenticated, navigate, from]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms: false
    }
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signup(values.email, values.password, values.name);
      // Redirect will happen via the useEffect hook when isAuthenticated changes
    } catch (error) {
      // Error is already handled in the signup function
    } finally {
      setIsLoading(false);
    }
  };
  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    try {
      await loginWithOAuth(provider);
    } catch (error) {
      // Error is already handled in the loginWithOAuth function
    }
  };
  if (authLoading) {
    return <>
        <Navbar />
        <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
          <div className="animate-spin text-primary text-2xl">◌</div>
          <span className="ml-2">Loading...</span>
        </div>
      </>;
  }
  return <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create Your Account</h1>
              <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed">
                Join Locnix.ai and transform your learning experience
              </p>
            </div>
            
            <div className="w-full max-w-md space-y-6 mt-8">
              {/* Social login buttons */}
              <div className="space-y-3">
                
                
                
              </div>
              
              
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="email" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="password" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              <span className="sr-only">Toggle password visibility</span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="terms" render={({
                  field
                }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            I agree to the{" "}
                            <Link to="/terms" className="text-primary underline underline-offset-4 hover:text-primary/80">
                              terms of service
                            </Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-primary underline underline-offset-4 hover:text-primary/80">
                              privacy policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>} />
                  
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? <>
                        <span className="animate-spin mr-2">◌</span> Creating Account...
                      </> : <>
                        <UserPlus className="mr-2 h-4 w-4" /> Create Account
                      </>}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link to="/signin" className="text-primary underline underline-offset-4 hover:text-primary/80">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>;
};
export default SignUp;