import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { leadAPI } from '../services/api';

const AddLeadScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    estimatedValue: '',
    source: 'website',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await leadAPI.create(formData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Lead added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter lead name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Company</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter company name"
          value={formData.company}
          onChangeText={(text) => setFormData({ ...formData, company: text })}
        />

        <Text style={styles.label}>Estimated Value (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter estimated value"
          value={formData.estimatedValue}
          onChangeText={(text) => setFormData({ ...formData, estimatedValue: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Add Lead</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  form: {
    padding: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#111827'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  submitButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AddLeadScreen;
