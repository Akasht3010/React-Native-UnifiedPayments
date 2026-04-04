import "@/global.css";
import { Text } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView as RNSafeAreaView, } from "react-native-safe-area-context";
import { styled } from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-success">
        Welcome to mySpace!
      </Text>
      <Link href="/Onboarding" className="mt-4 px-4 py-2 bg-primary text-white rounded"> Go to onboarding</Link>

      <Link href="/(auth)/sign-in" className="mt-4 px-4 py-2 bg-primary text-white rounded"> Go to sign in</Link>

      <Link href="/(auth)/sign-up" className="mt-4 px-4 py-2 bg-primary text-white rounded"> Go to sign up</Link>

      <Link href="/subscriptions/spotify">Spotify Subscription</Link>

      <Link 
           href={{
            pathname: "/subscriptions/[id]",
            params: { id: "claude" },
           }}
      >Claude Max Subscription</Link>
    </SafeAreaView>
  );
}