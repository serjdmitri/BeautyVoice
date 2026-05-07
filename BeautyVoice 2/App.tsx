import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useDispatch } from 'react-redux';
import { loadStoredSession } from './src/store/authSlice';
import { AppDispatch } from './src/store/store';
import { registerForPushNotifications } from './src/services/notifications';
import './src/i18n';

function AppInner() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadStoredSession());
    registerForPushNotifications().catch(console.error);
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AppInner />
    </Provider>
  );
}
