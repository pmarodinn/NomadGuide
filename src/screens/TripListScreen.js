import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Card } from 'react-native-paper';

const TripListScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>🏗️ Em Construção</Title>
          <Paragraph>
            A tela de lista de viagens será implementada em breve!
          </Paragraph>
          <Paragraph style={styles.features}>
            Funcionalidades planejadas:
            {'\n'}• Criar nova viagem
            {'\n'}• Listar todas as viagens
            {'\n'}• Editar viagens existentes
            {'\n'}• Definir viagem ativa
            {'\n'}• Excluir viagens
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

export default TripListScreen;
