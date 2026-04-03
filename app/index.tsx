import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
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
    </View>
  );
}