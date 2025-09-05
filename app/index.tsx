import { usePrivy } from '@privy-io/expo';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View } from 'react-native';

export default function SplashScreen() {
  const { user } = usePrivy();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuthAndNavigate = async () => {
      try {
        if (user) {
          console.log('User authenticated, navigating to guide');
          setTimeout(() => {
            router.replace('/guide');
          }, 2000);
        } else {
          console.log('No user authenticated, navigating to trailer');
          setTimeout(() => {
            router.replace('/trailer');
          }, 10000);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setTimeout(() => {
          router.replace('/trailer');
        }, 10000);
      }
    };

    checkAuthAndNavigate();
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image source={require('../assets/images/spl.png')} style={styles.splashImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
});