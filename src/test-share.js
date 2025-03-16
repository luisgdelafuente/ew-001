import { getShare } from './lib/supabase.js';

async function testShare() {
  const testId = '200786';
  
  console.log(`Testing share URL with ID: ${testId}`);
  
  try {
    const share = await getShare(testId);
    
    if (!share) {
      console.log('Share not found');
      return;
    }
    
    console.log('Share data found:');
    console.log('Company:', share.companyName);
    console.log('Activity:', share.activity);
    console.log('Videos:', share.videos.length);
    console.log('Selected Videos:', share.selectedVideos.length);
    
  } catch (error) {
    console.error('Error testing share:', error);
  }
}

testShare();