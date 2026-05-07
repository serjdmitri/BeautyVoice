import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserStatus } from '../types';
import { statusColor } from '../utils/helpers';

interface Props {
  status: UserStatus;
  small?: boolean;
}

const STATUS_LABELS: Record<UserStatus, string> = {
  Bronze: 'Bronze',
  Silver: 'Silver',
  Gold: 'Gold',
};

export default function StatusBadge({ status, small = false }: Props) {
  const color = statusColor(status);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '22' }, small && styles.small]}>
      <Text style={[styles.text, { color }, small && styles.smallText]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
  smallText: {
    fontSize: 12,
  },
});
