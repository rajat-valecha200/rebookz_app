import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface LeafletMapProps {
    initialRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    onRegionChangeComplete?: (region: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    }) => void;
    onMapMove?: () => void;
}

export default function LeafletMap({ initialRegion, onRegionChangeComplete, onMapMove }: LeafletMapProps) {
    const webViewRef = useRef<WebView>(null);

    const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .leaflet-control-attribution { display: none; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            center: [${initialRegion.latitude}, ${initialRegion.longitude}],
            zoom: 15
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          map.on('movestart', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'onMapMove' }));
          });

          map.on('moveend', function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'onRegionChangeComplete',
              latitude: center.lat,
              longitude: center.lng
            }));
          });

          // Function to set center from RN
          window.setCenter = function(lat, lng) {
            map.setView([lat, lng], 15);
          };
        </script>
      </body>
    </html>
  `;

    const onMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'onMapMove' && onMapMove) {
                onMapMove();
            } else if (data.type === 'onRegionChangeComplete' && onRegionChangeComplete) {
                onRegionChangeComplete({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    latitudeDelta: 0.01, // Mock deltas
                    longitudeDelta: 0.01,
                });
            }
        } catch (e) {
            console.error('Map bridge error:', e);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ html: mapHtml }}
                onMessage={onMessage}
                scrollEnabled={false}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
