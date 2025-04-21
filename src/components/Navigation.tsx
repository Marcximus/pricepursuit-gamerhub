
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Laptop, Crosshair, Settings, LogOut, GitCompare, Sparkles, FileText, User } from "lucide-react";
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
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center relative">
              <Laptop className="w-6 h-6 text-gaming-600" />
              <Crosshair className="w-10 h-10 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-crosshair-pulse" />
            </div>
            <span className="text-xl font-bold text-gaming-800">Laptop Hunter</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className={`nav-link flex items-center space-x-1 ${isActive('/admin') ? 'text-primary font-medium' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
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
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center items-center py-3 overflow-x-auto hide-scrollbar" aria-label="Secondary navigation">
            <div className="flex items-center space-x-6">
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
              
              <div className="mx-2">
                <Separator orientation="vertical" className="h-10" />
              </div>
              
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
              
              <div className="mx-2">
                <Separator orientation="vertical" className="h-6" />
              </div>
              {/* Removed Desktops, Monitors, Keyboards, Mouse, Headsets as requested */}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

