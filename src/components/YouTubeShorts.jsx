import React, { useState, useEffect } from 'react';

const YouTubeShorts = ({ language = 'es' }) => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Translations for the section
  const translations = {
    es: {
      title: "ÚLTIMAS ENTREGAS",
      error: "No se pudieron cargar los vídeos",
      loading: "Cargando vídeos...",
      watchOn: "Ver en YouTube",
      configError: "Configuración de YouTube incompleta"
    },
    en: {
      title: "LATEST DELIVERIES",
      error: "Could not load videos",
      loading: "Loading videos...",
      watchOn: "Watch on YouTube",
      configError: "YouTube configuration incomplete"
    }
  };
  
  const t = translations[language] || translations.en;

  // Get environment variables
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  useEffect(() => {
    const fetchYouTubeShorts = async () => {
      try {
        setLoading(true);
        
        // Check if required environment variables are available
        if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
          throw new Error(t.configError);
        }
        
        // Create the YouTube API URL with parameters
        const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        apiUrl.searchParams.append('part', 'snippet');
        apiUrl.searchParams.append('channelId', YOUTUBE_CHANNEL_ID);
        apiUrl.searchParams.append('maxResults', '5');
        apiUrl.searchParams.append('order', 'date');
        apiUrl.searchParams.append('type', 'video');
        // Removed videoDuration parameter to fetch all videos, not just shorts
        apiUrl.searchParams.append('key', YOUTUBE_API_KEY);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`YouTube API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          // Transform the API response to the format we need
          const shortsData = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            // Use standard thumbnail (16:9) with fallback to high quality
            thumbnail: item.snippet.thumbnails.standard?.url || item.snippet.thumbnails.high.url,
            publishedAt: new Date(item.snippet.publishedAt)
          }));
          
          setShorts(shortsData);
        } else {
          setShorts([]);
        }
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeShorts();
  }, [YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, t.configError]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8 mt-16">
        <div className="w-full flex items-center justify-center py-10">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-[#7B7EF4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white">{t.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8 mt-16">
        <div className="w-full text-center py-10">
          <p className="text-red-400">{t.error}: {error}</p>
        </div>
      </div>
    );
  }

  if (shorts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8 mt-16">
      <h2 className="text-xl sm:text-2xl font-medium text-center mb-6">{t.title}</h2>
      
      <div className="relative">
        {/* Desktop view - Grid */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {shorts.map(short => (
            <a 
              key={short.id}
              href={`https://www.youtube.com/watch?v=${short.id}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="group relative aspect-video rounded-xl overflow-hidden bg-black/20 transition-transform hover:scale-105"
            >
              <img 
                src={short.thumbnail} 
                alt={short.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-white text-sm font-medium line-clamp-2">{short.title}</p>
                <div className="flex items-center mt-2 space-x-1">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span className="text-xs text-white/80">{t.watchOn}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {/* Mobile view - Single column grid without text */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {shorts.map(short => (
            <a 
              key={short.id}
              href={`https://www.youtube.com/watch?v=${short.id}`}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="relative aspect-video rounded-xl overflow-hidden bg-black/20"
            >
              <img 
                src={short.thumbnail}

                alt={short.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      </div>
      
      {/* Schema.org structured data for videos */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": shorts.map((short, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "VideoObject",
              "name": short.title,
              "thumbnailUrl": short.thumbnail,
              "uploadDate": short.publishedAt,
              "url": `https://www.youtube.com/watch?v=${short.id}`
            }
          }))
        })}
      </script>
    </div>
  );
};

export default YouTubeShorts;