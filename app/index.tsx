import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { initializeBookService } from '../services/bookService';

export default function Index() {
  useEffect(() => {
    initializeBookService();
  }, []);

  return <Redirect href="/(tabs)/home" />;
}