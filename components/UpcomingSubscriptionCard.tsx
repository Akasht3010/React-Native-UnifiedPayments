import { formatCurrency } from '@/lib/utils';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface UpcomingSubscriptionCardProps {
  data: {
    name: string;
    price: number;
    daysLeft: number;
    icon: any;
    currency?: string;
  };
}

const UpcomingSubscriptionCard = ({data}: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={data.icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">{formatCurrency(data.price, data.currency)}</Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {data.daysLeft > 1 ? `${data.daysLeft} days left` : '1 day left'}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>{data.name}</Text>
    </View>
  )
}

export default UpcomingSubscriptionCard