import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log(request.url);
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ channels: [] })
  }

  // Mock data
  const mockChannels = [
    {
      id: '1',
      title: 'TechTube',
      description: 'Latest tech reviews and gadget unboxings',
      thumbnailUrl: 'https://picsum.photos/seed/tech/200/200',
      subscriberCount: '2.1M',
      videoCount: 521,
      createdAt: '2015',
      category: 'Technology',
      totalViews: '150M'
    },
    {
      id: '2',
      title: 'Cooking with Clara',
      description: 'Easy and delicious recipes for everyone',
      thumbnailUrl: 'https://picsum.photos/seed/cooking/200/200',
      subscriberCount: '892K',
      videoCount: 312,
      createdAt: '2018',
      category: 'Food',
      totalViews: '45M'
    },
    {
      id: '3',
      title: 'FitnessFreak',
      description: 'Home workouts and nutrition tips for a healthier you',
      thumbnailUrl: 'https://picsum.photos/seed/fitness/200/200',
      subscriberCount: '1.5M',
      videoCount: 428,
      createdAt: '2017',
      category: 'Health & Fitness',
      totalViews: '89M'
    },
    {
      id: '4',
      title: 'TravelBug',
      description: 'Explore the world through our adventures',
      thumbnailUrl: 'https://picsum.photos/seed/travel/200/200',
      subscriberCount: '750K',
      videoCount: 203,
      createdAt: '2019',
      category: 'Travel',
      totalViews: '25M'
    },
    {
      id: '5',
      title: 'GamingGurus',
      description: 'Walkthroughs, reviews, and gaming news',
      thumbnailUrl: 'https://picsum.photos/seed/gaming/200/200',
      subscriberCount: '3.2M',
      videoCount: 892,
      createdAt: '2016',
      category: 'Gaming',
      totalViews: '280M'
    }
  ]

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return NextResponse.json({
    channels: mockChannels
  })
}

