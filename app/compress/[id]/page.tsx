'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CompressPage({ params }: { params: Promise<{ id: string }> }) {
  const [singularValues, setSingularValues] = useState(100)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Unwrap params using React.use()
  const resolvedParams = use(params)

  const getCompressionZone = (value: number) => {
    if (value > 200) return 'high'
    if (value > 100) return 'medium-high'
    if (value >= 50) return 'optimal'
    if (value > 20) return 'medium-low'
    return 'low'
  }

  // Load original image
  useEffect(() => {
    const fetchImage = async () => {
      try {
        console.log('Fetching original image:', resolvedParams.id)
        const response = await fetch(`http://127.0.0.1:8000/api/image/${resolvedParams.id}`)
        console.log('Original image response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        console.log('Created URL for original image:', imageUrl)
        setOriginalImage(imageUrl)
      } catch (error) {
        console.error('Error fetching original image:', error)
        setError('Failed to load original image')
      }
    }

    if (resolvedParams.id) {
      fetchImage()
    }
  }, [resolvedParams.id])

  // Compress image when slider changes
  useEffect(() => {
    const compressImage = async () => {
      if (!resolvedParams.id) return
      
      setIsLoading(true)
      try {
        console.log('Compressing image:', resolvedParams.id, 'with values:', singularValues)
        const response = await fetch(
          `http://127.0.0.1:8000/api/compress/${resolvedParams.id}?values=${singularValues}`
        )
        console.log('Compression response status:', response.status)

        if (!response.ok) {
          throw new Error(`Failed to compress image: ${response.statusText}`)
        }

        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        console.log('Created URL for compressed image:', imageUrl)
        setCompressedImage(imageUrl)
        setError(null)
      } catch (error) {
        console.error('Error compressing image:', error)
        setError('Error during compression')
      } finally {
        setIsLoading(false)
      }
    }

    compressImage()
  }, [resolvedParams.id, singularValues])

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage)
      if (compressedImage) URL.revokeObjectURL(compressedImage)
    }
  }, [originalImage, compressedImage])

  const compressionZone = getCompressionZone(singularValues)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-center">SVD Image Compression</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Original Image (Grayscale)</h2>
            <div className="relative flex items-center justify-center w-full h-64 border-2 border-gray-300 rounded-lg bg-gray-50">
              {originalImage ? (
                <Image 
                  src={originalImage} 
                  alt="Original" 
                  fill 
                  className="object-contain" 
                  unoptimized 
                />
              ) : (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Compressed Image</h2>
            <div className="relative flex items-center justify-center w-full h-64 border-2 border-gray-300 rounded-lg bg-gray-50">
              {compressedImage ? (
                <Image 
                  src={compressedImage} 
                  alt="Compressed" 
                  fill 
                  className="object-contain" 
                  unoptimized 
                />
              ) : (
                <div className="flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  ) : (
                    <p className="text-sm text-gray-500">Adjust slider to compress</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="singular-values" className="text-sm font-medium">
              Singular Values: {singularValues}
            </label>
            <Button
              onClick={() => setSingularValues(100)}
              size="sm"
              variant="outline"
            >
              Reset
            </Button>
          </div>
          <Slider
            id="singular-values"
            min={1}
            max={300}
            step={1}
            value={[singularValues]}
            onValueChange={(value) => setSingularValues(value[0])}
            className="w-full"
          />
        </div>

        <div className="text-sm mt-4 space-y-2 p-4 border rounded-lg">
          <p className="font-medium mb-2">Compression level explanation:</p>
          <ul className="space-y-2">
            <li className={cn(
              "p-2 rounded transition-colors",
              compressionZone === 'high' ? "bg-blue-100 dark:bg-blue-900" : ""
            )}>
              <span className="font-medium">High Quality (200-300):</span> Best quality, largest file size
            </li>
            <li className={cn(
              "p-2 rounded transition-colors",
              compressionZone === 'medium-high' ? "bg-blue-100 dark:bg-blue-900" : ""
            )}>
              <span className="font-medium">Medium-High (100-200):</span> Good quality, moderate file size
            </li>
            <li className={cn(
              "p-2 rounded transition-colors",
              compressionZone === 'optimal' ? "bg-green-100 dark:bg-green-900" : ""
            )}>
              <span className="font-medium">Optimal Range (50-100):</span> Best balance of quality and compression
            </li>
            <li className={cn(
              "p-2 rounded transition-colors",
              compressionZone === 'medium-low' ? "bg-yellow-100 dark:bg-yellow-900" : ""
            )}>
              <span className="font-medium">Medium-Low (20-50):</span> More compression, noticeable quality loss
            </li>
            <li className={cn(
              "p-2 rounded transition-colors",
              compressionZone === 'low' ? "bg-red-100 dark:bg-red-900" : ""
            )}>
              <span className="font-medium">High Compression (1-20):</span> Smallest file size, significant quality loss
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}