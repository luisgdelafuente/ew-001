import { createShare } from './lib/supabase.js';

const testData = {
  companyName: "Test Company",
  videos: [
    {
      id: "video-1",
      title: "How to Grow Your Business Online",
      description: "Learn the essential strategies for expanding your business presence on the internet. This video covers key digital marketing techniques and tools.",
      duration: 45,
      type: "indirect"
    },
    {
      id: "video-2",
      title: "Our Success Story",
      description: "Discover how Test Company became a leader in the industry. We share our journey and key milestones.",
      duration: 30,
      type: "direct"
    }
  ],
  selectedVideos: [
    {
      id: "video-1",
      title: "How to Grow Your Business Online",
      description: "Learn the essential strategies for expanding your business presence on the internet. This video covers key digital marketing techniques and tools.",
      duration: 45,
      type: "indirect"
    }
  ]
};

async function createTestShare() {
  try {
    const shareId = await createShare(
      testData.companyName,
      testData.videos,
      testData.selectedVideos
    );
    
    console.log('Share created successfully!');
    console.log('Share ID:', shareId);
    console.log('Share URL:', `http://localhost:5173/?share=${shareId}`);
    return shareId;
  } catch (error) {
    console.error('Error creating test share:', error);
    throw error;
  }
}

// Run the test
createTestShare();