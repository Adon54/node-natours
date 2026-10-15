export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRvbnM1IiwiYSI6ImNsYXBlOG1kYzBobWYzcW1rMThkc2JmYzUifQ.3_ioTx6zF5qqmqoBj8wclA';

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/light-v10', // style URL
        projection: 'globe', // display the map as a 3D globe
        scrollZoom: false,
        // center: [-118.113491, 34.111745], // starting position [lng, lat]
        zoom: 4, // starting zoom
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';
        
        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
        .setLngLat(loc.coordinates)
        .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.description}</p>`)
        .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    })

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });

    const zoomSwitch = document.querySelector('.slider')
    
    zoomSwitch?.addEventListener('click', () => {
        const zoomable = map.scrollZoom.isEnabled()
        
        zoomable? map.scrollZoom.disable(): map.scrollZoom.enable()
    })
}
