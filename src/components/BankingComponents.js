import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card, IconButton, Chip, Divider, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, typography, elevation, borderRadius } from '../theme/colors';

// Balance Card Component
export const BalanceCard = ({ 
  title, 
  balance, 
  subtitle, 
  type = 'primary',
  style,
  onPress,
  showIcon = true,
  icon = null,
  children
}) => {
  const getCardStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success };
      case 'error':
        return { backgroundColor: colors.error };
      case 'warning':
        return { backgroundColor: colors.warning };
      case 'secondary':
        return { backgroundColor: colors.secondary };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return 'trending-up';
      case 'error':
        return 'trending-down';
      case 'warning':
        return 'alert-circle';
      default:
        return 'wallet';
    }
  };

  return (
    <Card style={[styles.balanceCard, getCardStyle(), style]} onPress={onPress}>
      <View style={styles.balanceCardContent}>
        <View style={styles.balanceHeader}>
          {showIcon && (
            <MaterialCommunityIcons 
              name={getIcon()} 
              size={24} 
              color={colors.onPrimary} 
            />
          )}
          <Text style={[styles.balanceTitle, { color: colors.onPrimary }]}>
            {title}
          </Text>
        </View>
        
        <Text style={[styles.balanceAmount, { color: colors.onPrimary }]}>
          {balance}
        </Text>
        
        {subtitle && (
          <Text style={[styles.balanceSubtitle, { color: colors.onPrimary }]}>
            {subtitle}
          </Text>
        )}
        
        {children}
      </View>
    </Card>
  );
};

