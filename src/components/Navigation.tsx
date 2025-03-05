
import { Link, useNavigate } from "react-router-dom";
import { Monitor, Laptop, Computer, Gamepad, Keyboard, Mouse, Headphones, Settings, LogOut, GitCompare, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Gamepad className="w-6 h-6 text-gaming-600" />
            <span className="text-xl font-bold text-gaming-800">PricePursuit</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/admin" className="nav-link flex items-center space-x-1">
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
          <div className="flex items-center py-3">
            <div className="flex items-center space-x-4">
              <Link to="/" className="nav-link flex items-center space-x-1">
                <Laptop className="w-4 h-4" />
                <span>Laptops</span>
              </Link>
              <Link to="/compare" className="nav-link flex items-center space-x-1">
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </Link>
              <Link to="/recommend" className="nav-link flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>Personal Laptop Finder</span>
              </Link>
              <Link to="/ComparePrice/Desktops" className="nav-link flex items-center space-x-1">
                <Computer className="w-4 h-4" />
                <span>Desktops</span>
              </Link>
              <Link to="/ComparePrice/Monitors" className="nav-link flex items-center space-x-1">
                <Monitor className="w-4 h-4" />
                <span>Monitors</span>
              </Link>
              <Link to="/ComparePrice/Keyboards" className="nav-link flex items-center space-x-1">
                <Keyboard className="w-4 w-4" />
                <span>Keyboards</span>
              </Link>
              <Link to="/ComparePrice/Mouse" className="nav-link flex items-center space-x-1">
                <Mouse className="w-4 h-4" />
                <span>Mouse</span>
              </Link>
              <Link to="/ComparePrice/Headsets" className="nav-link flex items-center space-x-1">
                <Headphones className="w-4 h-4" />
                <span>Headsets</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
