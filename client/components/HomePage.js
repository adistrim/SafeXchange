"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { CircleChevronRight, Upload, Database, Server, Cloud, Package, WandSparkles, AppWindow, GitBranch } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Welcome to SafeXchange
                </h1>
                <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    A secure file-sharing platform for uploading and accessing encrypted files
                </p>
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center">
                    <Button className="w-48" variant="default" onClick={() => handleNavigation('/signup')}>
                        Create Account <CircleChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="w-48" variant="outline" onClick={() => handleNavigation('/dashboard')}>
                        Go to Dashboard<Upload className="ml-2 h-4 w-4" />
                    </Button>
                    <Button className="w-48" variant="secondary" onClick={() => handleNavigation('/ops/dashboard')}>
                        OPS User<Database className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Our Tech Stack</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                    {[
                        { name: 'Next.js', icon: <AppWindow className="h-8 w-8 mb-2" />, description: 'Frontend' },
                        { name: 'shadcn & Tailwind', icon: <WandSparkles className="h-8 w-8 mb-2" />, description: 'Design' },
                        { name: 'FastAPI', icon: <Server className="h-8 w-8 mb-2" />, description: 'Server' },
                        { name: 'AWS S3', icon: <Database className="h-8 w-8 mb-2" />, description: 'Storage' },
                        { name: 'AWS CloudFront', icon: <Cloud className="h-8 w-8 mb-2" />, description: 'CDN' },
                        { name: 'Docker', icon: <Package className="h-8 w-8 mb-2" />, description: 'Containerization' },
                        { name: 'MongoDB', icon: <Database className="h-8 w-8 mb-2" />, description: 'Database' },
                        { name: 'Git & GitHub', icon: <GitBranch className="h-8 w-8 mb-2" />, description: 'Version Control' },
                    ].map((tech, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-center">{tech.icon}</div>
                            <h3 className="font-semibold text-gray-800">{tech.name}</h3>
                            <p className="text-sm text-gray-600">{tech.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="text-sm text-gray-600">
                Developed by <a href="https://adistrim.in" className="underline hover:text-gray-900 transition-colors">adistrim</a>
            </footer>
        </div>
    );
}