// Quick Action Button Component
export const QuickActionButton = ({ 
  title, 
  icon, 
  onPress, 
  type = 'primary',
  disabled = false,
  style 
}) => {
  const getButtonStyle = () => {
    if (disabled) {
      return { backgroundColor: colors.gray300 };
    }
    
    switch (type) {
      case 'secondary':
        return { backgroundColor: colors.secondaryContainer };
      case 'success':
        return { backgroundColor: colors.successContainer };
      case 'warning':
        return { backgroundColor: colors.warningContainer };
      case 'error':
        return { backgroundColor: colors.errorContainer };
      default:
        return { backgroundColor: colors.primaryContainer };
    }
  };

  const getIconColor = () => {
    if (disabled) return colors.gray500;
    
    switch (type) {
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.quickActionButton, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={32} 
        color={getIconColor()}
      />
      <Text style={[styles.quickActionText, { color: getIconColor() }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Transaction Item Component
export const TransactionItem = ({ 
  transaction, 
  onPress,
  showCategory = true,
  showDate = true,
  style 
}) => {
  const isIncome = transaction.type === 'income' || transaction.amount > 0;
  const amountColor = isIncome ? colors.success : colors.error;
  const icon = isIncome ? 'plus-circle' : 'minus-circle';

  return (
    <TouchableOpacity 
      style={[styles.transactionItem, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.transactionIcon}>
        <MaterialCommunityIcons 
          name={icon}
          size={24}
          color={amountColor}
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription} numberOfLines={1}>
          {transaction.description || 'Transaction'}
        </Text>
        
        <View style={styles.transactionMeta}>
          {showCategory && transaction.categoryName && (
            <>
              <Chip 
                mode="outlined" 
                compact 
                style={styles.categoryChip}
                textStyle={styles.categoryChipText}
              >
                {transaction.categoryName}
              </Chip>
              {showDate && <Text style={styles.metaSeparator}>•</Text>}
            </>
          )}
          
          {showDate && (
            <Text style={styles.transactionDate}>
              {transaction.date ? 
                new Date(transaction.date.toDate ? transaction.date.toDate() : transaction.date)
                  .toLocaleDateString() 
                : 'Unknown date'
              }
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {isIncome ? '+' : '-'}{Math.abs(transaction.amount || 0).toFixed(2)}
        </Text>
        {transaction.currency && (
          <Text style={styles.currencyText}>
            {transaction.currency}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Section Header Component
export const SectionHeader = ({ 
  title, 
  action, 
  onActionPress,
  icon,
  style 
}) => {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionTitleContainer}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={20} 
            color={colors.onSurface} 
            style={styles.sectionIcon}
          />
        )}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      {action && onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Card Container Component
export const CardContainer = ({ children, style, onPress, padding = true }) => {
  const cardStyle = onPress ? [styles.cardContainer, styles.pressableCard] : styles.cardContainer;
  const contentStyle = padding ? styles.cardContent : null;
  
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={contentStyle}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};

// Stats Card Component
export const StatsCard = ({ 
  title, 
  value, 
  subtitle,
  icon,
  iconColor = colors.primary,
  trend,
  trendDirection = 'up',
  style 
}) => {
  const trendColor = trendDirection === 'up' ? colors.success : colors.error;
  const trendIcon = trendDirection === 'up' ? 'trending-up' : 'trending-down';

  return (
    <CardContainer style={style}>
      <View style={styles.statsCardHeader}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={iconColor}
          />
        )}
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
      
      <Text style={styles.statsValue}>{value}</Text>
      
      <View style={styles.statsFooter}>
        {subtitle && (
          <Text style={styles.statsSubtitle}>{subtitle}</Text>
        )}
        
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons 
              name={trendIcon} 
              size={16} 
              color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>
    </CardContainer>
  );
};

// Progress Card Component
export const ProgressCard = ({ 
  title, 
  current, 
  total, 
  percentage,
  showNumbers = true,
  color = colors.primary,
  style 
}) => {
  const progress = percentage !== undefined ? percentage / 100 : current / total;
  const progressColor = progress > 0.8 ? colors.warning : progress > 0.9 ? colors.error : color;

  return (
    <CardContainer style={style}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{title}</Text>
        {showNumbers && (
          <Text style={styles.progressNumbers}>
            {current.toFixed(2)} / {total.toFixed(2)}
          </Text>
        )}
      </View>
      
      <ProgressBar 
        progress={Math.min(progress, 1)} 
        color={progressColor}
        style={styles.progressBar}
      />
      
      <Text style={[styles.progressPercentage, { color: progressColor }]}>
        {(progress * 100).toFixed(1)}%
      </Text>
    </CardContainer>
  );
};

// Quick Actions Grid Component
export const QuickActionsGrid = ({ actions, style }) => {
  return (
    <View style={[styles.quickActionsGrid, style]}>
      {actions.map((action, index) => (
        <QuickActionButton
          key={index}
          title={action.title}
          icon={action.icon}
          onPress={action.onPress}
          type={action.type}
          disabled={action.disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Balance Card Styles
  balanceCard: {
    borderRadius: borderRadius.lg,
    ...elevation.level2,
  },
  balanceCardContent: {
    padding: spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceTitle: {
    ...typography.titleMedium,
    marginLeft: spacing.sm,
  },
  balanceAmount: {
    ...typography.headlineMedium,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  balanceSubtitle: {
    ...typography.bodySmall,
    opacity: 0.8,
  },

  // Quick Action Button Styles
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...elevation.level1,
    minHeight: 100,
    margin: spacing.xs,
  },
  quickActionText: {
    ...typography.labelMedium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Transaction Item Styles
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    ...elevation.level1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    ...typography.bodyLarge,
    marginBottom: spacing.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    height: 24,
  },
  categoryChipText: {
    ...typography.labelSmall,
  },
  metaSeparator: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginHorizontal: spacing.sm,
  },
  transactionDate: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...typography.titleMedium,
    fontWeight: '600',
  },
  currencyText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },

  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.titleMedium,
  },
  sectionAction: {
    ...typography.labelLarge,
    color: colors.primary,
  },

  // Card Container Styles
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...elevation.level1,
  },
  pressableCard: {
    ...elevation.level2,
  },
  cardContent: {
    padding: spacing.md,
  },

  // Stats Card Styles
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitle: {
    ...typography.titleSmall,
    marginLeft: spacing.sm,
  },
  statsValue: {
    ...typography.headlineSmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...typography.labelSmall,
    marginLeft: spacing.xs,
  },

  // Progress Card Styles
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.titleSmall,
  },
  progressNumbers: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  progressPercentage: {
    ...typography.labelLarge,
    textAlign: 'right',
  },

  // Quick Actions Grid Styles
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -spacing.xs,
  },
});

export default {
  BalanceCard,
  QuickActionButton,
  TransactionItem,
  SectionHeader,
  CardContainer,
  StatsCard,
  ProgressCard,
  QuickActionsGrid,
};
