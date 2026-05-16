import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { ProfileOnboardingScreen } from '@/screens/onboarding/ProfileOnboardingScreen';
import { LocationPermissionScreen } from '@/screens/onboarding/LocationPermissionScreen';
import { ProductDetailScreen } from '@/screens/product/ProductDetailScreen';
import { ChatRoomScreen } from '@/screens/chat/ChatRoomScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { UserProfileScreen } from '@/screens/profile/UserProfileScreen';
import { CreateReportScreen } from '@/screens/report/CreateReportScreen';
import { CreateRatingScreen } from '@/screens/rating/CreateRatingScreen';
import { MarkAsSoldScreen } from '@/screens/product/MarkAsSoldScreen';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { isProfileComplete, hasLocation } from '@/stores/authStore';
import { LoadingView } from '@/components/common/LoadingView';

import { AppTabs } from './AppTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.ReactElement {
  const { initialized, session, profile } = useAuth();
  const { coords } = useLocation();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (!initialized) return <LoadingView label="Memuat aplikasi..." />;

  // Not authenticated
  if (!session) {
    return authMode === 'login' ? (
      <LoginScreen onGoToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterScreen onGoToLogin={() => setAuthMode('login')} />
    );
  }

  // Profile not complete
  if (!isProfileComplete(profile)) return <ProfileOnboardingScreen />;

  // Location not set yet
  if (!hasLocation(profile) && !coords) return <LocationPermissionScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppTabs" component={AppTabs} />
        <Stack.Screen
          name="ProductDetail"
          options={{ headerShown: true, title: 'Detail Produk' }}
        >
          {({ navigation, route }) => (
            <ProductDetailScreen
              productId={route.params.productId}
              onClose={() => navigation.goBack()}
              onOpenChat={(conversationId, productName, peerName) =>
                navigation.navigate('ChatRoom', { conversationId, productName, peerName })
              }
              onMarkSold={(productId) => navigation.navigate('MarkAsSold', { productId })}
              onReport={(p) => navigation.navigate('CreateReport', p)}
              onOpenSeller={(userId) => navigation.navigate('UserProfile', { userId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ChatRoom" options={{ headerShown: true, title: 'Chat' }}>
          {({ route }) => (
            <ChatRoomScreen
              conversationId={route.params.conversationId}
              productName={route.params.productName}
              peerName={route.params.peerName}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="EditProfile" options={{ headerShown: true, title: 'Edit Profil' }}>
          {({ navigation }) => <EditProfileScreen onClose={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="UserProfile" options={{ headerShown: true, title: 'Profil' }}>
          {({ navigation, route }) => (
            <UserProfileScreen
              userId={route.params.userId}
              onPressProduct={(item) => navigation.navigate('ProductDetail', { productId: item.id })}
              onReport={(p) => navigation.navigate('CreateReport', p)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="CreateReport" options={{ headerShown: true, title: 'Laporkan' }}>
          {({ navigation, route }) => (
            <CreateReportScreen
              productId={route.params.productId}
              reportedUserId={route.params.reportedUserId}
              onClose={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="CreateRating" options={{ headerShown: true, title: 'Rating' }}>
          {({ navigation, route }) => (
            <CreateRatingScreen
              transactionId={route.params.transactionId}
              reviewedUserId={route.params.reviewedUserId}
              productId={route.params.productId}
              onClose={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="MarkAsSold" options={{ headerShown: true, title: 'Tandai Terjual' }}>
          {({ navigation, route }) => (
            <MarkAsSoldScreen productId={route.params.productId} onClose={() => navigation.goBack()} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
