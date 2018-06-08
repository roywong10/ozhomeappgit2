import { StorageService } from './../services/storage.service';
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { AsyncSubject } from 'rxjs/Rx';
import { CredentialsAuthentication, FacebookAuthentication, GlobalSettings, User } from "./shared";

@Injectable()
export class Authentication {

  private baseUrl;
  private accessToken = null;

  constructor(
    private http: Http,
    private credentialsAuthentication: CredentialsAuthentication,
    private facebookAuthentication: FacebookAuthentication,
    private storageService: StorageService,
    private user: User,
    private globalSettings: GlobalSettings) {
    // Set the baseUrl variable to the Api Url from the GlobalSettings
    this.baseUrl = globalSettings.getSettings().apiBaseUrl;
  }

  isUserLoggedIn() {
    let isloggedIn = this.accessToken != null;
    //console.log(isloggedIn);

    return isloggedIn;
  }

  initAccessToken() {
    return this.storageService.getAccessToken()
      .then(token => {
        this.accessToken = token;
      });
  }

  getAccessToken() {
    return this.accessToken;
  }

  facebookLogin() {
    let accessTokenSubject: AsyncSubject<any> = new AsyncSubject();

    this.facebookAuthentication.login().subscribe(accessToken => {

      this.accessToken = accessToken.accessToken;
      this.storageService.setAccessToken(this.accessToken);

      accessTokenSubject.next(accessToken);
      accessTokenSubject.complete();
    });

    return accessTokenSubject;
  }


  credentialsLogin(credentials) {
    let accessTokenSubject = new AsyncSubject();

    this.credentialsAuthentication.login(credentials)
      .subscribe(accessToken => {
        // Cache the access token in the service
        this.accessToken = accessToken;

        // Save the access token in storage
        this.storageService.setAccessToken(accessToken);

        // Set the access token as the result for the observerable
        accessTokenSubject.next(accessToken);
        accessTokenSubject.complete();
      }, error => {
        let body = JSON.parse(error["_body"]);
        accessTokenSubject.error(body.error_description || 'Error logging in.');
      });

    return accessTokenSubject;
  }

  logout() {
    // Construct request header
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    headers.append('Authorization', 'Bearer ' + this.accessToken);
    let options = new RequestOptions({ headers: headers });

    // Clear the saved accessToken
    this.clearLoginDetails().then();

    // Remove saved credentials from Facebook login service
    // this.facebookAuthentication.logout();

    // Perform request
    return this.http.post(this.baseUrl + 'Account/Logout', null, options);
  }


  clearLoginDetails() {
    return new Promise<void>((resolve, reject) => {

      this.storageService.removeAccessToken().then(() => {
        this.accessToken = null;
        this.storageService.setUserInfo(null).then(() => {
          this.user.setUser(null);
          this.storageService.clearShortlist().then(() => {
            resolve();
          });
        });
      });
    });
  }


}
