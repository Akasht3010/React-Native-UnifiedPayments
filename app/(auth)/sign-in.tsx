import { getUserFriendlyError, validateEmail, validatePassword } from '@/lib/auth'
import { useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import { styled } from 'nativewind'
import React from 'react'
import { ActivityIndicator, Keyboard, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SafeAreaViewStyled = styled(SafeAreaView);
const ViewStyled = styled(View);
const TextStyled = styled(Text);
const TextInputStyled = styled(TextInput);
const PressableStyled = styled(Pressable);

export default function SignInScreen() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [emailError, setEmailError] = React.useState<string>()
  const [passwordError, setPasswordError] = React.useState<string>()
  const [generalError, setGeneralError] = React.useState<string>()
  const [isVerifying, setIsVerifying] = React.useState(false)

  const isLoading = fetchStatus === 'fetching';
  const isMFARequired = signIn?.status === 'needs_client_trust';
  const canSubmit = email && password && !isLoading;

  const handleSignIn = async () => {
    setGeneralError(undefined)
    setEmailError(undefined)
    setPasswordError(undefined)
    
    Keyboard.dismiss()

    // Validate inputs
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error)
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error)
      return
    }

    try {
      await signIn.password({
        emailAddress: email,
        password,
      })

      if (signIn.status === 'complete') {
        // Auto-finalize and navigate
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return
            }
            router.replace('/(home)')
          },
        })
      } else if (signIn.status === 'needs_client_trust') {
        // MFA required - send code
        setIsVerifying(true)
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code',
        )
        
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode()
        }
      }
    } catch (error: any) {
      setGeneralError(getUserFriendlyError(error))
    }
  }

  const handleVerifyCode = async () => {
    setGeneralError(undefined)
    Keyboard.dismiss()

    if (!code.trim()) {
      setGeneralError('Please enter the verification code')
      return
    }

    try {
      await signIn.mfa.verifyEmailCode({ code })

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return
            }
            router.replace('/(home)')
          },
        })
      }
    } catch (error: any) {
      setGeneralError(getUserFriendlyError(error))
    }
  }

  const handleResendCode = async () => {
    try {
      await signIn.mfa.sendEmailCode()
      setGeneralError(undefined)
    } catch (error: any) {
      setGeneralError(getUserFriendlyError(error))
    }
  }

  const handleStartOver = () => {
    setIsVerifying(false)
    setCode('')
    setGeneralError(undefined)
    signIn.reset()
  }

  if (isVerifying && isMFARequired) {
    return (
      <SafeAreaViewStyled className="flex-1 bg-background">
        <ViewStyled className="flex-1 justify-center px-6 py-8">
          <ViewStyled className="mb-8">
            <TextStyled className="text-3xl font-sans-bold text-primary mb-2">
              Verify your email
            </TextStyled>
            <TextStyled className="text-base text-muted-foreground leading-6">
              We've sent a verification code to {email}
            </TextStyled>
          </ViewStyled>

          {generalError && (
            <ViewStyled className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
              <TextStyled className="text-destructive text-sm font-sans-medium">
                {generalError}
              </TextStyled>
            </ViewStyled>
          )}

          <ViewStyled className="gap-4 mb-8">
            <ViewStyled>
              <TextStyled className="text-sm font-sans-semibold text-primary mb-2">
                Verification code
              </TextStyled>
              <TextInputStyled
                className="bg-card border border-border rounded-lg px-4 py-3 text-base text-primary font-sans-medium"
                placeholder="000000"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
                textAlign="center"
              />
            </ViewStyled>
          </ViewStyled>

          <PressableStyled
            onPress={handleVerifyCode}
            disabled={!code.trim() || isLoading}
            className={`rounded-lg py-4 items-center justify-center mb-4 ${
              code.trim() && !isLoading
                ? 'bg-accent'
                : 'bg-accent/50'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <TextStyled className="text-white font-sans-bold text-base">
                Verify
              </TextStyled>
            )}
          </PressableStyled>

          <PressableStyled
            onPress={handleResendCode}
            disabled={isLoading}
            className="py-3 items-center mb-4"
          >
            <TextStyled className="text-accent font-sans-semibold text-base">
              Didn't receive a code?
            </TextStyled>
          </PressableStyled>

          <PressableStyled
            onPress={handleStartOver}
            disabled={isLoading}
            className="py-3 items-center"
          >
            <TextStyled className="text-muted-foreground font-sans-medium text-base">
              Start over
            </TextStyled>
          </PressableStyled>
        </ViewStyled>
      </SafeAreaViewStyled>
    )
  }

  return (
    <SafeAreaViewStyled className="flex-1 bg-background">
      <ViewStyled className="flex-1 justify-center px-6 py-8">
        <ViewStyled className="mb-12">
          <TextStyled className="text-4xl font-sans-bold text-primary mb-2">
            Welcome back
          </TextStyled>
          <TextStyled className="text-base text-muted-foreground leading-6">
            Sign in to continue managing your subscriptions
          </TextStyled>
        </ViewStyled>

        {generalError && (
          <ViewStyled className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
            <TextStyled className="text-destructive text-sm font-sans-medium">
              {generalError}
            </TextStyled>
          </ViewStyled>
        )}

        <ViewStyled className="gap-4 mb-8">
          {/* Email field */}
          <ViewStyled>
            <TextStyled className="text-sm font-sans-semibold text-primary mb-2">
              Email
            </TextStyled>
            <TextInputStyled
              className={`bg-card border ${
                emailError ? 'border-destructive' : 'border-border'
              } rounded-lg px-4 py-3 text-base text-primary font-sans-medium`}
              placeholder="you@example.com"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setEmailError(undefined)
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              selectTextOnFocus
            />
            {emailError && (
              <TextStyled className="text-destructive text-xs font-sans-medium mt-1.5">
                {emailError}
              </TextStyled>
            )}
          </ViewStyled>

          {/* Password field */}
          <ViewStyled>
            <TextStyled className="text-sm font-sans-semibold text-primary mb-2">
              Password
            </TextStyled>
            <TextInputStyled
              className={`bg-card border ${
                passwordError ? 'border-destructive' : 'border-border'
              } rounded-lg px-4 py-3 text-base text-primary font-sans-medium`}
              placeholder="Enter your password"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={password}
              onChangeText={(text) => {
                setPassword(text)
                setPasswordError(undefined)
              }}
              secureTextEntry
              editable={!isLoading}
            />
            {passwordError && (
              <TextStyled className="text-destructive text-xs font-sans-medium mt-1.5">
                {passwordError}
              </TextStyled>
            )}
          </ViewStyled>
        </ViewStyled>

        {/* Sign In Button */}
        <PressableStyled
          onPress={handleSignIn}
          disabled={!canSubmit}
          className={`rounded-lg py-4 items-center justify-center mb-4 ${
            canSubmit ? 'bg-accent' : 'bg-accent/50'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <TextStyled className="text-white font-sans-bold text-base">
              Continue
            </TextStyled>
          )}
        </PressableStyled>

        {/* Sign Up Link */}
        <ViewStyled className="flex-row items-center justify-center">
          <TextStyled className="text-muted-foreground font-sans-medium text-base">
            Don't have an account?{' '}
          </TextStyled>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <TextStyled className="text-accent font-sans-bold text-base">
                Create one
              </TextStyled>
            </Pressable>
          </Link>
        </ViewStyled>
      </ViewStyled>
    </SafeAreaViewStyled>
  )
}
