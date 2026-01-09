import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { leadAPI, customerAPI } from '../services/api';
import { storage } from '../utils/storage';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    customers: 0,
    closedDeals: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await storage.getItem('user');
      setUser(userData);

      const [leadsRes, customersRes] = await Promise.all([
        leadAPI.getAll(),
        customerAPI.getAll()
      ]);

      const leads = leadsRes.data.leads || [];
      const customers = customersRes.data.customers || [];

      setStats({
        totalLeads: leads.length,
        newLeads: leads.filter(l => l.status === 'new').length,
        customers: customers.length,
        closedDeals: leads.filter(l => l.status === 'closed-won').length
      });
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await storage.clear();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.statValue}>{stats.totalLeads}</Text>
          <Text style={styles.statLabel}>Total Leads</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.statValue}>{stats.newLeads}</Text>
          <Text style={styles.statLabel}>New Leads</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={styles.statValue}>{stats.customers}</Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#fce7f3' }]}>
          <Text style={styles.statValue}>{stats.closedDeals}</Text>
          <Text style={styles.statLabel}>Closed Deals</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddLead')}
        >
          <Text style={styles.actionButtonText}>➕ Add New Lead</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyLeads')}
        >
          <Text style={styles.actionButtonText}>📋 View My Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Customers')}
        >
          <Text style={styles.actionButtonText}>👥 View Customers</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280'
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  quickActions: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  actionButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500'
  }
});

export default DashboardScreen;
