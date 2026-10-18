// The app's one rating service: expo-store-review (SKStoreReviewController on iOS, Play In-App Review on Android)
// + AsyncStorage for the counters. See nclexRatingService.js for the rules and IN_APP_REVIEW.md for testing.
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import { createRatingService } from './nclexRatingService';

export const rating = createRatingService({
  storage: AsyncStorage,
  platform: Platform.OS,
  appVersion: Constants.expoConfig?.version || '',
  review: StoreReview,
  linking: Linking,
  log: (...a) => { if (__DEV__) console.log(...a); },
});
