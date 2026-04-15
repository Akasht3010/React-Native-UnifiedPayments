import SubscriptionCard from '@/components/SubscriptionCard';
import { useSubscriptions } from '@/lib/subscriptions-context';
import { styled } from "nativewind";
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView, } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { subscriptions: allSubscriptions } = useSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSubscriptions
    }
    
    const lowerQuery = searchQuery.toLowerCase()
    return allSubscriptions.filter(sub => 
      sub.name.toLowerCase().includes(lowerQuery) ||
      sub.category?.toLowerCase().includes(lowerQuery) ||
      sub.plan?.toLowerCase().includes(lowerQuery)
    )
  }, [searchQuery, allSubscriptions])

  const handleCardPress = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-background p-5">
        <View className="mb-5">
          <Text className="text-xl font-semibold text-foreground mb-3">My Subscriptions</Text>
          <TextInput
            placeholder="Search by name, category, or plan..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="bg-card text-foreground px-4 py-3 rounded-lg border border-gray-300"
          />
        </View>

        {filteredSubscriptions.length > 0 ? (
          <FlatList
            data={filteredSubscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-3">
                <SubscriptionCard
                  {...item}
                  expanded={expandedId === item.id}
                  onPress={() => handleCardPress(item.id)}
                />
              </View>
            )}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">No subscriptions found</Text>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export default subscriptions