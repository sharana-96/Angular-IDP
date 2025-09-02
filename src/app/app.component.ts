import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  user: string | null = null;
  apiResponse: string = '';

  constructor(private msalService: MsalService) {}

  ngOnInit() {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.user = account.username;
    }
  }

  /** Login with popup */
  login() {
    this.msalService.loginPopup({
      scopes: ['api://f873fe70-e679-41e2-905a-954c1c297b6e/access_as_user'] ,
      authority: "https://login.microsoftonline.com/0ae51e19-07c8-4e4b-bb6d-648ee58410f4/",  

    }).subscribe({
      next: (response) => {
        this.msalService.instance.setActiveAccount(response.account);
        this.user = response.account?.username ?? null;
      },
      error: (err) => console.error('Login error:', err),
    });
  }

  /** Call backend API with token */
  callApi() {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) {
      console.warn('No active account, please login first.');
      return;
    }

    this.msalService.instance.acquireTokenSilent({
      scopes: ['api://f873fe70-e679-41e2-905a-954c1c297b6e/access_as_user'], // ✅ must be same scope as login
      account: activeAccount,
    })
    .then((result) => {
      if (!result.accessToken) {
        throw new Error('Empty access token');
      }

      console.log('AccessToken:', result.accessToken);
    
  
      return fetch('/Angular-IdP/api/secure/hello', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      this.apiResponse = await response.text();
      console.log('API Response:', this.apiResponse);
    })
    .catch((error) => {
      console.error('API call failed:', error);
    });
  }
}
