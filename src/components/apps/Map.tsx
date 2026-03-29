import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Map.scss';

const GetMap = (atlas: any, container: HTMLDivElement | null) => {
  if (!container) return;
  // Instantiate a map object using the container element directly.
  const map = new atlas.Map(container, {
    view: 'Auto',
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY
    }
  });

  // Wait until the map resources are ready.
  map.events.add('ready', function () {
    // Create a data source and add it to the map.
    const datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    // Add a layer for rendering point data.
    const resultLayer = new atlas.layer.SymbolLayer(datasource, null, {
      iconOptions: {
        image: 'pin-round-darkblue',
        anchor: 'center',
        allowOverlap: true
      },
      textOptions: {
        anchor: "top"
      }
    });

    map.layers.add(resultLayer);

    const query = 'gasoline-station';
    const radius = 9000;
    const lat = 47.64452336193245;
    const lon = -122.13687658309935;
    const url = `https://atlas.microsoft.com/search/poi/json?api-version=1.0&query=${query}&lat=${lat}&lon=${lon}&radius=${radius}`;
    
    fetch(url, {
        headers: {
            "Subscription-Key": map.authentication.getToken()
        }
    })
    .then((response) => response.json())
    .then((response) => {
        const bounds: any[] = [];
    
        //Extract GeoJSON feature collection from the response and add it to the datasource
        const data = response.results.map((result: { position: { lon: any; lat: any; }; }) => {
            const position = [result.position.lon, result.position.lat];
            bounds.push(position);
            return new atlas.data.Feature(new atlas.data.Point(position), { ...result });
        });
        datasource.add(data);

        //Set camera to bounds to show the results
        map.setCamera({
            bounds: new atlas.data.BoundingBox.fromLatLngs(bounds),
            zoom: 10,
            // padding: 15
        });
    });
  });
};

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if the script was already added.
    if (!document.getElementById('azureMapsScript')) {
      const script = document.createElement('script');
      script.id = 'azureMapsScript';
      script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const atlas = (window as any).atlas;
        GetMap(atlas, mapContainerRef.current);
      };
    } else {
      const atlas = (window as any).atlas;
      GetMap(atlas, mapContainerRef.current);
    }
  }, []);

  return (
    <div className="map">
      <div className="map__header">
        <h2 className="map__title">{t('apps.map')}</h2>
      </div>
      <div className="map__container">
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </div>
  );
};

export default Map;
