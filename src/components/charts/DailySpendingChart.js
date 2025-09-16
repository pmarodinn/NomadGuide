import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { getDailySpendingData } from '../../utils/balanceUtils';

const { width: screenWidth } = Dimensions.get('window');

const DailySpendingChart = ({ transactions = [], recurrences = [], days = 7 }) => {
  const theme = useTheme();
  
  const chartData = getDailySpendingData(transactions, recurrences, days);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`, // Blue
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 3,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      strokeWidth: 1,
      stroke: theme.colors.outline,
      strokeOpacity: 0.3,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  // If no data, show message
  if (!chartData.labels.length || chartData.datasets[0].data.every(val => val === 0)) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>📊 Gastos dos Últimos {days} Dias</Title>
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              Nenhum gasto registrado nos últimos {days} dias
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title>📊 Gastos dos Últimos {days} Dias</Title>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>Real</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>Projetado</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 64} // Account for card padding
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={true}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            fromZero={true}
          />
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Real:</Text>
            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
              R$ {chartData.datasets[0].data.reduce((a, b) => a + b, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Projetado:</Text>
            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
              R$ {chartData.datasets[1].data.reduce((a, b) => a + b, 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default DailySpendingChart;
