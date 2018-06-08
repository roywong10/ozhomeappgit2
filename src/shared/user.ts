import { IUserProfile } from './../models/userProfile';
import { IChangePassword } from './../models/changePassword';
import { StorageService } from './../services/storage.service';
import { IUserAccount } from './../models/userAccount';
import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { ReplaySubject } from 'rxjs/Rx';

import { GlobalSettings } from "./shared";
import { SafeHttp } from './../services/http.token.service';

@Injectable()
export class User {

  private baseUrl;
  private userAccount: IUserAccount = null;

  private accessTokenSubject: ReplaySubject<any> = new ReplaySubject(1);

  constructor(private safeHttp: SafeHttp, private globalSettings: GlobalSettings, private storageService: StorageService) {
    // Set the baseUrl variable to the Api Url from the GlobalSettings
    this.baseUrl = globalSettings.getSettings().apiBaseUrl;
  }

  getUser() {
    return this.userAccount;
  }

  setUser(account) {
    this.storageService.setUserInfo(account);
    this.userAccount = account;
  }

  initUser() {
    return this.storageService.getUserInfo().then(userInfo => {
      this.userAccount = userInfo;
    });
  }

  getUserInfo(accessToken) {
    // Construct header that supplies the access token
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + accessToken);

    return this.safeHttp.get(this.baseUrl + 'Account/UserInfo', { headers: headers })
      .map(response => {
        let body = response.json();
        return body;
      });
  }

  getCurrentMemberData(accessToken) {
    // Construct header that supplies the access token
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    headers.append('Authorization', 'Bearer ' + accessToken);
    let options = new RequestOptions({ headers: headers });

    return this.safeHttp.post(this.baseUrl + 'Account/CurrentMemberData', null, options)
      .map(response => {
        let body = response.json();
        return body;
      });
  }

  updateCurrentMemberData(userProfile: IUserProfile, accessToken) {
    // Construct header that supplies the access token
    let headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer ' + accessToken);
    let options = new RequestOptions({ headers: headers });

    var memberData = {
      Email: userProfile.email,
      FirstName: userProfile.firstName,
      LastName: userProfile.lastName,
      Suburb: userProfile.suburb,
      Postcode: userProfile.postcode,
      State: userProfile.state,
    };

    return this.safeHttp.put(this.baseUrl + 'Account/UpdateCurrentMember', memberData, options)
      .map(response => {
        let body = response.json();
        return body;
      });
  }

  // Registers a user in the Web Api using federated login provider (Facebook)
  registerExternalUser(accessToken, username) {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    headers.append('Authorization', 'Bearer ' + accessToken);
    let options = new RequestOptions({ headers: headers });

    /*var registerUserData = {
			Email: username
		};*/
    let registerUserData = 'Email=' + encodeURIComponent(username);
    // Perform request
    return this.safeHttp.post(this.baseUrl + 'Account/RegisterExternal', registerUserData, options);
  }

  // Registers a user in the Web Api using username/password.
  registerLocalUser(userCredentials) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    var registerUserData = {
      Email: userCredentials.Email,
      Password: userCredentials.Password,
      FirstName: userCredentials.FirstName,
      LastName: userCredentials.LastName,
      Suburb: userCredentials.Suburb,
      Postcode: userCredentials.Postcode,
      State: userCredentials.State,
    };

    // Perform request
    return this.safeHttp.post(this.baseUrl + 'Account/Register', registerUserData, options)
      .map((response: Response) => {
        let body = response.json();
        return body;
      });
  }

  forgotPassword(email) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    var EmailData = {Email : email};
    
    return this.safeHttp.post(this.baseUrl + 'Account/ForgotPassword', EmailData, options)
      .map((response: Response) => {
        let body = response.json();
        return body;
      });
  }

  changePassword(passwords: IChangePassword, accessToken: string) {

    let headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Authorization', 'Bearer ' + accessToken);
    let options = new RequestOptions({ headers: headers });

    var passwordData = {
      OldPassword: passwords.oldPassword,
      NewPassword: passwords.newPassword,
      ConfirmPassword: passwords.confirmPassword,
    }

    return this.safeHttp.post(this.baseUrl + 'Account/ChangePassword', passwordData, options)
      .map((response: Response) => {
        let body = response.json();
        return body;
      });
  }

}
