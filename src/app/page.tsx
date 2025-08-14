'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Play, Users, Wallet, Gift } from 'lucide-react';

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to dashboard or show success
        window.location.href = '/dashboard';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Registration successful! Please login.');
        // Switch to login tab
        document.querySelector('[value="login"]')?.click();
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative w-10 h-10">
                <img
                  src="/logo.svg"
                  alt="VideoTask Rewards"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">VideoTask Rewards</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-gray-900">How it Works</a>
              <a href="#plans" className="text-gray-700 hover:text-gray-900">Plans</a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Earn Rewards by Watching Videos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of users earning daily rewards by watching short videos. 
            Simple, fun, and rewarding!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Play className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Watch & Earn</CardTitle>
                <CardDescription>
                  Watch 10 short videos daily and earn rewards for each video completed
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Refer Friends</CardTitle>
                <CardDescription>
                  Earn bonus rewards when your friends join using your referral code
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <Wallet className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <CardTitle>Weekly Payouts</CardTitle>
                <CardDescription>
                  Withdraw your earnings weekly through multiple payment methods
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Choose Plan</h3>
              <p className="text-gray-600">Select a subscription plan that suits you</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Watch Videos</h3>
              <p className="text-gray-600">Complete your daily video tasks</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Get Paid</h3>
              <p className="text-gray-600">Withdraw your earnings weekly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to VideoTask Rewards</CardTitle>
              <CardDescription>
                Join now and start earning by watching videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={loginForm.rememberMe}
                        onChange={(e) => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                        className="rounded"
                      />
                      <Label htmlFor="rememberMe">Remember me</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      Login
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={registerForm.referralCode}
                        onChange={(e) => setRegisterForm({...registerForm, referralCode: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Register
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative w-8 h-8">
                  <img
                    src="/logo.svg"
                    alt="VideoTask Rewards"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="ml-2 text-lg font-bold">VideoTask Rewards</span>
              </div>
              <p className="text-gray-400">
                Earn rewards by watching videos. Simple, fun, and rewarding!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Facebook</a></li>
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 VideoTask Rewards. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}