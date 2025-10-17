import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { uploadImage, validateImageFile } from '../utils/storage'
import { useAuthStore } from '../store/authStore'
import Card from '../components/common/Card'
import Button from '../components/common/Button'

function StorageTest() {
  const user = useAuthStore((state) => state.user)
  const [testResults, setTestResults] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const addResult = (message, type = 'info') => {
    setTestResults((prev) => [...prev, { message, type, time: new Date().toLocaleTimeString() }])
  }

  // Test 1: Check if bucket exists
  const testBucketExists = async () => {
    addResult('🔍 Testing: Bucket existence...', 'info')
    try {
      const { data, error } = await supabase.storage.listBuckets()

      if (error) {
        addResult(`❌ Error listing buckets: ${error.message}`, 'error')
        return
      }

      const postImagesBucket = data.find((bucket) => bucket.name === 'post-images')

      if (postImagesBucket) {
        addResult(
          `✅ Bucket 'post-images' exists! Public: ${postImagesBucket.public}`,
          'success'
        )
      } else {
        addResult(`❌ Bucket 'post-images' not found`, 'error')
      }
    } catch (err) {
      addResult(`❌ Exception: ${err.message}`, 'error')
    }
  }

  // Test 2: List files in bucket
  const testListFiles = async () => {
    addResult('🔍 Testing: List files in bucket...', 'info')
    try {
      const { data, error } = await supabase.storage.from('post-images').list()

      if (error) {
        addResult(`❌ Error listing files: ${error.message}`, 'error')
        return
      }

      addResult(`✅ Successfully listed files. Count: ${data.length}`, 'success')
    } catch (err) {
      addResult(`❌ Exception: ${err.message}`, 'error')
    }
  }

  // Test 3: Upload test file
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      addResult(`❌ File validation failed: ${validation.error}`, 'error')
      return
    }

    setSelectedFile(file)
    addResult(`✅ File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, 'success')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const testUpload = async () => {
    if (!selectedFile) {
      addResult('❌ Please select a file first', 'error')
      return
    }

    if (!user?.id) {
      addResult('❌ User not logged in', 'error')
      return
    }

    setLoading(true)
    addResult(`🔍 Testing: Upload file "${selectedFile.name}"...`, 'info')

    try {
      const result = await uploadImage(selectedFile, user.id)

      if (result.success) {
        addResult(`✅ Upload successful!`, 'success')
        addResult(`📎 URL: ${result.url}`, 'success')
        setUploadedUrl(result.url)
      } else {
        addResult(`❌ Upload failed: ${result.error}`, 'error')
      }
    } catch (err) {
      addResult(`❌ Exception: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Test 4: Check user authentication
  const testAuth = () => {
    addResult('🔍 Testing: User authentication...', 'info')
    if (user?.id) {
      addResult(`✅ User logged in: ${user.username} (ID: ${user.id})`, 'success')
    } else {
      addResult(`❌ User not logged in`, 'error')
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setTestResults([])
    testAuth()
    await testBucketExists()
    await testListFiles()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Supabase Storage 테스트
      </h1>

      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">자동 테스트</h2>
        <Button onClick={runAllTests}>모든 테스트 실행</Button>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">이미지 업로드 테스트</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="mb-2"
          />
        </div>

        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-xs h-auto border border-gray-300 rounded"
            />
          </div>
        )}

        <Button onClick={testUpload} disabled={!selectedFile || loading}>
          {loading ? '업로드 중...' : '업로드 테스트'}
        </Button>

        {uploadedUrl && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="font-medium text-green-900 mb-2">업로드된 이미지:</p>
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="max-w-md h-auto border border-gray-300 rounded mb-2"
            />
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {uploadedUrl}
            </a>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">테스트 결과</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500">테스트를 실행하세요</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded text-sm ${
                  result.type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : result.type === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <span className="text-gray-500 text-xs mr-2">[{result.time}]</span>
                {result.message}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default StorageTest
