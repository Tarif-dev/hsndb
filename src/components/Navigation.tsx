import React, { useState } from "react";
import {
  Menu,
  X,
  Search,
  BookOpen,
  ChevronDown,
  FileText,
  Newspaper,
  Quote,
  User,
  Mail,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navItems = [
    { label: "Browse", href: "/browse", icon: Search },
    { label: "BLAST", href: "/blast", icon: Zap },
    { label: "Blogs", href: "/blogs", icon: Newspaper },
  ];

  const dropdownMenus = {
    Research: {
      icon: BookOpen,
      items: [
        { label: "Citations", href: "/citations", icon: Quote },
        { label: "Documentation", href: "/docs", icon: FileText },
        { label: "Contribute", href: "/contribute", icon: FileText },
      ],
    },
    Support: {
      icon: HelpCircle,
      items: [
        { label: "About Us", href: "/about", icon: User },
        { label: "Contact Us", href: "/contact", icon: Mail },
      ],
    },
  };

  const handleDropdownToggle = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <a
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                HSNDB
              </a>
            </div>
          </div>{" "}
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Primary Navigation Items */}
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium hover:scale-105 transform"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            ))}

            {/* Dropdown Menus */}
            {Object.entries(dropdownMenus).map(([menuName, menu]) => (
              <div key={menuName} className="relative">
                <button
                  onClick={() => handleDropdownToggle(menuName)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 font-medium hover:scale-105 transform"
                >
                  <menu.icon className="h-4 w-4" />
                  <span>{menuName}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      activeDropdown === menuName ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Content */}
                {activeDropdown === menuName && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="py-2">
                      {menu.items.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm">{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>{" "}
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in">
            <div className="px-2 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200 shadow-lg rounded-b-lg">
              {/* Primary Items */}
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              ))}

              {/* Dropdown Items - Flattened for Mobile */}
              {Object.entries(dropdownMenus).map(([menuName, menu]) => (
                <div key={menuName} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {menuName}
                  </div>
                  {menu.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 ml-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for closing dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
};

export default Navigation;
