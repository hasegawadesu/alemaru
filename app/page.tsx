import { AuthForm } from '@/components/auth-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌟 アレマル
          </h1>
          <p className="text-lg text-gray-600">
            アレっ子も食べたい、が叶う場所
          </p>
        </div>
        
        <AuthForm />
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">🍴</div>
            <h3 className="font-semibold mb-2">安心して外食</h3>
            <p className="text-sm text-gray-600">
              アレルギー対応の店舗情報を
              実際に利用した家族が共有
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="font-semibold mb-2">買い物も安心</h3>
            <p className="text-sm text-gray-600">
              使える代替食品の情報を
              みんなでシェア
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="font-semibold mb-2">仲間とつながる</h3>
            <p className="text-sm text-gray-600">
              同じ悩みを持つ家族と
              情報交換できる
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}