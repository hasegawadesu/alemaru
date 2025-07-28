'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useParams } from 'next/navigation'
import { MapPin, Star, ArrowLeft, ThumbsUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  address: string
  created_at: string
}

interface Review {
  id: string
  comment: string
  can_eat: boolean
  staff_understanding: number
  created_at: string
  profiles: {
    display_name: string | null
  }
  children: {
    nickname: string
    allergies: {
      allergen_name: string
    }[]
  }
}

export default function StoreDetailPage() {
  const [store, setStore] = useState<Store | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userChildren, setUserChildren] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({
    childId: '',
    comment: '',
    canEat: 'true',
    staffUnderstanding: '5'
  })
  
  const router = useRouter()
  const params = useParams()
  const storeId = params.id as string

  useEffect(() => {
    loadStoreAndReviews()
    loadUserChildren()
  }, [storeId])

  const loadStoreAndReviews = async () => {
    setLoading(true)
    
    // 店舗情報を取得
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !storeData) {
      toast.error('店舗情報の取得に失敗しました')
      router.push('/stores')
      return
    }

    setStore(storeData)

    // レビューを取得
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (display_name),
        children (
          nickname,
          allergies (allergen_name)
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error loading reviews:', reviewsError)
    } else {
      setReviews(reviewsData || [])
    }
    
    setLoading(false)
  }

  const loadUserChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    const { data: children } = await supabase
      .from('children')
      .select('*, allergies(*)')
      .eq('profile_id', profile.id)

    setUserChildren(children || [])
  }

  const submitReview = async () => {
    if (!reviewForm.childId || !reviewForm.comment) {
      toast.error('お子さんとコメントを入力してください')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profile) return

    const { error } = await supabase
      .from('reviews')
      .insert({
        store_id: storeId,
        profile_id: profile.id,
        child_id: reviewForm.childId,
        comment: reviewForm.comment,
        can_eat: reviewForm.canEat === 'true',
        staff_understanding: parseInt(reviewForm.staffUnderstanding)
      })

    if (error) {
      console.error('Error submitting review:', error)
      toast.error('口コミの投稿に失敗しました')
    } else {
      toast.success('口コミを投稿しました！')
      setShowReviewForm(false)
      setReviewForm({
        childId: '',
        comment: '',
        canEat: 'true',
        staffUnderstanding: '5'
      })
      await loadStoreAndReviews()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!store) {
    return null
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.staff_understanding, 0) / reviews.length).toFixed(1)
    : '0'

  const canEatCount = reviews.filter(r => r.can_eat).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌟 アレマル</h1>
          <Button variant="outline" onClick={() => router.push('/stores')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            店舗一覧に戻る
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 店舗情報 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{store.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {store.address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{averageRating}</span>
                <span className="text-gray-500">/ 5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{canEatCount}人</span>
                <span className="text-gray-500">が食べられた！</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-500">
                  登録日: {formatDate(store.created_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 口コミ投稿ボタン */}
        {!showReviewForm && userChildren.length > 0 && (
          <div className="mb-6 text-center">
            <Button onClick={() => setShowReviewForm(true)} size="lg">
              口コミを投稿する
            </Button>
          </div>
        )}

        {/* 口コミ投稿フォーム */}
        {showReviewForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>口コミを投稿</CardTitle>
              <CardDescription>
                実際に利用した体験を共有してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="child">お子さん</Label>
                <Select
                  value={reviewForm.childId}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, childId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="お子さんを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {userChildren.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.nickname}
                        {child.allergies.length > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({child.allergies.map((a: any) => a.allergen_name).join(', ')})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="canEat">食べられましたか？</Label>
                <Select
                  value={reviewForm.canEat}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, canEat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">食べられた！</SelectItem>
                    <SelectItem value="false">食べられなかった</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="staffUnderstanding">スタッフの理解度</Label>
                <Select
                  value={reviewForm.staffUnderstanding}
                  onValueChange={(value) => setReviewForm({ ...reviewForm, staffUnderstanding: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ とても理解がある</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 理解がある</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 普通</SelectItem>
                    <SelectItem value="2">⭐⭐ あまり理解がない</SelectItem>
                    <SelectItem value="1">⭐ 理解がない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comment">コメント</Label>
                <Textarea
                  id="comment"
                  placeholder="対応の詳細、食べられたメニュー、注意点など..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReview}>
                  投稿する
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewForm({
                      childId: '',
                      comment: '',
                      canEat: 'true',
                      staffUnderstanding: '5'
                    })
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 口コミ一覧 */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">口コミ ({reviews.length}件)</h3>
          
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {review.children.nickname}ちゃん
                      {review.can_eat ? (
                        <Badge className="bg-green-100 text-green-800">食べられた！</Badge>
                      ) : (
                        <Badge variant="secondary">食べられなかった</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      アレルギー: {review.children.allergies.map(a => a.allergen_name).join(', ')}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.staff_understanding
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">まだ口コミがありません</p>
                {userChildren.length > 0 && (
                  <Button className="mt-4" onClick={() => setShowReviewForm(true)}>
                    最初の口コミを投稿する
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {userChildren.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  口コミを投稿するには、まずお子さんの情報を登録してください
                </p>
                <Button onClick={() => router.push('/profile')}>
                  プロフィール設定へ
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}