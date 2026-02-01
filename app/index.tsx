import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { bookService } from '../services/bookService';

export default function Index() {
  useEffect(() => {
    bookService.initializeBookService();
  }, []);

  return <Redirect href="/(tabs)/home" />;
}