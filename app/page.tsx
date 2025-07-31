import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, Users, Shield, Heart, Star } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              アレっ子も<br />
              <span className="text-blue-600">安心して食べられる</span>場所を
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              実際に利用した家族の口コミで、本当に安心できるお店を見つけよう
            </p>
            
            {/* 検索バー（デモ用） */}
            <div className="bg-white p-2 rounded-full shadow-lg flex items-center max-w-2xl mx-auto mb-4">
              <MapPin className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="エリア・駅名で検索"
                className="flex-1 px-4 py-3 outline-none"
                disabled
              />
              <Button className="rounded-full px-8 mr-2" disabled>
                <Search className="w-4 h-4 mr-2" />
                検索
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              まずは無料登録して、お子さんの情報を登録しましょう
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            アレマルが選ばれる理由
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">当事者による本音の口コミ</h3>
              <p className="text-gray-600">
                同じアレルギーを持つ家族が実際に利用した詳細なレビューで、本当の対応力がわかります
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">安心の情報管理</h3>
              <p className="text-gray-600">
                お子さんのアレルギー情報は厳重に管理。必要な時だけ必要な情報を共有できます
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">応援し合えるコミュニティ</h3>
              <p className="text-gray-600">
                同じ悩みを持つ家族と繋がり、情報交換や励まし合いができる温かいコミュニティ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            かんたん3ステップで始める
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-semibold mb-3">無料登録</h3>
                <p className="text-gray-600">
                  メールアドレスだけで簡単に登録。すぐに使い始められます
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
                <h3 className="text-xl font-semibold mb-3">お子さんの情報登録</h3>
                <p className="text-gray-600">
                  アレルゲンと重症度を登録して、最適な情報を受け取る
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
                <h3 className="text-xl font-semibold mb-3">お店を探す・共有する</h3>
                <p className="text-gray-600">
                  安心できるお店を見つけて、あなたの体験も共有しよう
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 実績セクション */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              アレルギーっ子家族の「食べたい」を叶える
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <p className="text-blue-100">登録店舗数</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">1,200+</div>
                <p className="text-blue-100">口コミ数</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
                <p className="text-blue-100">満足度</p>
              </div>
            </div>
            <p className="text-sm text-blue-100">※デモ用の数値です</p>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
              今すぐ無料で始めましょう
            </h2>
            <AuthForm />
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">すでにアカウントをお持ちの方は</p>
              <Link href="/stores">
                <Button variant="outline" size="lg">
                  <Search className="w-4 h-4 mr-2" />
                  お店を探す（デモ）
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🌟 アレマル</h3>
            <p className="text-gray-400 mb-8">
              アレルギーっ子家族のための安心情報共有サービス
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link href="#" className="hover:text-blue-400">利用規約</Link>
              <Link href="#" className="hover:text-blue-400">プライバシーポリシー</Link>
              <Link href="#" className="hover:text-blue-400">お問い合わせ</Link>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              © 2025 アレマル. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}