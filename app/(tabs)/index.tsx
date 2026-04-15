import akashImage from "@/assets/images/akash.png";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { useSubscriptions } from "@/lib/subscriptions-context";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from 'dayjs';
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView, } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { subscriptions, addSubscription } = useSubscriptions();
  const { user } = useUser()

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User'

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="home-header">
          <View className="home-user">
            <Image source={akashImage} className="home-avatar" />
            <Text className="home-user-name">{displayName}</Text>
          </View>
          <Pressable onPress={() => setIsCreateModalVisible(true)}>
            <Image source={icons.add} className="home-add-icon" />
          </Pressable>
        </View>

        <View className="home-balance-card">
          <Text className="home-balance-label">Balance</Text>

          <View className="home-balance-row">
            <Text className="home-balance-amount">
              {formatCurrency((HOME_BALANCE.amount))}
            </Text>
            <Text className="home-balance-date">
              {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
            </Text>
          </View>
        </View>

        <View>
          <ListHeading title="Upcoming " />
          <FlatList
            data={UPCOMING_SUBSCRIPTIONS}
            renderItem={({ item }) => <UpcomingSubscriptionCard data={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 mb-5"
            ListEmptyComponent={<Text className="home-empty-state">No upcoming subscriptions</Text>}
          />
        </View>

        <View>
          <ListHeading title="All Subscriptions" />

          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => setExpandedSubscriptionId(expandedSubscriptionId === item.id ? null : item.id)}
              />
            )}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
            contentContainerClassName="pb-20"
          />
        </View>
      </ScrollView>

      <CreateSubscriptionModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={addSubscription}
      />
    </SafeAreaView>
  );
}