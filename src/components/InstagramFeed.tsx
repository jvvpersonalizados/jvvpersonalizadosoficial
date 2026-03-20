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
        const response = await fetch('/api/instagram');
        const data = await response.json();
        
        if (data.success) {
          setPosts(data.posts.slice(0, 6));
        } else if (data.fallback) {
          // If blocked, use the fallback images provided by the server
          setPosts(data.fallback.map((img: string, i: number) => ({
            id: `fallback-${i}`,
            url: "https://www.instagram.com/jvvpersonalizados/",
            image: img,
            thumbnail: img,
            caption: "Instagram Post"
          })));
        } else {
          setError(data.error || "Failed to fetch feed");
        }
      } catch (err: any) {
        console.error("Error fetching Instagram feed:", err);
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
          <a href="https://www.instagram.com/jvvpersonalizados/" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto text-center bg-white/5 px-8 py-3.5 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 text-white hover:bg-[#d91ebd] transition-all">
            {t('Abrir no Instagram', 'Open on Instagram')}
          </a>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
            {posts.map((post) => (
              <a key={post.id} href={post.url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5 shadow-xl block">
                <img src={post.image} alt={post.caption} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white font-bold"><Instagram className="text-white" size={24} /></div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
