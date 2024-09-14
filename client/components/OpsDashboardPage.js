'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud } from "lucide-react"

export default function OpsDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [file, setFile] = useState(null)
    const [uploadStatus, setUploadStatus] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('opsToken')
            if (!token) {
                router.push('/ops/login')
                return
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            try {
                const response = await fetch(`${apiUrl}/api/ops/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    setIsAuthenticated(true)
                } else {
                    router.push('/ops/login')
                }
            } catch (error) {
                console.error('Authentication error:', error)
                router.push('/ops/login')
            } finally {
                setIsLoading(false)
            }
        }
        verifyToken()
    }, [router])

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0]
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile)
            setUploadStatus(null)
        } else {
            setFile(null)
            setUploadStatus({ type: 'error', message: 'Please select a valid .pptx, .docx, or .xlsx file.' })
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus({ type: 'error', message: 'Please select a file to upload.' })
            return
        }

        setUploadStatus({ type: 'loading', message: 'Uploading file...' })

        const formData = new FormData()
        formData.append('file', file)

        try {
            const token = localStorage.getItem('opsToken')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            const response = await fetch(`${apiUrl}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                setUploadStatus({ type: 'success', message: `File uploaded successfully! URL: ${data.url}` })
                setFile(null)
            } else {
                const errorData = await response.json()
                setUploadStatus({ type: 'error', message: errorData.detail || 'Failed to upload file.' })
            }
        } catch (error) {
            console.error('Upload error:', error)
            setUploadStatus({ type: 'error', message: 'An error occurred while uploading the file.' })
        }
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Ops Dashboard</CardTitle>
                    <CardDescription>Upload files to AWS S3</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pptx,.docx,.xlsx"
                        />
                        <Button onClick={handleUpload} disabled={!file} className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
                        </Button>
                        {uploadStatus && (
                            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
                                <AlertTitle>{uploadStatus.type === 'error' ? 'Error' : 'Status'}</AlertTitle>
                                <AlertDescription>{uploadStatus.message}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
