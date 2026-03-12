"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { SongProvider } from "@/contexts/SongContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GroupProvider } from "@/contexts/groups";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";

import "@/index.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Grace Music</title>
        <meta name="description" content="Musical Website" />
        <meta name="author" content="Arkin" />
        <meta property="og:title" content="Grace Music" />
        <meta property="og:description" content="Musical Website" />
        <meta property="og:type" content="website" />
      </head>
      <body>
        <GoogleOAuthProvider clientId="810353645969-dmsbou0itk6475tap5j8qq7ejvs68dm7.apps.googleusercontent.com">
          <ThemeProvider>
            <AuthProvider>
              <OrganizationProvider>
                <SongProvider>
                  <GroupProvider>
                    <Navigation />
                    <main className="min-h-[calc(100vh-64px)] bg-background">
                      {children}
                    </main>
                    <Toaster />
                  </GroupProvider>
                </SongProvider>
              </OrganizationProvider>
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
