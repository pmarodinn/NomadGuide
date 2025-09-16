import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Title, 
  Paragraph, 
  Card, 
  TextInput, 
  Button, 
  RadioButton, 
  List, 
  Divider,
  Snackbar
} from 'react-native-paper';

const AddTransactionScreen = ({ navigation, route }) => {
  const { tripId } = route.params || {};
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('food');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const categories = [
    { value: 'food', label: '🍽️ Alimentação' },
    { value: 'transport', label: '🚗 Transporte' },
    { value: 'accommodation', label: '🏨 Hospedagem' },
    { value: 'entertainment', label: '🎉 Entretenimento' },
    { value: 'shopping', label: '🛍️ Compras' },
    { value: 'health', label: '💊 Saúde' },
    { value: 'other', label: '📝 Outros' },
  ];

  const handleSubmit = () => {
    if (!amount || !description) {
      setShowSnackbar(true);
      return;
    }

    // TODO: Implementar salvamento da transação
    console.log('Nova transação:', {
      tripId,
      amount: parseFloat(amount),
      description,
      type,
      category,
      date: new Date(),
    });

    // Navegar de volta
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>💰 Nova Transação</Title>
          
          <View style={styles.section}>
            <Paragraph>Tipo de Transação:</Paragraph>
            <RadioButton.Group 
              onValueChange={value => setType(value)} 
              value={type}
            >
              <RadioButton.Item label="💸 Gasto" value="expense" />
              <RadioButton.Item label="💵 Receita" value="income" />
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          <TextInput
            label="💰 Valor (R$)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="📝 Descrição"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.section}>
            <Paragraph>Categoria:</Paragraph>
            {categories.map((cat) => (
              <RadioButton.Item
                key={cat.value}
                label={cat.label}
                value={cat.value}
                status={category === cat.value ? 'checked' : 'unchecked'}
                onPress={() => setCategory(cat.value)}
              />
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            icon="plus"
          >
            Adicionar Transação
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        Por favor, preencha todos os campos obrigatórios
      </Snackbar>
    </ScrollView>
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
  section: {
    marginVertical: 16,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
});

export default AddTransactionScreen;
