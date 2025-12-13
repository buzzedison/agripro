'use client'

import { useState, useActionState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Loader2, Upload, X, DollarSign, Tag, FileText,
    Package, CheckCircle, AlertCircle, Image as ImageIcon
} from 'lucide-react'
import Image from 'next/image'

interface Category {
    id: string
    name: string
    slug: string
}

interface ProductData {
    name: string
    description: string
    price: number
    unit: string
    categoryId: string
    stockStatus: string
    isOrganic: boolean
    imageUrls: string[]
}

interface ProductFormProps {
    categories: Category[]
    userId: string
    initialData?: ProductData
    action: (prevState: any, formData: FormData) => Promise<any>
    submitLabel?: string
}

export default function ProductForm({ categories, userId, initialData, action, submitLabel = 'Publish Product' }: ProductFormProps) {
    const [state, formAction] = useActionState(action, null)
    const [uploading, setUploading] = useState(false)
    const [imageUrls, setImageUrls] = useState<string[]>(initialData?.imageUrls || [])
    const [previews, setPreviews] = useState<string[]>(initialData?.imageUrls || [])

    const supabase = createClient()

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const files = Array.from(e.target.files)
        const newUrls: string[] = []
        const newPreviews: string[] = []

        try {
            for (const file of files) {
                // Create local preview
                const previewUrl = URL.createObjectURL(file)
                newPreviews.push(previewUrl)

                // Upload to Supabase
                // Path: {userId}/products/{timestamp}-{filename}
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `${userId}/products/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('post-images') // Reusing existing bucket for now
                    .upload(filePath, file)

                if (uploadError) {
                    throw uploadError
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(filePath)

                newUrls.push(publicUrl)
            }

            setPreviews(prev => [...prev, ...newPreviews])
            setImageUrls(prev => [...prev, ...newUrls])
        } catch (error) {
            console.error('Error uploading images:', error)
            alert('Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <form action={formAction} className="space-y-8">
            {/* Hidden input for images */}
            <input type="hidden" name="imageUrls" value={imageUrls.join(',')} />

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                        Basic Information
                    </h3>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name
                        </label>
                        <div className="relative">
                            <i className="absolute left-3 top-3 text-gray-400">
                                <Tag className="w-4 h-4" />
                            </i>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                defaultValue={initialData?.name}
                                placeholder="e.g. Organic Tomatoes"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        {state?.fieldErrors?.name && (
                            <p className="text-red-500 text-xs mt-1">{state.fieldErrors.name[0]}</p>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                Price (GHS)
                            </label>
                            <div className="relative">
                                <i className="absolute left-3 top-3 text-gray-400">
                                    <DollarSign className="w-4 h-4" />
                                </i>
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    step="0.01"
                                    required
                                    defaultValue={initialData?.price}
                                    placeholder="0.00"
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <div className="relative">
                                <i className="absolute left-3 top-3 text-gray-400">
                                    <Package className="w-4 h-4" />
                                </i>
                                <input
                                    type="text"
                                    name="unit"
                                    id="unit"
                                    required
                                    defaultValue={initialData?.unit}
                                    placeholder="e.g. kg, basket, piece"
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            name="categoryId"
                            id="categoryId"
                            required
                            defaultValue={initialData?.categoryId}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                name="isOrganic"
                                defaultChecked={initialData?.isOrganic}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className="text-gray-700">This product is Organic</span>
                        </label>
                    </div>
                </div>

                {/* Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                        Product Details
                    </h3>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <i className="absolute left-3 top-3 text-gray-400">
                                <FileText className="w-4 h-4" />
                            </i>
                            <textarea
                                name="description"
                                id="description"
                                required
                                rows={4}
                                defaultValue={initialData?.description}
                                placeholder="Describe your product..."
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Provide details about freshness, origin, best uses, etc.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Status
                        </label>
                        <select
                            name="stockStatus"
                            id="stockStatus"
                            defaultValue={initialData?.stockStatus || "in_stock"}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                        Product Images
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                <Image
                                    src={url}
                                    alt={`Preview ${idx}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors">
                            {uploading ? (
                                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 font-medium">Add Image</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploading}
                            />
                        </label>
                    </div>
                    {state?.fieldErrors?.imageUrls && (
                        <p className="text-red-500 text-xs mt-1">Please add at least one image</p>
                    )}
                </div>
            </div>

            {state?.error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {state.error}
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {uploading ? 'Uploading Images...' : submitLabel}
                </button>
            </div>
        </form>
    )
}
