import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Title, Paragraph, Card, Text, Chip, Button, useTheme, Divider, Surface } from 'react-native-paper';
import { useTripContext } from '../contexts/TripContext';
import { useCurrencyContext } from '../contexts/CurrencyContext';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { formatDate } from '../utils/dateUtils';

const screenWidth = Dimensions.get('window').width;

const DailySpendingScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { tripId: routeTripId } = route.params || {};
  const { trips, transactions, categories, getActiveTrip } = useTripContext();
  const { formatCurrency: fmt, convertCurrency } = useCurrencyContext();

  const activeTrip = useMemo(() => {
    if (routeTripId) return trips.find(t => t.id === routeTripId) || null;
    return getActiveTrip();
  }, [routeTripId, trips, getActiveTrip]);

  const [periodDays, setPeriodDays] = useState(7); // 7, 14, 30
  const [loading, setLoading] = useState(true);

  const { startDate, endDate, daysArray, labels } = useMemo(() => {
    if (!activeTrip) return { startDate: null, endDate: null, daysArray: [], labels: [] };
    
    const today = new Date();
    const tripEnd = activeTrip.endDate?.toDate?.() || (activeTrip.endDate ? new Date(activeTrip.endDate) : today);
    const tripStart = activeTrip.startDate?.toDate?.() || (activeTrip.startDate ? new Date(activeTrip.startDate) : today);
    
    const end = tripEnd < today ? tripEnd : today;
    const start = new Date(end);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    start.setDate(start.getDate() - (periodDays - 1));
    
    if (tripStart && start < new Date(tripStart.setHours(0,0,0,0))) {
      start.setTime(new Date(tripStart.setHours(0,0,0,0)).getTime());
    }

    const days = [];
    const lbls = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push(new Date(cursor));
      lbls.push(formatDate(cursor, 'dd/MM'));
      cursor.setDate(cursor.getDate() + 1);
    }
    return { startDate: start, endDate: end, daysArray: days, labels: lbls };
  }, [activeTrip, periodDays]);

  const [series, setSeries] = useState({ expenses: [], incomes: [] });
  const [kpis, setKpis] = useState({ totalExpense: 0, totalIncome: 0, avgExpense: 0 });
  const [categoryData, setCategoryData] = useState([]);

  const safeChartData = useMemo(() => {
    const clean = (arr) => Array.isArray(arr) ? arr.map(v => (Number.isFinite(v) ? v : 0)) : [];
    let lbls = Array.isArray(labels) ? [...labels] : [];
    let exp = clean(series.expenses);
    let inc = clean(series.incomes);

    const minLen = Math.min(lbls.length, exp.length, inc.length);
    if (minLen <= 0) return { labels: [' ', ' '], expenses: [0, 0], incomes: [0, 0] };
    
    lbls = lbls.slice(0, minLen);
    exp = exp.slice(0, minLen);
    inc = inc.slice(0, minLen);

    if (lbls.length < 2) {
      lbls = [lbls[0] || ' ', lbls[0] || ' '];
      exp = [exp[0] || 0, exp[0] || 0];
      inc = [inc[0] || 0, inc[0] || 0];
    }
    return { labels: lbls, expenses: exp, incomes: inc };
  }, [labels, series]);

  useEffect(() => {
    const buildData = async () => {
      if (!activeTrip || !startDate || !endDate) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const tripCurrency = activeTrip.defaultCurrency || 'USD';
        const tripTx = transactions
          .filter(t => t.tripId === activeTrip.id)
          .filter(t => {
            const d = t.date?.toDate?.() || new Date(t.date);
            if (!d) return false;
            const day = new Date(d);
            day.setHours(0,0,0,0);
            return day >= startDate && day <= endDate;
          });

        const converted = await Promise.all(tripTx.map(async (t) => {
          const amountAbs = Math.abs(t.amount || 0);
          let amountTrip = Number.isFinite(amountAbs) ? amountAbs : 0;
          const from = t.currency || tripCurrency;
          if (from !== tripCurrency) {
            try {
              const conv = await convertCurrency(amountAbs, from, tripCurrency);
              amountTrip = Number.isFinite(conv) ? conv : 0;
            } catch {}
          }
          const d = t.date?.toDate?.() || new Date(t.date);
          const key = new Date(d.setHours(0,0,0,0)).getTime();
          return { key, type: t.type, amount: amountTrip, categoryId: t.categoryId, categoryName: t.categoryName };
        }));

        const dayIndexMap = new Map(daysArray.map((d, idx) => [d.getTime(), idx]));
        const expenses = new Array(daysArray.length).fill(0);
        const incomes = new Array(daysArray.length).fill(0);

        for (const r of converted) {
          const idx = dayIndexMap.get(r.key);
          if (idx != null) {
            if (r.type === 'expense') expenses[idx] += r.amount; else incomes[idx] += r.amount;
          }
        }

        const totalExpense = expenses.reduce((a, b) => a + b, 0) || 0;
        const totalIncome = incomes.reduce((a, b) => a + b, 0) || 0;
        const daysCount = Math.max(1, daysArray.length);
        const avgExpense = Number.isFinite(totalExpense / daysCount) ? (totalExpense / daysCount) : 0;

        const byCat = new Map();
        converted.forEach(r => {
          if (r.type === 'expense') {
            const key = r.categoryId || r.categoryName || 'Outros';
            byCat.set(key, (byCat.get(key) || 0) + r.amount);
          }
        });

        const palette = ['#FFC107', '#0D47A1', '#FF7043', '#1976D2', '#FFA726', '#0288D1', '#FFB74D', '#2962FF'];
        const catData = Array.from(byCat.entries()).map(([key, val], i) => {
          const cat = categories.find(c => c.id === key || c.name === key);
          return {
            name: cat ? `${cat.icon || ''} ${cat.name}`.trim() : String(key),
            population: val,
            color: cat?.color || palette[i % palette.length],
            legendFontColor: theme.colors.onSurface,
            legendFontSize: 12,
          };
        });

        setSeries({ expenses, incomes });
        setKpis({ totalExpense, totalIncome, avgExpense });
        setCategoryData(catData);
      } finally {
        setLoading(false);
      }
    };
    buildData();
  }, [activeTrip, transactions, startDate, endDate, daysArray, categories, convertCurrency]);

  if (!activeTrip) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}> 
        <Card style={styles.card}> 
          <Card.Content style={{ alignItems: 'center' }}>
            <Title style={styles.emptyTitle}>✈️ Nenhuma Viagem Ativa</Title>
            <Paragraph style={styles.emptyText}>Crie ou ative uma viagem para ver os gráficos.</Paragraph>
            <Button mode="contained" onPress={() => navigation.navigate('TripList')} style={{ marginTop: 16 }}>Gerenciar Viagens</Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => theme.colors.onSurface,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
    decimalPlaces: 0,
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme.colors.primary },
    propsForBackgroundLines: { stroke: theme.colors.backdrop },
  };

  const cardWidth = screenWidth - 32;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.cardTitle}>📈 Gastos Diários</Title>
            <View style={styles.periodChips}>
              {[7, 14, 30].map(d => (
                <Chip 
                  key={d} 
                  selected={periodDays === d} 
                  onPress={() => setPeriodDays(d)} 
                  style={[styles.chip, periodDays === d && { backgroundColor: theme.colors.primaryContainer }]}
                  textStyle={[periodDays === d && { color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }]}
                >
                  {d}d
                </Chip>
              ))}
            </View>
          </View>
          <Paragraph style={styles.subtitle}>
            {`${formatDate(startDate)} a ${formatDate(endDate)}`}
          </Paragraph>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 48 }} size="large" color={theme.colors.primary} />
          ) : (
            <LineChart
              data={{
                labels: safeChartData.labels,
                datasets: [
                  { data: safeChartData.expenses, color: () => theme.colors.error, strokeWidth: 2 },
                  { data: safeChartData.incomes, color: () => theme.colors.primary, strokeWidth: 2 },
                ],
                legend: ['Gastos', 'Receitas'],
              }}
              width={cardWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
            />
          )}
        </Card.Content>
      </Card>

      <View style={styles.kpiRow}>
        <Surface style={styles.kpiBox} elevation={2}>
          <Text style={styles.kpiLabel}>Total Gasto</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.error }]}>{fmt(kpis.totalExpense, activeTrip.defaultCurrency)}</Text>
        </Surface>
        <Surface style={styles.kpiBox} elevation={2}>
          <Text style={styles.kpiLabel}>Média/Dia</Text>
          <Text style={styles.kpiValue}>{fmt(kpis.avgExpense, activeTrip.defaultCurrency)}</Text>
        </Surface>
        <Surface style={styles.kpiBox} elevation={2}>
          <Text style={styles.kpiLabel}>Recebido</Text>
          <Text style={[styles.kpiValue, { color: theme.colors.primary }]}>{fmt(kpis.totalIncome, activeTrip.defaultCurrency)}</Text>
        </Surface>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>🧩 Por Categoria</Title>
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 48 }} size="large" color={theme.colors.primary} />
          ) : categoryData.length === 0 ? (
            <Paragraph style={styles.emptyText}>Sem dados de gastos no período.</Paragraph>
          ) : (
            <PieChart
              data={categoryData}
              width={cardWidth}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"16"}
              absolute
              style={styles.chart}
            />
          )}
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  card: { 
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  periodChips: { 
    flexDirection: 'row', 
    gap: 8 
  },
  chip: { 
    borderRadius: 8,
  },
  subtitle: { 
    opacity: 0.7,
    fontSize: 12,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    marginTop: 8,
  },
  kpiRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  kpiBox: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: { 
    fontSize: 14, 
    opacity: 0.8,
    marginBottom: 4,
  },
  kpiValue: { 
    fontSize: 18, 
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});

export default DailySpendingScreen;
