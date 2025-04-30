import React, { useEffect, useRef } from 'react';

const GetMap = (atlas: any, container: HTMLDivElement | null) => {
  if (!container) return;
  // Instantiate a map object using the container element directly.
  const map = new atlas.Map(container, {
    view: 'Auto',
    authOptions: {
      authType: 'subscriptionKey',
      subscriptionKey: '2yPnxVcYp4mdzXBTsK7A0NOTersPLOt42GebVpwJcBeW458wDX8zJQQJ99BDACYeBjFeIIR0AAAgAZMPEK9E' // Replace with your actual key.
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

    var query = 'gasoline-station';
    var radius = 9000;
    var lat = 47.64452336193245;
    var lon = -122.13687658309935;
    var url = `https://atlas.microsoft.com/search/poi/json?api-version=1.0&query=${query}&lat=${lat}&lon=${lon}&radius=${radius}`;
    
    fetch(url, {
        headers: {
            "Subscription-Key": map.authentication.getToken()
        }
    })
    .then((response) => response.json())
    .then((response) => {
        var bounds: any[] = [];
    
        //Extract GeoJSON feature collection from the response and add it to the datasource
        var data = response.results.map((result: { position: { lon: any; lat: any; }; }) => {
            var position = [result.position.lon, result.position.lat];
            bounds.push(position);
            return new atlas.data.Feature(new atlas.data.Point(position), { ...result });
        });
        datasource.add(data);
    
        console.log({ data });

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
    <div style={{ width: '100%', height: '100%' }}>
      <h1>Map</h1>
      <hr />
      <div
        ref={mapContainerRef}
        style={{
          width: '400px',
          height: '200px',
          display: "flex",
          flexDirection: "row",
          alignSelf: "center"
        }}
      />
      <hr />
    </div>
  );
};

export default Map;
