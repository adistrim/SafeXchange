'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function VerifyEmail({ params }) {
  const [status, setStatus] = useState('verifying')
  const router = useRouter()
  const { token } = params

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/client/verify/${token}`);
        console.log('Response Received:', response);
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };
  
    verifyEmail();
  }, [token]);  



  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Verifying your SafeXchange account</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <Alert>
              <AlertDescription>Verifying your email...</AlertDescription>
            </Alert>
          )}
          {status === 'success' && (
            <>
              <Alert>
                <AlertDescription>Your email has been successfully verified!</AlertDescription>
              </Alert>
              <Button onClick={handleLogin} className="mt-4">Go to Login</Button>
            </>
          )}
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>
                There was an error verifying your email. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
