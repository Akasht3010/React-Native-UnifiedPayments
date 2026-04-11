import { useAuth, useClerk, useUser } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import { styled } from 'nativewind'
import React from 'react'
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SafeAreaViewStyled = styled(SafeAreaView);
const ViewStyled = styled(View);
const TextStyled = styled(Text);
const PressableStyled = styled(Pressable);
const ImageStyled = styled(Image);

export default function HomeScreen() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  if (!isLoaded) {
    return (
      <SafeAreaViewStyled className="flex-1 bg-background">
        <ViewStyled className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#081126" />
        </ViewStyled>
      </SafeAreaViewStyled>
    )
  }

  if (!isSignedIn) {
    return (
      <SafeAreaViewStyled className="flex-1 bg-background">
        <ViewStyled className="flex-1 justify-center items-center px-6 py-8">
          <TextStyled className="text-4xl font-sans-bold text-primary mb-4 text-center">
            Welcome
          </TextStyled>
          <TextStyled className="text-base text-muted-foreground mb-12 text-center leading-6">
            Sign in to start managing your subscriptions
          </TextStyled>

          <Link href="/(auth)/sign-in" asChild>
            <PressableStyled className="bg-accent rounded-lg py-4 px-6 w-full items-center justify-center mb-4">
              <TextStyled className="text-white font-sans-bold text-base">
                Sign in
              </TextStyled>
            </PressableStyled>
          </Link>

          <Link href="/(auth)/sign-up" asChild>
            <PressableStyled className="bg-card border border-border rounded-lg py-4 px-6 w-full items-center justify-center">
              <TextStyled className="text-primary font-sans-bold text-base">
                Create account
              </TextStyled>
            </PressableStyled>
          </Link>
        </ViewStyled>
      </SafeAreaViewStyled>
    )
  }

  return (
    <SafeAreaViewStyled className="flex-1 bg-background">
      <ViewStyled className="flex-1 px-6 py-8">
        {/* Header */}
        <ViewStyled className="mb-8 flex-row items-center justify-between">
          <ViewStyled>
            <TextStyled className="text-3xl font-sans-bold text-primary">
              Welcome back
            </TextStyled>
            <TextStyled className="text-sm text-muted-foreground mt-1">
              {user?.emailAddresses?.[0]?.emailAddress || 'User'}
            </TextStyled>
          </ViewStyled>
        </ViewStyled>

        {/* Account Card */}
        <ViewStyled className="bg-card border border-border rounded-2xl p-6 mb-8">
          <TextStyled className="text-sm font-sans-semibold text-muted-foreground mb-2">
            Account Status
          </TextStyled>
          <TextStyled className="text-lg font-sans-bold text-primary mb-1">
            Active
          </TextStyled>
          <TextStyled className="text-sm text-muted-foreground">
            ID: {user?.id?.slice(0, 12)}...
          </TextStyled>
        </ViewStyled>

        {/* Quick Actions */}
        <ViewStyled className="gap-3 mb-8">
          <Link href="/(tabs)" asChild>
            <PressableStyled className="bg-accent rounded-lg py-4 px-6 items-center justify-center">
              <TextStyled className="text-white font-sans-bold text-base">
                Go to Dashboard
              </TextStyled>
            </PressableStyled>
          </Link>
        </ViewStyled>

        {/* Account Info */}
        <ViewStyled className="bg-muted rounded-lg p-4 mb-8 gap-2">
          <TextStyled className="text-xs font-sans-semibold text-muted-foreground uppercase">
            Account Details
          </TextStyled>
          <TextStyled className="text-sm text-primary">
            Email: {user?.emailAddresses?.[0]?.emailAddress}
          </TextStyled>
          <TextStyled className="text-sm text-primary">
            Created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </TextStyled>
        </ViewStyled>

        {/* Sign Out Button */}
        <PressableStyled
          onPress={handleSignOut}
          disabled={isSigningOut}
          className="bg-destructive/10 border border-destructive rounded-lg py-4 px-6 items-center justify-center"
        >
          {isSigningOut ? (
            <ActivityIndicator color="#dc2626" size="small" />
          ) : (
            <TextStyled className="text-destructive font-sans-bold text-base">
              Sign out
            </TextStyled>
          )}
        </PressableStyled>
      </ViewStyled>
    </SafeAreaViewStyled>
  )
}
