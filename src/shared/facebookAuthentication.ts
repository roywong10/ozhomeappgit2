import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import {ReplaySubject, AsyncSubject, Subject} from 'rxjs/Rx';

import { GlobalSettings } from "./shared";

@Injectable()
export class FacebookAuthentication {

  private baseUrl;
 
  constructor (private http: Http, 
               private globalSettings: GlobalSettings, 
               private iab: InAppBrowser) {
    // Set the baseUrl variable to the Api Url from the GlobalSettings
    this.baseUrl = globalSettings.getSettings().apiBaseUrl;
  }

  // Helper method for fetching the registered login provider options from the API.
  // Every login option will come with a URL matching an endpoint on the backend which must be called
  // to retrieve the login screen for the federated login.
  private getExternalLoginUrl() {
    // Return URL for an HTML app is just a local page. This page does NOT need to exist in the app.
    var returnUrl = 'http%3A%2F%2Flocalhost%2Fcallback';
    return this.http.get(this.baseUrl + 'Account/ExternalLogins?returnUrl=' + returnUrl + '&generateState=true')
    .map( response => {
      // In this instance I am just returning the URL for the Facebook login
      let data = response.json()[0];
      return data.Url;
    });
  }

  // Helper method for getting the external login screen from the Federated login provider
  private getExternalLoginScreen(url) {
    let loginScreenSubject: AsyncSubject<any>  = new AsyncSubject();
    //let browser = new InAppBrowser(this.baseUrl + url, '_blank', 'location=no,toolbar=no,hardwareback=no,EnableViewPortScale=yes');
    let browser = this.iab.create(this.baseUrl + url, '_blank', 'location=no,toolbar=no,hardwareback=no,EnableViewPortScale=yes,clearcache=yes');
    // When the browser is done loading, retrieve the access token and close the
    // InAppBrowser again.
   
    browser.on('loadstart').subscribe( e => {
       
        let accessTokenQueryParams = e.url.match(/\?access_token\=([\S\s]*?)\&/);
        let userEmailQueryParams = e.url.match(/\&email\=([\S\s)]*?)#_=_/);
       
        if (accessTokenQueryParams != null && userEmailQueryParams != null) {
          browser.close();
          let accessToken = accessTokenQueryParams[1];
          let email = userEmailQueryParams[1];
          loginScreenSubject.next({ accessToken: accessToken, email: email});
          loginScreenSubject.complete();
          
        }else{
          
            let accessDeniedQueryParams =  e.url.match('\#error\=access_denied');
            if(accessDeniedQueryParams != null){
              browser.close();
              loginScreenSubject.complete();
              
          }
        }
    });

    return loginScreenSubject;
  }

  // Checks if a user already exists in the Web Api
  private isUserRegistered = function () {

  }

  // Registers a user in the Web Api.
  // A user must be registered before it can retrieve protected resources.
  private registerUser = function (accessToken) {

  }


  // Public function for loggin in with facebook
  login () {

    let accessTokenSubject:AsyncSubject<any> = new AsyncSubject<any>();

    this.getExternalLoginUrl().subscribe((url) => {

      this.getExternalLoginScreen(url).subscribe((token) =>{
          accessTokenSubject.next(token);
          accessTokenSubject.complete();
        });
    });
    return accessTokenSubject;
  };

  logout () {
     // Open a browser window that cleares the InAppBrowser cache in order to forget the entered Facebook credentials.
    // The URL for the page does not have to be an existing page.
    // The important stuff here is just that the window is opened and the cahce cleared
//    let browser = new InAppBrowser('/logout', '_blank', 'location=no,toolbar=no,hardwareback=no,EnableViewPortScale=yes,clearcache=yes,clearsessioncache=yes');

    let browser = this.iab.create('/logout', '_blank', 'location=no,toolbar=no,hardwareback=no,EnableViewPortScale=yes,clearcache=yes,clearsessioncache=yes');

    browser.on("loadstop")
    .subscribe((e) => {
     browser.close();
    },
    err => {
      
    });
  }
}
