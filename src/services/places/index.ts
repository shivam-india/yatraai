// ==============================================================================
// YATRA AI - PLACES SERVICE FACTORY
// Seamlessly routes between SerpApiPlacesProvider and DemoPlacesProvider
// ==============================================================================

import { PlacesProvider } from './types';
import { serpApiPlacesProvider } from './serpApiPlacesProvider';
import { demoPlacesProvider } from './demoPlacesProvider';
import { serpApiClient } from '../serpapi/client';

export function getPlacesProvider(): PlacesProvider {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (!isDemo && serpApiClient.isConfigured()) {
    return serpApiPlacesProvider;
  }

  return demoPlacesProvider;
}

export const placesProvider = getPlacesProvider();
export * from './types';
export * from './demoData';

