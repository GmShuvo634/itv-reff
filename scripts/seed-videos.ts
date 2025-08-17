import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Video URLs from the video.md file
const videoUrls = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

// Video titles and descriptions
const videoData = [
  {
    title: 'We Are Going On Bullrun',
    description: 'An exciting journey through the world of cryptocurrency and digital assets.',
    duration: 180, // 3 minutes
  },
  {
    title: 'For Bigger Joyrides',
    description: 'Experience the thrill of adventure and exploration in this captivating video.',
    duration: 240, // 4 minutes
  },
  {
    title: 'For Bigger Meltdowns',
    description: 'A dramatic and intense video showcasing powerful moments and emotions.',
    duration: 200, // 3 minutes 20 seconds
  },
  {
    title: 'For Bigger Fun',
    description: 'Join us for an entertaining and fun-filled video experience.',
    duration: 160, // 2 minutes 40 seconds
  },
  {
    title: 'For Bigger Escapes',
    description: 'Escape into a world of wonder and imagination with this amazing video.',
    duration: 220, // 3 minutes 40 seconds
  },
  {
    title: 'For Bigger Blazes',
    description: 'Witness spectacular moments and blazing action in this thrilling video.',
    duration: 190, // 3 minutes 10 seconds
  },
  {
    title: 'Digital Marketing Mastery',
    description: 'Learn the fundamentals of digital marketing and online business strategies.',
    duration: 60, // 1 minutes
  },
  {
    title: 'Cryptocurrency Basics',
    description: 'Understanding the basics of cryptocurrency and blockchain technology.',
    duration: 887, // 14 minutes 47 seconds
  },
  {
    title: 'Investment Strategies',
    description: 'Smart investment strategies for building long-term wealth.',
    duration: 320, // 5 minutes 20 seconds
  },
  {
    title: 'Entrepreneurship Journey',
    description: 'The complete guide to starting and growing your own business.',
    duration: 350, // 5 minutes 50 seconds
  },
  {
    title: 'Financial Freedom',
    description: 'Achieve financial independence through smart money management.',
    duration: 270, // 4 minutes 30 seconds
  },
  {
    title: 'Online Business Success',
    description: 'Build a successful online business from scratch.',
    duration: 290, // 4 minutes 50 seconds
  },
  {
    title: 'Passive Income Streams',
    description: 'Create multiple passive income streams for financial security.',
    duration: 887, // 14 minutes 47 seconds
  },
  {
    title: 'Trading Psychology',
    description: 'Master the psychological aspects of successful trading.',
    duration: 260, // 4 minutes 20 seconds
  },
  {
    title: 'Wealth Building Mindset',
    description: 'Develop the right mindset for building lasting wealth.',
    duration: 250, // 4 minutes 10 seconds
  },
  {
    title: 'Market Analysis Techniques',
    description: 'Advanced techniques for analyzing financial markets.',
    duration: 330, // 5 minutes 30 seconds
  },
  {
    title: 'Risk Management',
    description: 'Essential risk management strategies for investors.',
    duration: 240, // 4 minutes
  },
  {
    title: 'Portfolio Diversification',
    description: 'Build a diversified investment portfolio for maximum returns.',
    duration: 15, // 15 seconds
  },
  {
    title: 'Economic Trends Analysis',
    description: 'Understanding and analyzing current economic trends.',
    duration: 300, // 5 minutes
  },
  {
    title: 'Future of Finance',
    description: 'Exploring the future of finance and digital currencies.',
    duration: 320, // 5 minutes 20 seconds
  },
];

function getRandomVideoUrl(): string {
  return videoUrls[Math.floor(Math.random() * videoUrls.length)];
}

function generateThumbnailUrl(videoUrl: string): string {
  // Generate a placeholder thumbnail URL based on the video
  const videoName = videoUrl.split('/').pop()?.replace('.mp4', '') || 'video';
  return `https://via.placeholder.com/640x360/0066cc/ffffff?text=${encodeURIComponent(videoName)}`;
}

async function seedVideos() {
  try {
    console.log('🎬 Starting video seeding process...');

    // Step 1: Clean existing video data
    console.log('🧹 Cleaning existing video data...');

    // Delete all existing user video tasks first (due to foreign key constraints)
    await prisma.userVideoTask.deleteMany({});
    console.log('✓ Deleted all existing user video tasks');

    // Delete all existing videos
    await prisma.video.deleteMany({});
    console.log('✓ Deleted all existing videos');

    // Step 2: Get all position levels for random assignment
    const positionLevels = await prisma.positionLevel.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    });

    if (positionLevels.length === 0) {
      console.log('⚠️  No position levels found. Please run position level seeding first.');
      return;
    }

    console.log(`📊 Found ${positionLevels.length} position levels`);

    // Step 3: Create 20 new videos with random position level assignments
    console.log('🎥 Creating 20 new videos...');

    const videosToCreate: Prisma.VideoCreateManyInput[] = [];

    for (let i = 0; i < 20; i++) {
      const videoInfo = videoData[i];
      const randomPositionLevel = positionLevels[Math.floor(Math.random() * positionLevels.length)];
      const videoUrl = getRandomVideoUrl();

      videosToCreate.push({
        title: videoInfo.title,
        description: videoInfo.description,
        url: videoUrl,
        thumbnailUrl: generateThumbnailUrl(videoUrl),
        duration: videoInfo.duration,
        rewardAmount: randomPositionLevel.unitPrice, // Use position level unit price as reward
        positionLevelId: randomPositionLevel.id,
        isActive: true,
        availableFrom: new Date(),
        availableTo: null, // No expiry
      });
    }

    // Create all videos
    const createdVideos = await prisma.video.createMany({
      data: videosToCreate,
      skipDuplicates: true
    });

    console.log(`✅ Successfully created ${createdVideos.count} videos`);

    // Step 4: Display summary
    const videosByPosition = await prisma.video.groupBy({
      by: ['positionLevelId'],
      _count: {
        id: true
      }
    });

    console.log('\n📈 Video distribution by position level:');
    for (const group of videosByPosition) {
      const positionLevel = await prisma.positionLevel.findUnique({
        where: { id: group.positionLevelId! },
        select: { name: true, unitPrice: true }
      });

      console.log(`  ${positionLevel?.name}: ${group._count.id} videos (${positionLevel?.unitPrice} PKR reward each)`);
    }

    console.log('\n🎉 Video seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedVideos()
    .then(() => {
      console.log('✅ Video seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Video seeding failed:', error);
      process.exit(1);
    });
}

export default seedVideos;
