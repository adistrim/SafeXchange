'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UploadCloud, Download, Trash2, LogOut } from "lucide-react"

export default function OpsDashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [file, setFile] = useState(null)
    const [uploadStatus, setUploadStatus] = useState(null)
    const [downloadStatus, setDownloadStatus] = useState(null)
    const [deleteStatus, setDeleteStatus] = useState(null)
    const [files, setFiles] = useState([])
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
                    fetchFiles()
                } else {
                    router.push('/ops/login')
                }
            } catch (error) {
                router.push('/ops/login')
            } finally {
                setIsLoading(false)
            }
        }
        verifyToken()
    }, [router])

    const fetchFiles = async () => {
        const token = localStorage.getItem('opsToken')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        try {
            const response = await fetch(`${apiUrl}/api/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setFiles(data)
            }
        } catch (error) {
            console.error('Error fetching files:', error)
        }
    }

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
                setUploadStatus({ type: 'success', message: 'File uploaded successfully!' })
                setFile(null)
                fetchFiles()
            } else {
                const errorData = await response.json()
                setUploadStatus({ type: 'error', message: errorData.detail || 'Failed to upload file.' })
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: 'An error occurred while uploading the file.' })
        }
    }

    const handleDownload = async (filename) => {
        setDownloadStatus({ type: 'loading', message: 'Initiating download...' });
        const token = localStorage.getItem('opsToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            // Get the secure download link
            const linkResponse = await fetch(`${apiUrl}/api/download-file/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!linkResponse.ok) {
                throw new Error('Failed to get download link');
            }

            const linkData = await linkResponse.json();

            // Using the secure link to download the file
            const fileResponse = await fetch(`${apiUrl}${linkData.download_link}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!fileResponse.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await fileResponse.blob();

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadStatus({ type: 'success', message: 'File downloaded successfully!' });
            setTimeout(() => setDownloadStatus(null), 3000);
        } catch (error) {
            setDownloadStatus({ type: 'error', message: `Error downloading file: ${error.message}` });
        }
    };

    const handleDelete = async (filename) => {
        setDeleteStatus({ type: 'loading', message: 'Deleting file...' });
        const token = localStorage.getItem('opsToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            const response = await fetch(`${apiUrl}/api/delete-file/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            const data = await response.json();
            setDeleteStatus({ type: 'success', message: data.message });
            fetchFiles();
            setTimeout(() => setDeleteStatus(null), 3000);
        } catch (error) {
            setDeleteStatus({ type: 'error', message: `Error deleting file: ${error.message}` });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('opsToken')
        router.push('/ops/login')
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Ops Dashboard</h1>
                <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
            
            <Card className="w-full mb-4">
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>Upload files to secure storage</CardDescription>
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

            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Filename</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((filename) => (
                                <TableRow key={filename}>
                                    <TableCell>{filename}</TableCell>
                                    <TableCell>
                                        <div className="space-x-2">
                                            <Button onClick={() => handleDownload(filename)}>
                                                <Download className="mr-2 h-4 w-4" /> Download
                                            </Button>
                                            <Button onClick={() => handleDelete(filename)} variant="destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {downloadStatus && (
                        <Alert className="mt-4" variant={downloadStatus.type === 'error' ? 'destructive' : 'default'}>
                            <AlertTitle>{downloadStatus.type === 'error' ? 'Error' : 'Status'}</AlertTitle>
                            <AlertDescription>{downloadStatus.message}</AlertDescription>
                        </Alert>
                    )}
                    {deleteStatus && (
                        <Alert className="mt-4" variant={deleteStatus.type === 'error' ? 'destructive' : 'default'}>
                            <AlertTitle>{deleteStatus.type === 'error' ? 'Error' : 'Status'}</AlertTitle>
                            <AlertDescription>{deleteStatus.message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
