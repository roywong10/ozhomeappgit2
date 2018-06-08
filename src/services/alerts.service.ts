import { IPropertyAlertArrayApiResult } from './../models/api/propertyAlertArrayResultApi';
import { Observable } from 'rxjs/Observable';
import { Response, Headers, RequestOptions } from "@angular/http";
import { GlobalSettings } from './../shared/globalSettings';
import { IPropertyAlert } from './../models/propertyAlert';
import { Injectable } from '@angular/core';
import { ISuburb } from "../models/suburb";
import { SafeHttp } from './http.token.service';

@Injectable() 
export class PropertyAlertsService {

    private _alertApiBaseUrl = this.globalSettings.getSettings().apiBaseUrl + 'alert';

    constructor(private safeHttp: SafeHttp, 
        private globalSettings: GlobalSettings) {

    }

    getUserAlerts(accessToken: string): Observable<IPropertyAlertArrayApiResult> {

        var headers = new Headers();
        headers.append('Authorization', 'Bearer ' + accessToken);

        return this.safeHttp.get(this._alertApiBaseUrl + '/CurrentMemberAlerts', { headers: headers })
            .map((response: Response) => {
                var data = <IPropertyAlertArrayApiResult>response.json();
                data.ReturnValue.map(a => {
                    a.suburbs = new Array<ISuburb>();
                    a.propertyTypeList = new Array<string>();
                    if (a.Locations.length > 0) {
                        var locationSplit = a.Locations.split(';')
                        locationSplit.forEach((v, i) => {
                            var suburbSplit = v.split(',');
                            var suburb = <ISuburb>{
                                Suburb: suburbSplit[0],
                                State: suburbSplit[1],
                                Postcode: suburbSplit[2],
                                checked: true
                            };
                            suburb.SearchResult = suburb.Suburb + ', ' + suburb.State + ', ' + suburb.Postcode;
                            a.suburbs.push(suburb);
                        });
                    }
                    if (a.PropertyType.length > 0) {
                        a.propertyTypeList = a.PropertyType.split(',');
                    }
                });
                return data;
            })
            .catch(this.handleError);
    }

    addAlert(alert: IPropertyAlert, accessToken: string) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });

        let newAlert = this.mapAlert(alert);

        return this.safeHttp.post(this._alertApiBaseUrl + '/CreateAlert', newAlert, options)
            .map(response => {
                let body = JSON.parse(response["_body"]);
                return body;
            })
            .catch(this.handleError);
    }

    updateAlert(alert: IPropertyAlert, accessToken: string) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });

        let updatedAlert = this.mapAlert(alert);

        return this.safeHttp.put(this._alertApiBaseUrl + '/UpdateAlert', updatedAlert, options)
            .map(response => {
                let body = JSON.parse(response["_body"]);
                return body;
            })
            .catch(this.handleError);
    }

    removeAlert(id: string, accessToken: string) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });
        options.body = {
            id: id
        };
        return this.safeHttp.delete(this._alertApiBaseUrl + '/DeleteAlert/', options)
            .map(response => {
                let body = JSON.parse(response["_body"]);
                return body;
            })
            .catch(this.handleError);
    }

    private mapAlert(alert: IPropertyAlert) {
        let newAlert = {
            Id: alert.Id,
            AlertName: alert.AlertName,
            Location: alert.suburbs ? alert.suburbs.map(s => s.SearchResult).join(';') : '',
            PropertyType: alert.propertyTypeList.join(','),
            NoOfRooms: alert.Bedrooms,
            NoOfBathrooms: alert.Bathrooms,
            NoOfCarspaces: alert.Parking,
            PriceMin: alert.PriceFrom,
            PriceMax: alert.PriceTo,
            IsSold: alert.IsSold,
            IncludeSurroundingSuburb: alert.IncludeSurroundingSuburb
        }
        return newAlert;
    }

    private handleError(error: Response) {
        return Observable.throw(error);
    }
}
