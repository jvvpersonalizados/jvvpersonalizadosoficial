import React, { useEffect, useState } from 'react';
import { Instagram, Loader2 } from 'lucide-react';

interface InstagramFeedProps {
  t: (br: any, int: any) => any;
}

interface InstagramPost {
  id: string;
  url: string;
  image: string;
  thumbnail: string;
  caption: string;
}

export const InstagramFeed: React.FC<InstagramFeedProps> = ({ t }) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        console.log("Fetching social feed...");
        const response = await fetch('/api/social-feed');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Feed data received:", data);
        
        if (data.success) {
          setPosts(data.posts.slice(0, 6));
        } else {
          setError(data.error || "Failed to fetch feed");
        }
      } catch (err: any) {
        console.error("Error fetching Social feed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <section className="container mx-auto px-4 md:px-6 mb-16 md:mb-20 animate-fade font-jakarta">
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-[40px] md:rounded-[60px] p-6 md:p-12 backdrop-blur-2xl shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 md:gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-white">
            <div className="p-4 md:p-5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[20px] md:rounded-3xl shadow-lg animate-pulse"><Instagram size={28} className="md:w-9 md:h-9" /></div>
            <div>
              <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">{t('Siga a @jvvpersonalizados', 'Follow @jvvpersonalizados')}</h4>
              <p className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 md:mt-2">{t('Exploração diária no nosso feed stelar', 'Daily exploration on our stellar feed')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a href="https://www.instagram.com/jvvpersonalizados/" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none text-center bg-white/5 px-8 py-3.5 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white hover:bg-[#d91ebd] transition-all">
              {t('Abrir no Instagram', 'Open on Instagram')}
            </a>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#d91ebd]" size={40} />
          </div>
        ) : error && posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>{t('Não foi possível carregar o feed no momento.', 'Could not load the feed at the moment.')}</p>
            <p className="text-xs mt-2">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
            {posts.map((post) => (
              <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-xl block">
                <img src={post.image} alt={post.caption} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold">
                  {post.url.includes('pinterest.com') || post.url.includes('pin.it') ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.19-2.4.04-3.43.21-.93 1.35-5.73 1.35-5.73s-.34-.69-.34-1.71c0-1.61.93-2.81 2.09-2.81 1 0 1.48.75 1.48 1.64 0 1-.64 2.5-1 3.88-.28 1.17.58 2.13 1.73 2.13 2.08 0 3.68-2.19 3.68-5.36 0-2.8-2.02-4.76-4.89-4.76-3.33 0-5.28 2.5-5.28 5.08 0 1.01.39 2.09.87 2.67.1.12.11.22.08.34-.09.37-.28 1.14-.32 1.28-.05.2-.17.25-.39.14-1.43-.67-2.33-2.78-2.33-4.47 0-3.64 2.64-6.98 7.62-6.98 4 0 7.11 2.85 7.11 6.66 0 3.98-2.51 7.18-5.99 7.18-1.17 0-2.27-.61-2.65-1.33l-.72 2.74c-.26 1-1.01 2.25-1.51 3.06C10.08 23.83 11.02 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/></svg>
                  ) : (
                    <Instagram className="text-white" size={24} />
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
