'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'

interface Store {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

interface StoreMapProps {
  stores: Store[]
  center?: { lat: number; lng: number }
  onStoreClick?: (storeId: string) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 35.6762,  // 東京の緯度
  lng: 139.6503  // 東京の経度
}

const options = {
  disableDefaultUI: false,
  zoomControl: true,
}

export function StoreMap({ stores, center = defaultCenter, onStoreClick }: StoreMapProps) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'google-map-script'
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  // 地図が読み込まれたら、すべてのマーカーが見えるように調整
  useEffect(() => {
    if (mapRef.current && stores.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      stores.forEach(store => {
        if (store.lat && store.lng) {
          bounds.extend({ lat: store.lat, lng: store.lng })
        }
      })
      mapRef.current.fitBounds(bounds)
    }
  }, [stores])

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>地図を表示するにはGoogle Maps APIキーが必要です</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96 text-gray-500">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>地図の読み込みに失敗しました</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96 text-gray-500">
          <p>地図を読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={options}
    >
      {stores.map((store) => {
        if (!store.lat || !store.lng) return null
        
        return (
          <Marker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            onClick={() => setSelectedStore(store)}
          />
        )
      })}

      {selectedStore && (
        <InfoWindow
          position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
          onCloseClick={() => setSelectedStore(null)}
        >
          <div className="p-2">
            <h3 className="font-semibold">{selectedStore.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedStore.address}</p>
            {onStoreClick && (
              <button
                className="text-sm text-blue-600 hover:underline mt-2"
                onClick={() => onStoreClick(selectedStore.id)}
              >
                詳細を見る →
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}