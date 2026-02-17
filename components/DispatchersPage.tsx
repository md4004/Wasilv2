
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Dispatcher, Review } from '../types';

interface DispatchersPageProps {
  onContactDispatcher: (id: string) => void;
  activeDispatcherIds: string[];
}

const DispatchersPage: React.FC<DispatchersPageProps> = ({ onContactDispatcher, activeDispatcherIds }) => {
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageMedia, setPageMedia] = useState({
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop',
    title: 'Building Trust: The Wasil Quality Standard'
  });

  useEffect(() => {
    const unsubDisp = onSnapshot(collection(db, 'dispatchers'), (snap) => {
      setDispatchers(snap.docs.map(d => ({ ...d.data(), id: d.id } as Dispatcher)));
    });
    const unsubRev = onSnapshot(collection(db, 'reviews'), (snap) => {
      setReviews(snap.docs.map(d => ({ ...d.data(), id: d.id } as Review)));
    });
    const fetchMedia = async () => {
      const snap = await getDoc(doc(db, 'settings', 'teamPage'));
      if (snap.exists()) setPageMedia(snap.data() as any);
    };
    fetchMedia();

    return () => { unsubDisp(); unsubRev(); };
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* Intro Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy">The Hands on the Ground</h2>
        <p className="text-navy/60 max-w-2xl mx-auto leading-relaxed">
          Meet our elite team of certified specialists. Each Wasil dispatcher is vetted, 
          highly trained, and committed to treating your parents like their own.
        </p>
      </section>

      {/* Video Showcase Dynamic */}
      <section className="bg-navy rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-video relative group border-8 border-white">
        {pageMedia.videoUrl ? (
          <video 
            src={pageMedia.videoUrl} 
            poster={pageMedia.thumbnailUrl}
            className="w-full h-full object-cover opacity-60"
            controls
          />
        ) : (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-sage flex items-center justify-center text-navy shadow-xl scale-100 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <img 
              src={pageMedia.thumbnailUrl} 
              alt="Video Thumbnail" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 -z-10"
              onError={handleImageError}
            />
          </div>
        )}
        <div className="absolute bottom-8 left-8 text-sand pointer-events-none">
          <p className="text-xs uppercase font-bold tracking-widest opacity-60 mb-1">Feature Video</p>
          <h3 className="text-2xl font-serif font-bold italic">{pageMedia.title}</h3>
        </div>
      </section>

      {/* Dispatcher Cards Dynamic */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dispatchers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-navy/20 italic">Updating our fleet records...</div>
        ) : (
          dispatchers.map(disp => {
            const isActive = activeDispatcherIds.includes(disp.id);
            return (
              <div key={disp.id} className="bg-white rounded-[2.5rem] p-8 border border-navy/5 shadow-sm hover:shadow-xl transition-all relative">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sand shadow-lg">
                    <img src={disp.photoUrl} alt={disp.name} className="w-full h-full object-cover" onError={handleImageError} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-serif font-bold text-navy">{disp.name}</h3>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <span className="mr-1">★</span>
                        <span className="font-bold">{disp.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-sage font-bold uppercase tracking-wider">{disp.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-navy/40 tracking-widest">Certified Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {disp.certifications?.map(cert => (
                      <span key={cert} className="bg-navy text-sand px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-white/10">
                        <svg className="w-3 h-3 text-sage" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="group relative">
                  <button 
                    onClick={() => onContactDispatcher(disp.id)}
                    className={`w-full mt-8 py-4 border-2 rounded-2xl text-xs font-bold uppercase transition-all ${
                      isActive 
                        ? 'border-navy/5 text-navy/60 hover:bg-navy hover:text-sand' 
                        : 'border-navy/5 text-navy/20 hover:bg-navy/5'
                    }`}
                  >
                    Contact & Chat with {disp.name}
                  </button>
                  {!isActive && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-navy text-sand text-[10px] px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Requires an active service request to enable direct chat.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Reviews Section Dynamic */}
      <section className="pt-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-serif font-bold text-navy">Photo Reviews from the Field</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {reviews.length === 0 ? (
            <div className="col-span-full py-12 text-center text-navy/20 italic">Pioneering new stories...</div>
          ) : (
            reviews.map(rev => (
              <div key={rev.id} className="min-w-[300px] bg-white rounded-3xl p-6 border border-navy/5 shadow-sm group">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                  <img 
                    src={rev.fieldPhotoUrl} 
                    alt="Field Review" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    onError={handleImageError}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-navy">{rev.expatName}</span>
                    <div className="text-yellow-500 text-[10px]">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-navy/60 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};

export default DispatchersPage;
