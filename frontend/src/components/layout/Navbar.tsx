'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Bell, PenSquare, User, LogOut, BookMarked, BarChart2, Search, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isWriter = user?.role === 'writer' || user?.role === 'both';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BlogVerse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            {mounted && isAuthenticated && (
              <Link href="/feed" className="text-sm font-medium hover:text-primary transition-colors">
                Feed
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* FIXED: theme toggle - show Moon as default until mounted */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-muted transition-colors"
            >
              {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5" />}
            </button>

            {/* FIXED: wrap auth in mounted check */}
            {mounted && isAuthenticated ? (
              <>
                {isWriter && (
                  <Link href="/write" className="hidden md:flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Link>
                )}

                <Link href="/notifications" className="p-2 rounded-md hover:bg-muted transition-colors relative">
                  <Bell className="h-5 w-5" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 ring-primary transition-all"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-background border rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <Link href={`/profile/${user?._id}`} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                        <User className="h-4 w-4" /> Profile
                      </Link>
                      <Link href="/bookmarks" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                        <BookMarked className="h-4 w-4" /> Bookmarks
                      </Link>
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
                        <BarChart2 className="h-4 w-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted text-red-500 w-full">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : mounted && !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium px-3 py-2 hover:bg-muted rounded-md transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Get Started
                </Link>
              </div>
            ) : null}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 rounded-md hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4 flex flex-col gap-3">
            <Link href="/explore" className="px-2 py-1 text-sm font-medium" onClick={() => setMobileOpen(false)}>Explore</Link>
            {mounted && isAuthenticated && <Link href="/feed" className="px-2 py-1 text-sm font-medium" onClick={() => setMobileOpen(false)}>Feed</Link>}
            {mounted && isAuthenticated && isWriter && <Link href="/write" className="px-2 py-1 text-sm font-medium" onClick={() => setMobileOpen(false)}>Write</Link>}
          </div>
        )}
      </div>
    </nav>
  );
};