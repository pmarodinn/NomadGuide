import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

const RecurrenceScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>🏗️ Em Construção</Title>
          <Paragraph>
            A tela de recorrências será implementada em breve!
          </Paragraph>
          <Paragraph style={styles.features}>
            Funcionalidades planejadas:
            {'\n'}• Lista de recorrências ativas
            {'\n'}• Criar nova recorrência
            {'\n'}• Editar recorrências existentes
            {'\n'}• Pausar/ativar recorrências
            {'\n'}• Histórico de transações geradas
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

export default RecurrenceScreen;
