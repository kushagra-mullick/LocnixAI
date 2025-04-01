import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Github, Twitter, Brain } from 'lucide-react';
import { useTheme } from "@/components/theme-provider"

const Navbar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-200 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-2xl">Locnix.ai</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1 ml-10">
              <Link
                to="/dashboard"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/study"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === "/study"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Study
              </Link>
              <Link
                to="/ai-chat"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                  pathname === "/ai-chat"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Brain className="w-4 h-4" />
                AI Chat
              </Link>
              <a
                href="https://github.com/username/repo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-0">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/study')}>Study</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ai-chat')}>AI Chat</DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="https://twitter.com/locnix_ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 mr-2" />
                      Follow us on Twitter
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/signin" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12A.75.75 0 013.75 11.25h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/dashboard"
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={closeMobileMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/study"
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/study"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={closeMobileMenu}
            >
              Study
            </Link>
             <Link
                to="/ai-chat"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                  pathname === "/ai-chat"
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={closeMobileMenu}
              >
                <Brain className="w-4 h-4" />
                AI Chat
              </Link>
            <a
              href="https://github.com/username/repo"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
              onClick={closeMobileMenu}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
            {!isAuthenticated ? (
              <>
                <Link to="/signin" className="block px-4 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" onClick={closeMobileMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className="block px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </>
            ) : (
              <Button variant="outline" className="w-full" onClick={handleSignOut}>Logout</Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
