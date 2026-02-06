import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FloatingButtonProps {
  bottomInset?: number;
}

export default function FloatingButton({ bottomInset = 20 }: FloatingButtonProps) {
  const { isAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleOption = (route: any) => {
    closeModal();
    router.push(route);
  };

  const bottomPosition = 20 + bottomInset;

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { bottom: bottomPosition }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>What would you like to do?</Text>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.optionCard} onPress={() => handleOption('/add-book')}>
                <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="camera" size={32} color={Colors.success} />
                </View>
                <Text style={styles.optionText}>Sell / Rent</Text>
                <Text style={styles.optionSubtext}>Upload Book</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => handleOption('/request-book')}>
                <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="documents" size={32} color={Colors.info} />
                </View>
                <Text style={styles.optionText}>Request</Text>
                <Text style={styles.optionSubtext}>Ask Community</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <SafeAreaView edges={['bottom']} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionCard: {
    alignItems: 'center',
    width: '45%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  optionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  }
});