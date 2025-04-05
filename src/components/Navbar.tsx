
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Brain, LogOut, User } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    // Could add a toast notification here
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-display font-semibold text-primary"
        >
          <Brain className="w-6 h-6" />
          <span className="animate-fade-in">Locnix.ai</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem to="/" label="Home" currentPath={location.pathname} />
          {isAuthenticated && (
            <NavItem to="/dashboard" label="Dashboard" currentPath={location.pathname} />
          )}
          
          {isAuthenticated ? (
            <div className="ml-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <User className="w-4 h-4 mr-2" />
                    {user?.name || user?.email || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/dashboard" className="flex w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile" className="flex w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="ml-4 flex items-center space-x-2">
              <Link to="/signin">
                <Button variant="outline" size="sm" className="rounded-full px-4">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-full px-4 shadow-md hover:shadow-lg transition-all">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg animate-slide-down">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            <MobileNavItem to="/" label="Home" currentPath={location.pathname} />
            {isAuthenticated && (
              <MobileNavItem to="/dashboard" label="Dashboard" currentPath={location.pathname} />
            )}
            
            {isAuthenticated ? (
              <>
                <MobileNavItem to="/profile" label="Profile" currentPath={location.pathname} />
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg justify-center" 
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <MobileNavItem to="/signin" label="Sign In" currentPath={location.pathname} />
                <div className="pt-2">
                  <Link to="/signup" className="w-full block">
                    <Button className="w-full rounded-lg justify-center">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ to, label, currentPath }: { to: string; label: string; currentPath: string }) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200",
        isActive 
          ? "text-primary bg-primary/10" 
          : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
      )}
    >
      {label}
    </Link>
  );
};

const MobileNavItem = ({ to, label, currentPath }: { to: string; label: string; currentPath: string }) => {
  const isActive = currentPath === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "px-4 py-3 rounded-lg text-base font-medium transition-all",
        isActive 
          ? "text-primary bg-primary/10" 
          : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary"
      )}
    >
      {label}
    </Link>
  );
};

export default Navbar;
