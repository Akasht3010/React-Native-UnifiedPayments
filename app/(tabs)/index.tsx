import akashImage from "@/assets/images/akash.png";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from 'dayjs';
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView, } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="home-header">
          <View className="home-user">
            <Image source={akashImage} className="home-avatar" />
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>
          <Image source={icons.add} className="home-add-icon" />
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
            data={HOME_SUBSCRIPTIONS}
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
    </SafeAreaView>
  );
}