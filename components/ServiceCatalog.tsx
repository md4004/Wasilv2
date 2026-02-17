
import React, { useState } from 'react';
import { SERVICES } from '../constants';
import { Service, Category } from '../types';

interface ServiceCatalogProps {
  onSelectService: (service: Service) => void;
  onBack: () => void;
}

const ServiceCatalog: React.FC<ServiceCatalogProps> = ({ onSelectService, onBack }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'ALL'>('ALL');
  
  const categories: (Category | 'ALL')[] = ['ALL', 'POWER/SOLAR', 'IT & TECH', 'PLUMBING', 'ESSENTIALS', 'OTHER'];
  
  const filteredServices = activeCategory === 'ALL' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Category Selection - Horizontal Scrolling on Mobile */}
      <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 mb-6 md:mb-8 gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 h-10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 flex items-center justify-center ${
              activeCategory === cat 
                ? 'bg-navy text-sand shadow-lg' 
                : 'bg-white text-navy/40 hover:text-navy hover:bg-sand border border-navy/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filteredServices.map((service) => (
          <div 
            key={service.id}
            onClick={() => onSelectService(service)}
            className={`group cursor-pointer bg-white rounded-3xl p-6 border border-navy/5 hover:border-sage/40 hover:shadow-xl hover:shadow-sage/10 transition-all flex flex-col h-full active:scale-[0.98] ${
              service.id === 'custom-request' ? 'border-dashed border-2 border-sage/40 bg-sage/5' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="text-4xl md:text-5xl">{service.icon}</div>
              <div className="flex flex-col items-end">
                {service.priority === 'High' && (
                  <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                    Critical
                  </span>
                )}
                <span className="text-[9px] md:text-[10px] font-bold text-navy/20 uppercase tracking-widest">{service.category}</span>
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-serif font-bold text-navy mb-2 group-hover:text-sage transition-colors leading-tight">
              {service.title}
            </h3>
            
            <p className="text-sm md:text-base text-navy/60 mb-6 flex-grow leading-relaxed">
              {service.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-navy/5 mt-auto">
              <div>
                <span className="text-[10px] uppercase font-bold opacity-30 block">Base Price</span>
                <div className="flex items-baseline">
                  <span className="text-xl md:text-2xl font-serif font-bold text-navy">
                    {service.id === 'custom-request' ? 'Quote' : `$${(service.basePrice * 1.5).toFixed(0)}`}
                  </span>
                  <span className="text-[11px] opacity-30 ml-1 italic font-medium">Fresh USD</span>
                </div>
              </div>
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-navy/10 flex items-center justify-center group-hover:bg-navy group-hover:text-sand transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCatalog;
