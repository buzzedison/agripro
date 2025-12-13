import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProductForm from '../../new/product-form'
import { updateProduct } from '../../actions'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function EditProductPage({ params }: PageProps) {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/login?redirectTo=/greenmarket/products/${slug}/edit`)
    }

    // Fetch product with vendor info
    const { data: product } = await supabase
        .from('trade_products')
        .select(`
            *,
            vendor:trade_vendors(user_id)
        `)
        .eq('slug', slug)
        .single()

    if (!product) {
        notFound()
    }

    // Verify ownership
    if (!product.vendor || product.vendor.user_id !== user.id) {
        // Redirect to product page if not owner
        redirect(`/greenmarket/products/${slug}`)
    }

    // Fetch categories
    const { data: categories } = await supabase
        .from('trade_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order')

    // Transform to ProductData
    const initialData = {
        name: product.name,
        description: product.description,
        price: product.price,
        unit: product.unit,
        categoryId: product.category_id,
        stockStatus: product.stock_status,
        isOrganic: product.is_organic,
        imageUrls: product.images || []
    }

    // Bind the update action with the product ID
    const updateProductWithId = updateProduct.bind(null, product.id)

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    href={`/greenmarket/products/${slug}`}
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Product
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                        <p className="text-gray-600 mt-1">Update product details</p>
                    </div>
                </div>

                <ProductForm
                    categories={categories || []}
                    userId={user.id}
                    initialData={initialData}
                    action={updateProductWithId}
                    submitLabel="Save Changes"
                />
            </div>
        </div>
    )
}
