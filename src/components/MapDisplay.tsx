'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Attraction {
  id: string
  name: string
  description: string | null
  latitude: number
  longitude: number
  order: number
  visitTime: string | null
  duration: string | null
}

interface MapDisplayProps {
  attractions: Attraction[]
}

export default function MapDisplay({ attractions }: MapDisplayProps) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    try {
      setIsMounted(true)
    } catch (error) {
      console.error('MapDisplay mount error:', error)
      setHasError(true)
    }
  }, [])

  const createNumberedIcon = (number: number) => {
    return L.divIcon({
      html: `<div style="background-color: #4f46e5; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${number}</div>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  const polylinePositions = attractions.map(attraction => [
    attraction.latitude,
    attraction.longitude
  ] as [number, number])

  const center = attractions.length > 0 
    ? [attractions[0].latitude, attractions[0].longitude] as [number, number]
    : [40.7128, -74.0060] as [number, number]

  useEffect(() => {
    if (map && attractions.length > 0) {
      const bounds = L.latLngBounds(
        attractions.map(attraction => [attraction.latitude, attraction.longitude])
      )
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, attractions])

  if (hasError) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-gray-600">地图加载失败</p>
          <p className="text-xs text-gray-500 mt-1">请刷新页面重试</p>
        </div>
      </div>
    )
  }

  if (attractions.length === 0) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No attractions to display</p>
      </div>
    )
  }

  if (!isMounted) {
    return (
      <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">加载地图中...</p>
      </div>
    )
  }

  try {
    return (
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {attractions.map((attraction) => (
            <Marker
              key={attraction.id}
              position={[attraction.latitude, attraction.longitude]}
              icon={createNumberedIcon(attraction.order)}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{attraction.name}</h3>
                  {attraction.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-3">{attraction.description}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {attraction.visitTime && (
                      <div className="flex items-center gap-1">
                        <span>🕒</span>
                        <span>{attraction.visitTime}</span>
                      </div>
                    )}
                    {attraction.duration && (
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{attraction.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {polylinePositions.length > 1 && (
            <Polyline
              positions={polylinePositions}
              color="#4f46e5"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>
    )
  } catch (error) {
    console.error('MapContainer render error:', error)
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-gray-600">地图渲染失败</p>
          <p className="text-xs text-gray-500 mt-1">请刷新页面重试</p>
        </div>
      </div>
    )
  }
}