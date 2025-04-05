
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { User, Edit, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/signin');
    }
    
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
          <div className="animate-spin text-primary text-2xl">◌</div>
          <span className="ml-2">Loading...</span>
        </div>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Your Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Manage your account information and preferences
            </p>
            
            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Account Information</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" alt={name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium">{name || email}</h3>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        disabled
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-6 flex justify-end">
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          if (user) {
                            setName(user.name || '');
                          }
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="animate-spin mr-2">◌</span> Saving...
                          </>
                        ) : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Manage your connected authentication providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-full">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email & Password</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Connected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
