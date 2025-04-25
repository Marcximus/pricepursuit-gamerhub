
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Laptop, Crosshair, LogOut, GitCompare, Sparkles, FileText, User, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const Navigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main navigation bar with logo, site name, links, and logout */}
          <div className="h-16 flex items-center justify-between">
            {/* Left aligned: Logo & Site Name */}
            <div className="flex items-center space-x-2 shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex items-center relative">
                  <Laptop className="w-6 h-6 text-gaming-600" />
                  <Crosshair className="w-10 h-10 text-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 animate-crosshair-pulse" />
                </div>
                <span className="text-xl font-bold text-gaming-800">Laptop Hunter</span>
              </Link>
            </div>

            {/* Center aligned: Navigation Links (hidden on mobile) */}
            {!isMobile && (
              <div className="flex flex-1 justify-center items-center space-x-8 min-w-0">
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
                <Separator orientation="vertical" className="h-8 mx-2" />
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
            )}

            {/* Mobile menu button (only visible on mobile) */}
            {isMobile && (
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gaming-600"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}

            {/* Right aligned: Logout */}
            {!isMobile && user && (
              <div className="flex items-center space-x-4 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="nav-link flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {isMobile && (
        <div 
          id="mobile-menu"
          className={`fixed inset-0 z-40 bg-white transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
          style={{ top: '64px' }}
        >
          <div className="px-4 pt-4 pb-8 space-y-4 flex flex-col">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-md ${isActive('/') && !isActive('/blog') && !isActive('/compare') && !isActive('/recommend') && !isActive('/about') ? 'bg-gray-100 text-gaming-600' : ''}`}
            >
              <Laptop className="w-5 h-5 mr-3" />
              <span className="text-lg">Laptops</span>
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-md ${isActive('/compare') ? 'bg-gray-100 text-gaming-600' : ''}`}
            >
              <GitCompare className="w-5 h-5 mr-3" />
              <span className="text-lg">Compare</span>
            </Link>
            <Link
              to="/recommend"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-md ${isActive('/recommend') ? 'bg-gray-100 text-gaming-600' : ''}`}
            >
              <Sparkles className="w-5 h-5 mr-3" />
              <span className="text-lg">Personal Laptop Finder</span>
            </Link>
            <Separator />
            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-md ${isActive('/blog') ? 'bg-gray-100 text-gaming-600' : ''}`}
            >
              <FileText className="w-5 h-5 mr-3" />
              <span className="text-lg">Blog</span>
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center p-3 rounded-md ${isActive('/about') ? 'bg-gray-100 text-gaming-600' : ''}`}
            >
              <User className="w-5 h-5 mr-3" />
              <span className="text-lg">About</span>
            </Link>
            
            {user && (
              <>
                <Separator />
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center p-3 rounded-md"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="text-lg">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicked outside */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-30" 
          style={{ top: '64px' }}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navigation;
