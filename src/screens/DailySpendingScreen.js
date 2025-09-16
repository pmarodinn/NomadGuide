import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

const DailySpendingScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>🏗️ Em Construção</Title>
          <Paragraph>
            A tela de gastos diários será implementada em breve!
          </Paragraph>
          <Paragraph style={styles.features}>
            Funcionalidades planejadas:
            {'\n'}• Gráfico de gastos por dia
            {'\n'}• Breakdown por categoria
            {'\n'}• Comparação com orçamento
            {'\n'}• Tendências de gastos
            {'\n'}• Exportar dados
            {'\n'}• Filtros por período
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  features: {
    marginTop: 16,
    lineHeight: 24,
  },
});

export default DailySpendingScreen;
