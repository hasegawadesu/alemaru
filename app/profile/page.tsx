'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Plus } from 'lucide-react'

const COMMON_ALLERGENS = [
  '卵', '乳', '小麦', 'そば', '落花生', 'えび', 'かに',
  '大豆', 'ごま', 'カシューナッツ', 'くるみ', 'アーモンド'
]

// 各子供のアレルギー追加フォームの状態を管理する型
interface AllergyFormState {
  selectedAllergen: string
  customAllergen: string
  severity: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [childName, setChildName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  
  // 各子供ごとのアレルギーフォーム状態を管理
  const [allergyForms, setAllergyForms] = useState<Record<string, AllergyFormState>>({})
  
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/')
      return
    }
    
    setUser(user)
    await loadProfile(user.id)
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    console.log('Loading profile for user:', userId)
    
    // プロフィールを取得または作成
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('Profile result:', profile, profileError)

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ user_id: userId })
        .select()
        .single()
      console.log('New profile created:', newProfile, insertError)
      profile = newProfile
    }

    setProfile(profile)

    // 子供の情報を取得
    if (profile) {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*, allergies(*)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true })

      console.log('Children data:', childrenData, childrenError)

      setChildren(childrenData || [])
      
      // 各子供のフォーム状態を初期化
      const initialForms: Record<string, AllergyFormState> = {}
      childrenData?.forEach(child => {
        initialForms[child.id] = {
          selectedAllergen: '',
          customAllergen: '',
          severity: '中度'
        }
      })
      setAllergyForms(initialForms)
    }
  }

  const addChild = async () => {
    if (!childName) {
      toast.error('お子さんのニックネームを入力してください')
      return
    }

    const { data, error } = await supabase
      .from('children')
      .insert({
        profile_id: profile.id,
        nickname: childName,
        birth_year: birthYear ? parseInt(birthYear) : null,
        birth_month: birthMonth ? parseInt(birthMonth) : null
      })
      .select()
      .single()

    if (error) {
      toast.error('エラーが発生しました')
      return
    }

    // 新しい子供のフォーム状態を追加
    setAllergyForms(prev => ({
      ...prev,
      [data.id]: {
        selectedAllergen: '',
        customAllergen: '',
        severity: '中度'
      }
    }))

    setChildren([...children, { ...data, allergies: [] }])
    setChildName('')
    setBirthYear('')
    setBirthMonth('')
    toast.success('お子さんの情報を追加しました')
  }

  const updateAllergyForm = (childId: string, field: keyof AllergyFormState, value: string) => {
    setAllergyForms(prev => ({
      ...prev,
      [childId]: {
        ...prev[childId],
        [field]: value
      }
    }))
  }

  const addAllergy = async (childId: string) => {
    const form = allergyForms[childId]
    const allergenName = form.customAllergen || form.selectedAllergen
    
    if (!allergenName || allergenName === 'その他') {
      toast.error('アレルゲンを選択してください')
      return
    }

    const { error } = await supabase
      .from('allergies')
      .insert({
        child_id: childId,
        allergen_name: allergenName,
        severity: form.severity
      })

    if (error) {
      toast.error('エラーが発生しました')
      return
    }

    await loadProfile(user.id)
    
    // フォームをリセット
    setAllergyForms(prev => ({
      ...prev,
      [childId]: {
        selectedAllergen: '',
        customAllergen: '',
        severity: '中度'
      }
    }))
    
    toast.success('アレルギー情報を追加しました')
  }

  const removeAllergy = async (allergyId: string) => {
    const { error } = await supabase
      .from('allergies')
      .delete()
      .eq('id', allergyId)

    if (error) {
      toast.error('エラーが発生しました')
      return
    }

    await loadProfile(user.id)
    toast.success('アレルギー情報を削除しました')
  }

  const removeChild = async (childId: string) => {
    if (!confirm('お子さんの情報を削除してもよろしいですか？\nアレルギー情報も全て削除されます。')) {
      return
    }

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId)

    if (error) {
      toast.error('エラーが発生しました')
      return
    }

    // フォーム状態からも削除
    setAllergyForms(prev => {
      const newForms = { ...prev }
      delete newForms[childId]
      return newForms
    })

    await loadProfile(user.id)
    toast.success('お子さんの情報を削除しました')
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">お子さんの情報</h2>

        {/* 子供の追加 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>お子さんを追加</CardTitle>
            <CardDescription>
              ニックネームと生年月を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="childName">ニックネーム</Label>
                <Input
                  id="childName"
                  placeholder="たろう"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birthYear">生年（西暦）</Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="2020"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="birthMonth">生月</Label>
                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}月
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addChild} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 登録済みの子供 */}
        {children.map((child) => (
          <Card key={child.id} className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👶</span>
                  {child.nickname}
                  {child.birth_year && child.birth_month && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({child.birth_year}年{child.birth_month}月生まれ)
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChild(child.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">登録済みアレルギー</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {child.allergies?.map((allergy: any) => (
                    <Badge 
                      key={allergy.id}
                      variant={allergy.severity === 'アナフィラキシー' ? 'destructive' : 'default'}
                      className="flex items-center gap-1"
                    >
                      {allergy.allergen_name} ({allergy.severity})
                      <X 
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeAllergy(allergy.id)}
                      />
                    </Badge>
                  ))}
                  {(!child.allergies || child.allergies.length === 0) && (
                    <p className="text-sm text-gray-500">まだ登録されていません</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">アレルギーを追加</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>アレルゲン</Label>
                    <Select 
                      value={allergyForms[child.id]?.selectedAllergen || ''} 
                      onValueChange={(value) => updateAllergyForm(child.id, 'selectedAllergen', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_ALLERGENS.map((allergen) => (
                          <SelectItem key={allergen} value={allergen}>
                            {allergen}
                          </SelectItem>
                        ))}
                        <SelectItem value="その他">その他</SelectItem>
                      </SelectContent>
                    </Select>
                    {allergyForms[child.id]?.selectedAllergen === 'その他' && (
                      <Input
                        className="mt-2"
                        placeholder="アレルゲン名を入力"
                        value={allergyForms[child.id]?.customAllergen || ''}
                        onChange={(e) => updateAllergyForm(child.id, 'customAllergen', e.target.value)}
                      />
                    )}
                  </div>
                  <div>
                    <Label>重症度</Label>
                    <Select 
                      value={allergyForms[child.id]?.severity || '中度'} 
                      onValueChange={(value) => updateAllergyForm(child.id, 'severity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="軽度">軽度</SelectItem>
                        <SelectItem value="中度">中度</SelectItem>
                        <SelectItem value="重度">重度</SelectItem>
                        <SelectItem value="アナフィラキシー">アナフィラキシー</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => addAllergy(child.id)}
                      className="w-full"
                    >
                      追加
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {children.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">まだお子さんの情報が登録されていません</p>
              <p className="text-sm text-gray-400 mt-2">上のフォームから追加してください</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}