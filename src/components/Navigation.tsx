
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Laptop, Crosshair, LogOut, GitCompare, Sparkles, FileText, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main navigation bar with logo, site name, links, and logout */}
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 w-full">
            {/* Logo & Site Name */}
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="flex items-center relative">
                <Laptop className="w-6 h-6 text-gaming-600" />
                <Crosshair className="w-10 h-10 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-crosshair-pulse" />
              </div>
              <span className="text-xl font-bold text-gaming-800">Laptop Hunter</span>
            </Link>
            {/* Navigation Links */}
            <div className="flex items-center space-x-6 ml-8 flex-1">
              <Link
                to="/"
                className={`nav-link flex items-center space-x-1 whitespace-nowrap ${isActive('/') && !isActive('/blog') && !isActive('/compare') && !isActive('/recommend') && !isActive('/about') ? 'text-primary font-medium' : ''}`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptops</span>
              </Link>
              <Link
                to="/compare"
                className={`nav-link flex items-center space-x-1 whitespace-nowrap ${isActive('/compare') ? 'text-primary font-medium' : ''}`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </Link>
              <Link
                to="/recommend"
                className={`nav-link flex items-center space-x-1 whitespace-nowrap ${isActive('/recommend') ? 'text-primary font-medium' : ''}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Personal Laptop Finder</span>
              </Link>
              <Separator orientation="vertical" className="h-10 mx-2" />
              <Link
                to="/blog"
                className={`nav-link flex items-center space-x-1 whitespace-nowrap ${isActive('/blog') ? 'text-primary font-medium' : ''}`}
              >
                <FileText className="w-4 h-4" />
                <span>Blog</span>
              </Link>
              <Link
                to="/about"
                className={`nav-link flex items-center space-x-1 whitespace-nowrap ${isActive('/about') ? 'text-primary font-medium' : ''}`}
              >
                <User className="w-4 h-4" />
                <span>About</span>
              </Link>
            </div>
          </div>
          {/* Logout */}
          <div className="flex items-center space-x-4 shrink-0">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="nav-link flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
