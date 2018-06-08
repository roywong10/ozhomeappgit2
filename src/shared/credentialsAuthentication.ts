import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { ReplaySubject, Observable } from 'rxjs/Rx';

import { GlobalSettings } from "./shared";

@Injectable()
export class CredentialsAuthentication {

  private baseUrl;
 // private accessTokenSubject:ReplaySubject<any> = new ReplaySubject(1);

  constructor (private http: Http, private globalSettings: GlobalSettings) {
    this.baseUrl = globalSettings.getSettings().apiBaseUrl;
  }

  login (credentials) {
    // Construct data
    let loginData = 'grant_type=password&username=' + credentials.username + '&password=' + credentials.password;

    // Construct POST Headers
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let options = new RequestOptions({ headers: headers });

    // Perform request
    return this.http.post(this.baseUrl + 'Token', loginData, options)
    .map( response => {
      let body = JSON.parse(response["_body"]);
      return body.access_token;
    })
    .catch(this.handleError);
  }

  private handleError (error:any){
   return Observable.throw(error);
  }
}
