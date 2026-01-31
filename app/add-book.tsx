import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { bookService } from '../services/bookService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { BookType, BookCondition } from '../types/Book';

export default function AddBookScreen() {
  const { user, isAuthenticated } = useAuth();
  const { location } = useLocation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [condition, setCondition] = useState<BookCondition>('good');
  const [type, setType] = useState<BookType>('sell');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const categories = categoryService.getMainCategories();
  const subcategories = category ? categoryService.getSubcategories(category) : [];

  const conditionOptions: { value: BookCondition; label: string }[] = [
    { value: 'new', label: 'Brand New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const typeOptions: { value: BookType; label: string; icon: string }[] = [
    { value: 'sell', label: 'Sell', icon: 'cash' },
    { value: 'rent', label: 'Rent', icon: 'calendar' },
    { value: 'swap', label: 'Swap', icon: 'swap-horizontal' },
    { value: 'donate', label: 'Donate', icon: 'heart' },
  ];

  const pickImage = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add books', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to add books', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter book title');
      return;
    }

    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!image) {
      Alert.alert('Error', 'Please add a book image');
      return;
    }

    if ((type === 'sell' || type === 'rent') && !price) {
      Alert.alert('Error', 'Please enter price');
      return;
    }

    setLoading(true);

    try {
      const newBook = await bookService.addBook({
        title: title.trim(),
        author: '',
        description: description.trim(),
        category: category.toLowerCase(),
        subcategory: subcategory || category.toLowerCase(),
        condition,
        type,
        price: type === 'sell' || type === 'rent' ? parseInt(price) : 0,
        images: image ? [image] : [],
        sellerId: user?.id || '101',
        sellerName: user?.name || 'User',
        sellerPhone: user?.phone || '+1234567890',
        location: {
          address: location?.address || 'New York, USA',
          lat: location?.lat || 40.7128,
          lng: location?.lng || -74.0060,
        },
        isAvailable: true,
        status: 'available',
        distance: 0,
      });

      Alert.alert(
        'Success',
        'Book listed successfully!',
        [
          {
            text: 'View Book',
            onPress: () => router.push(`/book/${newBook.id}`),
          },
          {
            text: 'Add Another',
            style: 'cancel',
            onPress: () => resetForm(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setSubcategory('');
    setCondition('good');
    setType('sell');
    setPrice('');
    setImage(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Book Image *</Text>
            <Text style={styles.sectionSubtitle}>Add a clear image of the book</Text>
            
            <View style={styles.imageContainer}>
              {image ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Ionicons name="close-circle" size={28} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                  <Ionicons name="camera" size={48} color={Colors.textSecondary} />
                  <Text style={styles.addImageText}>Add Book Image</Text>
                  <Text style={styles.imageNote}>Tap to select from gallery</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Book Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter book title"
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the book condition, edition, etc."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Category & Condition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category & Condition</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.name && styles.selectedCategoryButton,
                    ]}
                    onPress={() => {
                      setCategory(cat.name);
                      setSubcategory('');
                    }}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={20} 
                      color={category === cat.name ? Colors.background : cat.color} 
                    />
                    <Text style={[
                      styles.categoryButtonText,
                      category === cat.name && styles.selectedCategoryButtonText,
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {category && subcategories.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subcategory (Optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {subcategories.map((sub, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.subcategoryButton,
                        subcategory === sub && styles.selectedSubcategoryButton,
                      ]}
                      onPress={() => setSubcategory(sub)}
                    >
                      <Text style={[
                        styles.subcategoryButtonText,
                        subcategory === sub && styles.selectedSubcategoryButtonText,
                      ]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Book Condition</Text>
              <View style={styles.conditionGrid}>
                {conditionOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.conditionButton,
                      condition === option.value && styles.selectedConditionButton,
                    ]}
                    onPress={() => setCondition(option.value)}
                  >
                    <Text style={[
                      styles.conditionButtonText,
                      condition === option.value && styles.selectedConditionButtonText,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Listing Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Type</Text>
            
            <View style={styles.typeGrid}>
              {typeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeButton,
                    type === option.value && styles.selectedTypeButton,
                  ]}
                  onPress={() => {
                    setType(option.value);
                    if (option.value === 'donate') {
                      setPrice('');
                    }
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={type === option.value ? Colors.background : Colors.primary} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    type === option.value && styles.selectedTypeButtonText,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(type === 'sell' || type === 'rent') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By posting this listing, you agree to our Terms of Service and confirm that:
            </Text>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.termText}>The book is in the condition described</Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.termText}>You have the right to sell/rent this book</Text>
            </View>
            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.termText}>You will respond to interested buyers</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={[styles.fixedActions, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton, (!title || !category || !image) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !title || !category || !image}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                <Text style={styles.submitButtonText}>Post Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.background,
    borderRadius: 14,
  },
  addImageButton: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  addImageText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  imageNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    marginLeft: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedCategoryButtonText: {
    color: Colors.background,
  },
  subcategoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedSubcategoryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  subcategoryButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedSubcategoryButtonText: {
    color: Colors.background,
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  conditionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    margin: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flex: 1,
    minWidth: '30%',
  },
  selectedConditionButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  conditionButtonText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedConditionButtonText: {
    color: Colors.background,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  typeButton: {
    padding: Spacing.md,
    margin: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: Colors.background,
  },
  termsSection: {
    padding: Spacing.md,
  },
  termsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    lineHeight: 20,
  },
  fixedActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});