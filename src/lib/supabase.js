import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function generateClientNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createShare(companyName, videos, selectedVideos, activity) {
  if (!companyName || !videos) {
    throw new Error('Missing required parameters');
  }

  // Generate share metadata
  const shareTitle = `Videos para ${companyName}`;
  const shareDescription = `Propuesta de ${videos.length} ideas de videos para ${companyName}. ${activity || ''}`.trim();

  try {
    let clientNumber;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      clientNumber = generateClientNumber();
      
      const { data: existing } = await supabase
        .from('video_shares')
        .select('id')
        .eq('id', clientNumber)
        .maybeSingle();

      if (!existing) {
        break;
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Could not generate unique client number');
    }

    const { error } = await supabase
      .from('video_shares')
      .insert({
        id: clientNumber,
        company_name: companyName,
        videos: videos,
        selected_videos: selectedVideos || [],
        activity: activity,
        share_title: shareTitle,
        share_description: shareDescription
      });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to create share');
    }

    return clientNumber;
  } catch (error) {
    console.error('Error creating share:', error);
    throw error;
  }
}

export async function getShare(id) {
  if (!id) {
    throw new Error('Share ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('video_shares')
      .select('company_name, videos, selected_videos, activity, share_title, share_description')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch share');
    }

    if (!data) {
      return null;
    }

    return {
      companyName: data.company_name,
      videos: data.videos,
      selectedVideos: data.selected_videos,
      activity: data.activity,
      shareTitle: data.share_title,
      shareDescription: data.share_description
    };
  } catch (error) {
    console.error('Error getting share:', error);
    throw error;
  }
}