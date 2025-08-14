'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReferralDashboard from '@/components/referral-dashboard';
import { 
  Gift, 
  Users, 
  DollarSign, 
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const rewardTiers = [
    {
      title: 'Registration Bonus',
      amount: '$2.00',
      description: 'When your friend signs up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'First Video Bonus',
      amount: '$3.00',
      description: 'When they watch their first video',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Weekly Activity',
      amount: '$5.00',
      description: 'When they complete 7 videos',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'First Plan Purchase',
      amount: '$10.00',
      description: 'When they buy a subscription',
      icon: <Gift className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Monthly Milestone',
      amount: '$15.00',
      description: 'When they reach 30 days active',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-indigo-500'
    },
    {
      title: 'High Earner Bonus',
      amount: '$20.00',
      description: 'When they earn their first $50',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Referral Program
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Invite friends and earn up to <span className="text-yellow-400 font-bold">$55 per referral</span> through our multi-tier reward system
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-1">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('overview')}
                className="text-white"
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('dashboard')}
                className="text-white"
              >
                My Referrals
              </Button>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* How It Works */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How It Works</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Simple steps to start earning referral rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                    <h3 className="text-lg font-semibold">Share Your Link</h3>
                    <p className="text-gray-300">
                      Share your unique referral link with friends via social media, email, or messaging
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <h3 className="text-lg font-semibold">Friend Joins</h3>
                    <p className="text-gray-300">
                      Your friend clicks your link, signs up, and starts using VideoTask Rewards
                    </p>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                    <h3 className="text-lg font-semibold">Earn Rewards</h3>
                    <p className="text-gray-300">
                      Get paid instantly as your friend reaches different milestones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Tiers */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Reward Tiers</CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  Earn more as your referrals become more active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardTiers.map((tier, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${tier.color} rounded-lg flex items-center justify-center text-white`}>
                          {tier.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{tier.title}</h3>
                          <Badge variant="secondary" className="text-green-600 bg-green-100">
                            {tier.amount}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{tier.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-yellow-400">Maximum Earning Potential</span>
                  </div>
                  <p className="text-white">
                    Each successful referral can earn you up to <span className="font-bold text-yellow-400">$55 total</span> as they progress through all milestones!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    For You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Earn up to $55 per referral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Instant payments to your wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No limit on referrals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Track all your referrals</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    For Your Friends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Free account registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Start earning immediately</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Access to all videos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Multiple withdrawal options</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
                <p className="text-lg mb-6">
                  Get your referral link and start inviting friends today!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => setActiveTab('dashboard')}
                >
                  Get My Referral Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <ReferralDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
