import { supabase } from './lib/supabase.js';

async function getTestShare() {
  try {
    const { data, error } = await supabase
      .from('video_shares')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching share:', error);
      return;
    }

    if (data) {
      console.log('Share data found:');
      console.log('Share ID:', data.id);
      console.log('Share URL:', `http://localhost:5173/${data.id}`);
      console.log('Company:', data.company_name);
      console.log('Videos:', data.videos.length);
      console.log('Selected:', data.selected_videos.length);
    } else {
      console.log('No share data found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getTestShare();