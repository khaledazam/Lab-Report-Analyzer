"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUserEmail(session.user.email ?? null);
        router.push("/");
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email ?? null);
        router.push("/");
      } else {
        setUserEmail(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);


  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      alert("Check your email to confirm your account.");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Vivo Health</CardTitle>
          <CardDescription>
            Access your lab reports and AI assistant
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {userEmail ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium">{userEmail}</span>
              </p>

              <div className="flex gap-2">
                <Button onClick={() => router.push("/")} className="flex-1">
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleSignIn}
                  disabled={loading || !email || !password}
                >
                  Sign in
                </Button>

                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSignUp}
                  disabled={loading || !email || !password}
                >
                  Sign up
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
