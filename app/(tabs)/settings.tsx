import { useClerk, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { styled } from "nativewind";
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView, } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const ViewStyled = styled(View);
const TextStyled = styled(Text);
const PressableStyled = styled(Pressable);

const settings = () => {
  const { signOut } = useClerk()
  const { user } = useUser()
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ViewStyled className="flex-1 px-6 py-8">
        {/* Header */}
        <TextStyled className="text-3xl font-sans-bold text-primary mb-8">
          Settings
        </TextStyled>

        {/* Account Section */}
        <ViewStyled className="bg-card border border-border rounded-2xl p-6 mb-8">
          <TextStyled className="text-sm font-sans-semibold text-muted-foreground mb-3">
            Account
          </TextStyled>
          <TextStyled className="text-base text-primary mb-2">
            {user?.emailAddresses?.[0]?.emailAddress || 'User'}
          </TextStyled>
          <TextStyled className="text-xs text-muted-foreground">
            ID: {user?.id?.slice(0, 12)}...
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
    </SafeAreaView>
  )
}

export default settings