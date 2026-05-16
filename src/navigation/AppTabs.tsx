import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';

import { ChatListScreen } from '@/screens/chat/ChatListScreen';
import { FavoritesScreen } from '@/screens/profile/FavoritesScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { MyProfileScreen } from '@/screens/profile/MyProfileScreen';
import { ProductCreateScreen } from '@/screens/product/ProductCreateScreen';
import { SearchScreen } from '@/screens/search/SearchScreen';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import type { RootStackParamList } from './types';

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  SellTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
  FavoritesTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface Props {
  navigation: NavigationProp<RootStackParamList>;
}

export function AppTabs({ navigation }: Props): React.ReactElement {
  const { signOut } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          title: 'Beranda',
          tabBarLabel: 'Beranda',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      >
        {() => (
          <HomeScreen
            onPressProduct={(item) => navigation.navigate('ProductDetail', { productId: item.id })}
            onPressSearch={() => (navigation as never as { jumpTo?: (n: string) => void }).jumpTo?.('SearchTab') ?? null}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SearchTab"
        options={{
          title: 'Cari',
          tabBarLabel: 'Cari',
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      >
        {() => (
          <SearchScreen
            onPressProduct={(item) => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="SellTab"
        options={{
          title: 'Jual',
          tabBarLabel: 'Jual',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size + 6} color={color} />
          ),
        }}
      >
        {() => <ProductCreateScreen onCreated={() => navigation.navigate('AppTabs')} />}
      </Tab.Screen>
      <Tab.Screen
        name="FavoritesTab"
        options={{
          title: 'Favorit',
          tabBarLabel: 'Favorit',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      >
        {() => (
          <FavoritesScreen
            onPressProduct={(item) => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="ChatTab"
        options={{
          title: 'Chat',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <ChatListScreen
            onOpenChat={(conversationId, productName, peerName) =>
              navigation.navigate('ChatRoom', { conversationId, productName, peerName })
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="ProfileTab"
        options={{
          title: 'Saya',
          tabBarLabel: 'Saya',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      >
        {() => (
          <MyProfileScreen
            onEdit={() => navigation.navigate('EditProfile')}
            onSignOut={signOut}
            onPressProduct={(item) => navigation.navigate('ProductDetail', { productId: item.id })}
            onOpenRating={(p) => navigation.navigate('CreateRating', p)}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
