import { icons } from '@/constants/icons';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View
} from 'react-native';

const ViewStyled = styled(View);
const TextStyled = styled(Text);
const TextInputStyled = styled(TextInput);
const PressableStyled = styled(Pressable);
const ScrollViewStyled = styled(ScrollView);
const KeyboardAvoidingViewStyled = styled(KeyboardAvoidingView);

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  'Entertainment': '#ff6b6b',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  'Design': '#f5c542',
  'Productivity': '#4ecdc4',
  'Cloud': '#95e1d3',
  'Music': '#ffd89b',
  'Other': '#c7ceea',
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [category, setCategory] = useState<Category>('Other');
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState<string>();
  const [priceError, setPriceError] = useState<string>();

  const isFormValid = name.trim() && price.trim() && !isLoading;

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setCategory('Other');
    setNameError(undefined);
    setPriceError(undefined);
  };

  const calculateRenewalDate = (baseDate: dayjs.Dayjs, freq: string) => {
    if (freq === 'Monthly') {
      return baseDate.add(1, 'month').toISOString();
    } else {
      return baseDate.add(1, 'year').toISOString();
    }
  };

  const handleSubmit = async () => {
    setNameError(undefined);
    setPriceError(undefined);

    const trimmedName = name.trim();
    const trimmedPrice = price.trim();

    // Validation
    if (!trimmedName) {
      setNameError('Subscription name is required');
      return;
    }

    if (!trimmedPrice) {
      setPriceError('Price is required');
      return;
    }

    const numPrice = parseFloat(trimmedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setPriceError('Price must be a positive number');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const now = dayjs();
      const renewalDate = calculateRenewalDate(now, frequency);

      const newSubscription: Subscription = {
        id: `subscription-${Date.now()}`,
        name: trimmedName,
        price: numPrice,
        currency: 'USD',
        billing: frequency,
        status: 'active',
        icon: icons.plus,
        category: category,
        color: CATEGORY_COLORS[category],
        startDate: now.toISOString(),
        renewalDate: renewalDate,
      };

      onSubmit(newSubscription);
      resetForm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ViewStyled className="modal-overlay">
        <KeyboardAvoidingViewStyled
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Pressable
            className="flex-1"
            onPress={onClose}
          />
          <ViewStyled className="modal-container">
            <ViewStyled className="modal-header">
              <TextStyled className="modal-title">New Subscription</TextStyled>
              <PressableStyled
                className="modal-close"
                onPress={onClose}
              >
                <TextStyled className="modal-close-text">×</TextStyled>
              </PressableStyled>
            </ViewStyled>

            <ScrollViewStyled showsVerticalScrollIndicator={false}>
              <ViewStyled className="modal-body">
                {/* Name Field */}
                <ViewStyled className="auth-field">
                  <TextStyled className="auth-label">Subscription Name</TextStyled>
                  <TextInputStyled
                    className={clsx(
                      'auth-input',
                      nameError && 'auth-input-error'
                    )}
                    placeholder="e.g., Netflix"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setNameError(undefined);
                    }}
                    editable={!isLoading}
                  />
                  {nameError && (
                    <TextStyled className="auth-error">{nameError}</TextStyled>
                  )}
                </ViewStyled>

                {/* Price Field */}
                <ViewStyled className="auth-field">
                  <TextStyled className="auth-label">Price</TextStyled>
                  <TextInputStyled
                    className={clsx(
                      'auth-input',
                      priceError && 'auth-input-error'
                    )}
                    placeholder="e.g., 12.99"
                    value={price}
                    onChangeText={(text) => {
                      setPrice(text);
                      setPriceError(undefined);
                    }}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                  {priceError && (
                    <TextStyled className="auth-error">{priceError}</TextStyled>
                  )}
                </ViewStyled>

                {/* Frequency Toggle */}
                <ViewStyled>
                  <TextStyled className="auth-label">Frequency</TextStyled>
                  <ViewStyled className="picker-row mt-2">
                    <PressableStyled
                      className={clsx(
                        'picker-option',
                        frequency === 'Monthly' && 'picker-option-active'
                      )}
                      onPress={() => setFrequency('Monthly')}
                      disabled={isLoading}
                    >
                      <TextStyled
                        className={clsx(
                          'picker-option-text',
                          frequency === 'Monthly' && 'picker-option-text-active'
                        )}
                      >
                        Monthly
                      </TextStyled>
                    </PressableStyled>
                    <PressableStyled
                      className={clsx(
                        'picker-option',
                        frequency === 'Yearly' && 'picker-option-active'
                      )}
                      onPress={() => setFrequency('Yearly')}
                      disabled={isLoading}
                    >
                      <TextStyled
                        className={clsx(
                          'picker-option-text',
                          frequency === 'Yearly' && 'picker-option-text-active'
                        )}
                      >
                        Yearly
                      </TextStyled>
                    </PressableStyled>
                  </ViewStyled>
                </ViewStyled>

                {/* Category Selection */}
                <ViewStyled>
                  <TextStyled className="auth-label">Category</TextStyled>
                  <ViewStyled className="category-scroll mt-2">
                    {CATEGORIES.map((cat) => (
                      <PressableStyled
                        key={cat}
                        className={clsx(
                          'category-chip',
                          category === cat && 'category-chip-active'
                        )}
                        onPress={() => setCategory(cat)}
                        disabled={isLoading}
                      >
                        <TextStyled
                          className={clsx(
                            'category-chip-text',
                            category === cat && 'category-chip-text-active'
                          )}
                        >
                          {cat}
                        </TextStyled>
                      </PressableStyled>
                    ))}
                  </ViewStyled>
                </ViewStyled>

                {/* Submit Button */}
                <PressableStyled
                  className={clsx(
                    'auth-button',
                    !isFormValid && 'auth-button-disabled'
                  )}
                  onPress={handleSubmit}
                  disabled={!isFormValid}
                >
                  <TextStyled className="auth-button-text">
                    {isLoading ? 'Creating...' : 'Create Subscription'}
                  </TextStyled>
                </PressableStyled>
              </ViewStyled>
            </ScrollViewStyled>
          </ViewStyled>
        </KeyboardAvoidingViewStyled>
      </ViewStyled>
    </Modal>
  );
}
