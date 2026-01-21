import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store } from 'lucide-react'
import ProductForm from './product-form'
import { createProduct } from '../actions'

export default async function NewProductPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login?redirectTo=/greenmarket/products/new')
    }

    // Check if user is an approved vendor
    const { data: vendor } = await supabase
        .from('trade_vendors')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const disallowedStatuses = ['rejected', 'suspended']
    if (!vendor || disallowedStatuses.includes(vendor.status)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Vendor Access Required</h1>
                    <p className="text-gray-600 mb-6">
                        Your vendor account needs attention before posting products.
                    </p>
                    <Link
                        href="/greenmarket/dashboard"
                        className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Fetch categories
    const { data: categories } = await supabase
        .from('trade_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order')

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/greenmarket/dashboard"
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                        <p className="text-gray-600 mt-1">List a new item in your store</p>
                    </div>
                </div>

                <ProductForm
                    categories={categories || []}
                    userId={user.id}
                    action={createProduct}
                />
            </div>
        </div>
    )
}
