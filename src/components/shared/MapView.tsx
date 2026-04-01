import React, { useEffect, useRef } from 'react';
import './MapView.scss';

interface MapViewProps {
  lat: number;
  lng: number;
  height?: string;
}

const loadAtlasScript = (callback: (atlas: any) => void) => {
  const win = window as any;
  if (win.atlas) { callback(win.atlas); return; }

  if (!document.getElementById('azureMapsScript')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.id = 'azureMapsScript';
    script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js';
    script.async = true;
    script.onload = () => callback(win.atlas);
    document.head.appendChild(script);
  } else {
    // Script tag exists but atlas not yet ready — poll until ready
    const check = setInterval(() => {
      if (win.atlas) { clearInterval(check); callback(win.atlas); }
    }, 100);
  }
};

const MapView = ({ lat, lng, height = '280px' }: MapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;

    loadAtlasScript((atlas) => {
      if (!containerRef.current) return;

      map = new atlas.Map(containerRef.current, {
        center: [lng, lat],
        zoom: 12,
        view: 'Auto',
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY,
        },
      });

      map.events.add('ready', () => {
        const datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        map.layers.add(
          new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: { image: 'pin-round-darkblue', anchor: 'center', allowOverlap: true },
          })
        );

        datasource.add(new atlas.data.Feature(new atlas.data.Point([lng, lat])));
      });
    });

    return () => {
      try { map?.dispose(); } catch { /* ignore */ }
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="map-view" style={{ height }} />;
};

export default MapView;
