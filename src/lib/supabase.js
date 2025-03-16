import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://funoizveymfycxbfvukw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bm9penZleW1meWN4YmZ2dWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTI5MzMsImV4cCI6MjA1NzcyODkzM30.9v7wUOollCCAkp01FWH6VyIAoByt7_F2pbou2eVzEZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function generateClientNumber() {
  // Generate a 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createShare(companyName, videos, selectedVideos, activity) {
  if (!companyName || !videos) {
    throw new Error('Missing required parameters');
  }

  try {
    // Try to generate a unique client number
    let clientNumber;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      clientNumber = generateClientNumber();
      
      // Check if the number is already in use
      const { data: existing } = await supabase
        .from('video_shares')
        .select('id')
        .eq('id', clientNumber)
        .maybeSingle();

      if (!existing) {
        break; // Found an unused number
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Could not generate unique client number');
    }

    const { data, error } = await supabase
      .from('video_shares')
      .insert({
        id: clientNumber,
        company_name: companyName,
        videos: videos,
        selected_videos: selectedVideos || [],
        activity: activity
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to create share');
    }

    if (!data?.id) {
      throw new Error('No ID returned from share creation');
    }

    return data.id;
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
    // Use maybeSingle() instead of single() to handle no results gracefully
    const { data, error } = await supabase
      .from('video_shares')
      .select('company_name, videos, selected_videos, activity')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch share');
    }

    if (!data) {
      throw new Error('Share not found');
    }

    return {
      companyName: data.company_name,
      videos: data.videos,
      selectedVideos: data.selected_videos,
      activity: data.activity
    };
  } catch (error) {
    console.error('Error getting share:', error);
    throw error;
  }
}