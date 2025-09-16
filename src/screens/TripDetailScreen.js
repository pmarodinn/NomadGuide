import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

const TripDetailScreen = ({ navigation, route }) => {
  const { tripName } = route.params || {};

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>🏗️ Em Construção</Title>
          <Paragraph>
            A tela de detalhes da viagem {tripName ? `"${tripName}"` : ''} será implementada em breve!
          </Paragraph>
          <Paragraph style={styles.features}>
            Funcionalidades planejadas:
            {'\n'}• Mostrar saldo real e projetado
            {'\n'}• Lista de todas as transações
            {'\n'}• Gráfico de gastos diários
            {'\n'}• Gerenciar recorrências
            {'\n'}• Estatísticas da viagem
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

export default TripDetailScreen;
