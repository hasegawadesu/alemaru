'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Plus, Star, Users, Map } from 'lucide-react'
import { toast } from 'sonner'
import { StoreMap } from '@/components/store-map'
import { getCoordinatesFromAddress } from '@/lib/geocoding'

interface Store {
  id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  created_at: string
  reviews?: Review[]
}

interface Review {
  id: string
  can_eat: boolean
  comment: string
  staff_understanding: number
  created_at: string
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStore, setNewStore] = useState({ name: '', address: '' })
  const [showMap, setShowMap] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUserAndLoadStores()
    // 現在地を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('位置情報の取得に失敗:', error)
        }
      )
    }
  }, [])

  const checkUserAndLoadStores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/')
      return
    }
    
    await loadStores()
  }

  const loadStores = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        reviews (
          id,
          can_eat,
          comment,
          staff_understanding,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading stores:', error)
      toast.error('店舗情報の取得に失敗しました')
    } else {
      setStores(data || [])
    }
    
    setLoading(false)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadStores()
      return
    }

    setLoading(true)
    
    const { data, error } = await supabase
      .from('stores')
      .select(`
        *,
        reviews (
          id,
          can_eat,
          comment,
          staff_understanding,
          created_at
        )
      `)
      .ilike('name', `%${searchQuery}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching stores:', error)
      toast.error('検索に失敗しました')
    } else {
      setStores(data || [])
    }
    
    setLoading(false)
  }

  const addStore = async () => {
    if (!newStore.name || !newStore.address) {
      toast.error('店舗名と住所を入力してください')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // プロフィールIDを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      toast.error('プロフィールが見つかりません')
      return
    }

    // 住所から座標を取得
    const coordinates = await getCoordinatesFromAddress(newStore.address)

    const { error } = await supabase
      .from('stores')
      .insert({
        name: newStore.name,
        address: newStore.address,
        lat: coordinates?.lat || null,
        lng: coordinates?.lng || null,
        created_by: profile.id
      })

    if (error) {
      console.error('Error adding store:', error)
      toast.error('店舗の追加に失敗しました')
    } else {
      toast.success('店舗を追加しました')
      setNewStore({ name: '', address: '' })
      setShowAddForm(false)
      await loadStores()
    }
  }

  const calculateAverageRating = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + (review.staff_understanding || 0), 0)
    return (sum / reviews.length).toFixed(1)
  }

  const countCanEat = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return 0
    return reviews.filter(review => review.can_eat).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌟 アレマル</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">お店を探す</h2>
          
          {/* 検索バー */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="店舗名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              検索
            </Button>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              店舗を追加
            </Button>
            <Button 
              onClick={() => setShowMap(!showMap)}
              variant="outline"
            >
              <Map className="w-4 h-4 mr-2" />
              {showMap ? '一覧表示' : '地図表示'}
            </Button>
          </div>

          {/* 店舗追加フォーム */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>新しい店舗を追加</CardTitle>
                <CardDescription>
                  アレルギー対応してくれたお店の情報を共有しましょう
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      placeholder="店舗名"
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="住所"
                      value={newStore.address}
                      onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={addStore}>
                    追加する
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewStore({ name: '', address: '' })
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 地図表示 */}
        {showMap && (
          <div className="mb-6">
            <StoreMap 
              stores={stores.filter(s => s.lat && s.lng)} 
              center={userLocation || undefined}
              onStoreClick={(storeId) => router.push(`/stores/${storeId}`)}
            />
          </div>
        )}

        {/* 店舗一覧 */}
        {!showMap && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{stores.map((store) => (
            <Card 
              key={store.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/stores/${store.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{store.name}</span>
                  {store.reviews && store.reviews.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="w-3 h-3 mr-1" />
                      {calculateAverageRating(store.reviews)}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {store.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {store.reviews && store.reviews.length > 0 ? (
                      <>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          {store.reviews.length} 件の口コミ
                        </span>
                        <span className="text-green-600 font-semibold">
                          {countCanEat(store.reviews)} 人が食べられた！
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500">まだ口コミがありません</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {stores.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery ? '検索結果が見つかりませんでした' : 'まだ店舗が登録されていません'}
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                最初の店舗を追加する
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}