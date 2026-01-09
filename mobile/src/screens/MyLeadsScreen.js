import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { leadAPI } from '../services/api';

const MyLeadsScreen = ({ navigation }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [searchQuery, leads]);

  const loadLeads = async () => {
    try {
      const response = await leadAPI.getAll();
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error('Load leads error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterLeads = () => {
    if (!searchQuery) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter(lead =>
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery)
    );
    setFilteredLeads(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': '#3b82f6',
      'contacted': '#f59e0b',
      'qualified': '#8b5cf6',
      'proposal': '#ec4899',
      'closed-won': '#22c55e',
      'closed-lost': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const renderLead = ({ item }) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => navigation.navigate('LeadDetail', { leadId: item._id })}
    >
      <View style={styles.leadHeader}>
        <View style={styles.leadAvatar}>
          <Text style={styles.leadAvatarText}>
            {item.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{item.name}</Text>
          <Text style={styles.leadEmail}>{item.email}</Text>
          <Text style={styles.leadPhone}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.leadFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
        </View>
        <Text style={styles.leadValue}>₹{item.estimatedValue || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search leads..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddLead')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadLeads();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leads found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827'
  },
  addButton: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  listContainer: {
    padding: 16
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  leadHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  leadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  leadAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  leadInfo: {
    flex: 1
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  leadEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2
  },
  leadPhone: {
    fontSize: 14,
    color: '#6b7280'
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  leadValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280'
  }
});

export default MyLeadsScreen;
