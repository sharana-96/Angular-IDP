import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';

import { MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

// Factory to create instance
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: '<Client ID>', 
      redirectUri: 'http://localhost:4200', 
      authority: 'https://login.microsoftonline.com/<tenant id>',
    },
    cache: {
      cacheLocation: 'localStorage', // optional
      storeAuthStateInCookie: false, // optional
    },
  });
}

// Create instance manually
const msalInstance = MSALInstanceFactory();

// ✅ Ensure initialization before Angular starts
msalInstance.initialize().then(() => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideHttpClient(),
      {
        provide: MSAL_INSTANCE,
        useValue: msalInstance,
      },
      MsalService,
    ],
  });
});
