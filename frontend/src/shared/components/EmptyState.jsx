import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function EmptyState({
  icon = '📭',
  title = 'Нет данных',
  description = '',
  actionLabel,
  onAction,
  style,
}) {
  return (
    <View style={[styles.emptyState, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});