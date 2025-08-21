'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScrollableLayout, { FullPageScrollableLayout } from '@/components/scrollable-layout';
import { ArrowLeft, Scroll, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ScrollDemoPage() {
  // Generate demo content to show scrolling behavior
  const demoCards = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Demo Card ${i + 1}`,
    description: `This is demo content for card ${i + 1}. It demonstrates how the scrollable layout works with multiple content items.`,
    content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`
  }));

  const header = (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Scroll className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Scrollable Layout Demo</h1>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Eye className="h-3 w-3 mr-1" />
            Demo Page
          </Badge>
        </div>
      </div>
    </div>
  );

  return (
    <FullPageScrollableLayout 
      header={header}
      className="bg-gray-50"
      contentClassName="max-w-7xl mx-auto"
    >
      {/* Demo Instructions */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="h-5 w-5" />
            Scrollable Layout Features
          </CardTitle>
          <CardDescription className="text-blue-800">
            This page demonstrates the custom scrollable content area implementation
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>The page header is fixed and doesn't scroll with the content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Only the content area below scrolls, not the entire viewport</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>The layout maintains proper height without gaps at top/bottom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Scroll behavior is contained within this content area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Try scrolling down to see more content cards below</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Demo Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {demoCards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{card.content}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Card #{card.id}</Badge>
                <Button size="sm" variant="ghost">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Content */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">
            🎉 You've reached the bottom!
          </CardTitle>
          <CardDescription className="text-green-800">
            This demonstrates that the scroll area works correctly and contains all content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-green-800 mb-4">
            The scrollable layout successfully:
          </p>
          <ul className="text-green-800 space-y-1 mb-4">
            <li>✅ Prevents whole page scrolling</li>
            <li>✅ Contains scroll behavior within content area</li>
            <li>✅ Maintains proper viewport height</li>
            <li>✅ Provides smooth scrolling experience</li>
          </ul>
          <Link href="/dashboard">
            <Button className="bg-green-600 hover:bg-green-700">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </FullPageScrollableLayout>
  );
}
