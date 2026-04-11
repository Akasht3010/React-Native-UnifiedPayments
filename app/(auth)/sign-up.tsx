import {
  getPasswordStrengthLabel,
  getUserFriendlyError,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/lib/auth'
import { useSignUp } from '@clerk/expo'
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

export default function SignUpScreen() {
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  
  const [emailError, setEmailError] = React.useState<string>()
  const [passwordError, setPasswordError] = React.useState<string>()
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<string>()
  const [generalError, setGeneralError] = React.useState<string>()
  
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [passwordStrength, setPasswordStrength] = React.useState<'weak' | 'medium' | 'strong'>()

  const isLoading = fetchStatus === 'fetching';
  const strengthLabel = getPasswordStrengthLabel(passwordStrength);
  
  const isPasswordValid = password && !validatePassword(password).error;
  const canSubmitSignUp = email && password && confirmPassword && !isLoading && isPasswordValid;
  const canSubmitVerification = code.trim() && !isLoading;

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    setPasswordError(undefined)
    
    if (text) {
      const validation = validatePassword(text)
      setPasswordStrength(validation.strength)
    } else {
      setPasswordStrength(undefined)
    }
  }

  const handleSignUp = async () => {
    setGeneralError(undefined)
    setEmailError(undefined)
    setPasswordError(undefined)
    setConfirmPasswordError(undefined)
    
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

    const matchValidation = validatePasswordMatch(password, confirmPassword)
    if (!matchValidation.valid) {
      setConfirmPasswordError(matchValidation.error)
      return
    }

    try {
      await signUp.password({
        emailAddress: email,
        password,
      })

      if (signUp.status === 'missing_requirements' && 
          signUp.unverifiedFields.includes('email_address')) {
        // Send verification code
        await signUp.verifications.sendEmailCode()
        setIsVerifying(true)
      } else if (signUp.status === 'complete') {
        // Auto-finalize if complete
        await signUp.finalize({
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

  const handleVerifyCode = async () => {
    setGeneralError(undefined)
    Keyboard.dismiss()

    if (!code.trim()) {
      setGeneralError('Please enter the verification code')
      return
    }

    try {
      await signUp.verifications.verifyEmailCode({ code })

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              return
            }
            router.replace('/(home)')
          },
        })
      } else {
        setGeneralError('Verification failed. Please try again.')
      }
    } catch (error: any) {
      setGeneralError(getUserFriendlyError(error))
    }
  }

  const handleResendCode = async () => {
    try {
      await signUp.verifications.sendEmailCode()
      setGeneralError(undefined)
    } catch (error: any) {
      setGeneralError(getUserFriendlyError(error))
    }
  }

  const handleStartOver = () => {
    setIsVerifying(false)
    setCode('')
    setGeneralError(undefined)
    signUp.reset()
  }

  if (isVerifying) {
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
            disabled={!canSubmitVerification}
            className={`rounded-lg py-4 items-center justify-center mb-4 ${
              canSubmitVerification ? 'bg-accent' : 'bg-accent/50'
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
        <ViewStyled className="mb-8">
          <TextStyled className="text-4xl font-sans-bold text-primary mb-2">
            Get started
          </TextStyled>
          <TextStyled className="text-base text-muted-foreground leading-6">
            Create an account to start tracking your subscriptions
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
            <ViewStyled className="flex-row justify-between items-baseline mb-2">
              <TextStyled className="text-sm font-sans-semibold text-primary">
                Password
              </TextStyled>
              {password && (
                <TextStyled style={{ color: strengthLabel.color }} className="text-xs font-sans-semibold">
                  {strengthLabel.label}
                </TextStyled>
              )}
            </ViewStyled>
            <TextInputStyled
              className={`bg-card border ${
                passwordError ? 'border-destructive' : 'border-border'
              } rounded-lg px-4 py-3 text-base text-primary font-sans-medium`}
              placeholder="Create a strong password"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              editable={!isLoading}
            />
            {passwordError ? (
              <TextStyled className="text-destructive text-xs font-sans-medium mt-1.5">
                {passwordError}
              </TextStyled>
            ) : password ? (
              <TextStyled className="text-muted-foreground text-xs font-sans-medium mt-1.5">
                At least 8 characters with uppercase, lowercase, numbers, and symbols
              </TextStyled>
            ) : null}
          </ViewStyled>

          {/* Confirm Password field */}
          <ViewStyled>
            <TextStyled className="text-sm font-sans-semibold text-primary mb-2">
              Confirm password
            </TextStyled>
            <TextInputStyled
              className={`bg-card border ${
                confirmPasswordError ? 'border-destructive' : 'border-border'
              } rounded-lg px-4 py-3 text-base text-primary font-sans-medium`}
              placeholder="Confirm your password"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setConfirmPasswordError(undefined)
              }}
              secureTextEntry
              editable={!isLoading}
            />
            {confirmPasswordError && (
              <TextStyled className="text-destructive text-xs font-sans-medium mt-1.5">
                {confirmPasswordError}
              </TextStyled>
            )}
          </ViewStyled>
        </ViewStyled>

        {/* Sign Up Button */}
        <PressableStyled
          onPress={handleSignUp}
          disabled={!canSubmitSignUp}
          className={`rounded-lg py-4 items-center justify-center mb-4 ${
            canSubmitSignUp ? 'bg-accent' : 'bg-accent/50'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <TextStyled className="text-white font-sans-bold text-base">
              Create account
            </TextStyled>
          )}
        </PressableStyled>

        {/* Sign In Link */}
        <ViewStyled className="flex-row items-center justify-center">
          <TextStyled className="text-muted-foreground font-sans-medium text-base">
            Already have an account?{' '}
          </TextStyled>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <TextStyled className="text-accent font-sans-bold text-base">
                Sign in
              </TextStyled>
            </Pressable>
          </Link>
        </ViewStyled>
      </ViewStyled>
    </SafeAreaViewStyled>
  )
}
