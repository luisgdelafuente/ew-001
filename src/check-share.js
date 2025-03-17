import { supabase } from './lib/supabase.js';

async function checkShares() {
  try {
    // Get all shares
    const { data, error } = await supabase
      .from('video_shares')
      .select('*');

    if (error) {
      console.error('Error fetching shares:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('No shares found in the database');
      return;
    }

    console.log('Found shares:', data.length);
    data.forEach(share => {
      console.log('\nShare ID:', share.id);
      console.log('Company:', share.company_name);
      console.log('Activity:', share.activity);
      console.log('Created:', new Date(share.created_at).toLocaleString());
      console.log('Expires:', new Date(share.expires_at).toLocaleString());
      console.log('Videos:', share.videos.length);
      console.log('Selected Videos:', share.selected_videos.length);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkShares();