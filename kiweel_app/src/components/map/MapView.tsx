import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Wellness category colors (Kiweel branding)
const categoryColors: Record<string, string> = {
  PT: "#10B981",           // Personal Trainer - Green
  Dietitian: "#14B8A6",    // Dietitian - Teal
  Osteopath: "#059669",    // Osteopath - Dark Green
  Physiotherapist: "#34D399", // Physiotherapist - Light Green
  Coach: "#6EE7B7",        // Wellness Coach - Mint
  // Fallback
  default: "#10B981",     // Kiweel primary green
};

interface MapViewProps {
  professionals: any[];
}

export function MapView({ professionals }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();
  const [isMapReady, setIsMapReady] = useState(false);

  // Get API key from environment variable
  const mapboxToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!mapboxToken) {
      console.warn("Mapbox token not found");
      return;
    }

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    // Controlla se c'è un'ultima posizione visualizzata salvata
    const lastViewedLocation = localStorage.getItem('lastViewedLocation');
    
    if (lastViewedLocation) {
      try {
        const { lat, lng } = JSON.parse(lastViewedLocation);
        initializeMap([lng, lat]);
        return;
      } catch (e) {
        console.error("Error parsing last viewed location:", e);
      }
    }

    // Richiesta geolocalizzazione semplice
    const checkAndRequestLocation = async () => {
      if (!navigator.geolocation) {
        initializeMap([12.55, 41.85]);
        return;
      }

      // Controlla permessi se API disponibile (silenzioso)
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'denied') {
            initializeMap([12.55, 41.85]);
            return;
          }
        }
      } catch (e) {
        // Permissions API non disponibile, continua
      }

      // Richiedi posizione (semplice come Rewido)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('lastViewedLocation', JSON.stringify({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          }));
          initializeMap([position.coords.longitude, position.coords.latitude]);
        },
        (_error) => {
          // Fallback silenzioso al centro Italia
          initializeMap([12.55, 41.85]);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 600000
        }
      );
    };

    // Avvia richiesta geolocalizzazione
    checkAndRequestLocation();

    // Cleanup quando il componente si smonta
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  const initializeMap = (center: [number, number]) => {
    if (!mapContainer.current) return;
    
    // Mapbox usa automaticamente la lingua del browser per le etichette
    // Se il browser è in italiano, le etichette saranno in italiano
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: center,
      zoom: 12,
      maxBounds: [
        [6.6, 36.6],  // Southwest coordinates (Piemonte, Sicilia)
        [18.5, 47.1]  // Northeast coordinates (Puglia, Alto Adige)
      ],
      minZoom: 5,
      maxZoom: 18,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    // Quando la mappa è pronta, segnala che è pronta
    map.current.on('load', () => {
      setIsMapReady(true);
    });
  };


  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    professionals
      .filter((pro) => pro.latitude && pro.longitude)
      .forEach((pro) => {
        const color = categoryColors[pro.profession_type || pro.category] || categoryColors.default;

        // Create custom marker element
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.cssText = `
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        // Create popup content with better styling
        const popupContent = document.createElement("div");
        popupContent.style.cssText = `
          width: 280px;
          max-width: calc(100vw - 40px);
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const avatarUrl = pro.users?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(pro.users?.name || pro.title)}&background=10b981&color=fff`;
        const heroImageUrl = pro.hero_image_url;
        
        popupContent.innerHTML = `
          <div style="position: relative;">
            ${heroImageUrl 
              ? `<div style="height: 100px; overflow: hidden;"><img src="${heroImageUrl}" style="width: 100%; height: 100%; object-fit: cover;" /></div>`
              : `<div style="height: 100px; background: linear-gradient(135deg, #10B981 0%, #14B8A6 100%);"></div>`
            }
            <div style="position: absolute; bottom: -30px; left: 16px;">
              <img 
                src="${avatarUrl}" 
                style="width: 60px; height: 60px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); object-fit: cover;"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(pro.users?.name || pro.title)}&background=10b981&color=fff'"
              />
            </div>
          </div>
          
          <div style="padding: 40px 16px 16px 16px;">
            <h3 style="font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #1a1a1a;">${pro.users?.name || pro.title}</h3>
            <p style="font-size: 13px; color: #6B7280; margin-bottom: 12px;">${pro.title} · ${pro.city}</p>
            
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 13px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="font-weight: 600;">⭐ ${pro.rating?.toFixed(1) || "N/A"}</span>
                <span style="color: #6B7280;">(${pro.total_reviews || 0})</span>
              </div>
              ${
                pro.services?.[0]
                  ? `<span style="color: #6B7280;">Da €${pro.services[0].price.toFixed(2)}</span>`
                  : ""
              }
            </div>
            
            ${pro.bio ? `<p style="font-size: 13px; color: #6B7280; margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${pro.bio}</p>` : ""}
            
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button id="view-btn-${pro.id}" style="width: 100%; font-size: 13px; height: 36px; padding: 0 12px; background: #10B981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
                Visualizza Profilo
              </button>
            </div>
          </div>
        `;

        // Create popup with better positioning
        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          maxWidth: '300px'
        }).setDOMContent(popupContent);

        // Add event listeners when popup opens
        popup.on('open', () => {
          const viewBtn = document.getElementById(`view-btn-${pro.id}`);
          
          if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              navigate(`/professional/${pro.id}`);
            });
            viewBtn.addEventListener('mouseenter', function() {
              this.style.background = '#059669';
            });
            viewBtn.addEventListener('mouseleave', function() {
              this.style.background = '#10B981';
            });
          }
        });

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([parseFloat(pro.longitude), parseFloat(pro.latitude)])
          .setPopup(popup)
          .addTo(map.current!);

        // Center map when popup opens - shift marker down so popup is visible
        marker.getElement().addEventListener('click', () => {
          const isMobile = window.innerWidth < 768;
          map.current?.easeTo({
            center: [parseFloat(pro.longitude), parseFloat(pro.latitude)],
            zoom: Math.max(map.current?.getZoom() || 12, 14),
            padding: isMobile 
              ? { top: 20, bottom: 400, left: 20, right: 20 }
              : { top: 50, bottom: 450, left: 50, right: 50 },
            duration: 500
          });
        });

        markersRef.current.push(marker);
      });
  };

  useEffect(() => {
    // Se la mappa non è pronta, aspetta
    if (!isMapReady || !map.current) {
      return;
    }
    
    // Se non ci sono professionisti, pulisci i marker esistenti
    if (!professionals || professionals.length === 0) {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      return;
    }
    
    // Aggiungi i marker
    addMarkers();
  }, [professionals, isMapReady]);


  if (!mapboxToken) {
    return (
      <Card className="h-[calc(100vh-280px)] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="font-semibold text-lg">Mapbox non configurato</h3>
          <p className="text-sm text-muted-foreground">
            Per visualizzare la mappa, aggiungi il Mapbox Public Token:
          </p>
          <code className="block text-xs bg-muted p-2 rounded">
            VITE_MAPBOX_PUBLIC_TOKEN
          </code>
          <p className="text-xs text-muted-foreground">
            Ottieni il token su{" "}
            <a
              href="https://mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
