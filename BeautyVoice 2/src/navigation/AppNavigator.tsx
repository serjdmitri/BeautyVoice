import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTranslation } from 'react-i18next';

import RegisterScreen from '../screens/auth/RegisterScreen';
import LanguageSelectScreen from '../screens/auth/LanguageSelectScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TestListScreen from '../screens/tests/TestListScreen';
import TestDetailScreen from '../screens/tests/TestDetailScreen';
import SurveyFormScreen from '../screens/tests/SurveyFormScreen';
import TestCompleteScreen from '../screens/tests/TestCompleteScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EventsScreen from '../screens/events/EventsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import CreateTestScreen from '../screens/admin/CreateTestScreen';
import AdminResultsScreen from '../screens/admin/AdminResultsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.email?.includes('admin'); // Replace with real admin check from your backend

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen name="TestsTab" component={TestListScreen} options={{ title: t('tabs.tests') }} />
      <Tab.Screen name="EventsTab" component={EventsScreen} options={{ title: t('tabs.events') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('tabs.profile') }} />
      {isAdmin && (
        <Tab.Screen name="AdminTab" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="TestDetail" component={TestDetailScreen} />
            <Stack.Screen name="SurveyForm" component={SurveyFormScreen} />
            <Stack.Screen name="TestComplete" component={TestCompleteScreen} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            <Stack.Screen name="AdminMain" component={AdminDashboardScreen} />
            <Stack.Screen name="CreateTest" component={CreateTestScreen} />
            <Stack.Screen name="AdminResults" component={AdminResultsScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
