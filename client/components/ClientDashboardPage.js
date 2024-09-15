'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, LogOut } from "lucide-react";

export default function ClientDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [files, setFiles] = useState([]);
    const [downloadStatus, setDownloadStatus] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('clientToken');
            if (!token) {
                router.push('/login');
                return;
            }
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            try {
                const response = await fetch(`${apiUrl}/api/client/verify`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setIsAuthenticated(true);
                    console.log(userData);
                    setIsVerified(userData.is_verified);
                    if (userData.is_verified) {
                        fetchFiles();
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };
        verifyToken();
    }, [router]);

    const fetchFiles = async () => {
        const token = localStorage.getItem('clientToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        try {
            const response = await fetch(`${apiUrl}/api/files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFiles(data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleDownload = async (filename) => {
        setDownloadStatus({ type: 'loading', message: 'Initiating download...' });
        const token = localStorage.getItem('clientToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        try {
            const linkResponse = await fetch(`${apiUrl}/api/download-file/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!linkResponse.ok) {
                throw new Error('Failed to get download link');
            }

            const linkData = await linkResponse.json();
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

    const handleLogout = () => {
        localStorage.removeItem('clientToken');
        router.push('/login');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    if (!isVerified) {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Email Verification Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Please verify your email address to access the dashboard.</p>
                        <p>Check your inbox for a verification email and click on the link to verify your account.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Client Dashboard</h1>
                <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Files</CardTitle>
                    <CardDescription>Files available for download</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Filename</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((filename) => (
                                <TableRow key={filename}>
                                    <TableCell>{filename}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleDownload(filename)}>
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </Button>
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
                </CardContent>
            </Card>
        </div>
    );
}