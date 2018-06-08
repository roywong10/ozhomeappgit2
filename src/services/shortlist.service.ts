import { IPropertySummary } from './../models/propertySummary';
import { IPropertyArraySearchApiResult } from "../models/api/propertyArraySearchResult";
import { Injectable } from '@angular/core';

import { StorageService } from "./storage.service";
import { RequestOptions, Headers } from '@angular/http'
import { SafeHttp } from './../services/http.token.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { IShortlistedProperty } from './../models/shortlistedProperty';

import { GlobalSettings } from "../shared/shared";
import { Authentication } from './../shared/authentication.service';

@Injectable()
export class ShortlistService {

    private shortlistedPropertyUrl:string;

    constructor(public storageService: StorageService,
                private safeHttp: SafeHttp, 
                private globalSettings: GlobalSettings, 
                 private authentication: Authentication) {
        this.shortlistedPropertyUrl  =  globalSettings.getSettings().apiBaseUrl + "property/";
    }

    getShortList() : Promise<Array<IShortlistedProperty>> {
        return this.storageService.getShortList();
    }

    
    isShortlisted(propertyId: number): Promise<any> {

        return new Promise((resolve, reject) => {

            this.storageService.getShortList().then(result => {
                if (result && result.findIndex(i => i.PropertyID === propertyId) > -1) {
                    resolve({ IsShortlisted: true, shortlist: result });
                } else {
                    resolve({ IsShortlisted: false, shortlist: result });
                }
            } )
        });
    }

    toggleProperty(property: IPropertySummary): Promise<any> {

        return this.isShortlisted(property.PropertyID).then(result => {

            if (result.IsShortlisted) {

                this.storageService.removePropertyFromShortlist(property.PropertyID);

                property.IsShortlisted = false;

            } else {

                let shortlistedProperty: IShortlistedProperty = { PropertyID: property.PropertyID, PropertyType: property.PropertyType};
                this.storageService.addPropertyToShortlist(shortlistedProperty);
                property.IsShortlisted = true;

            }

             return Promise.resolve(property);

        }, function (result) {
            //error happened

             return Promise.reject(property);

        });

    }

    getServerShortlistedProperty(): Observable<IPropertyArraySearchApiResult>{

        let accessToken = this.authentication.getAccessToken();
        let headers = new Headers({ 'Content-Type': 'application/json' });
        
        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });


        let getShortlistedPropertyUrl  = this.shortlistedPropertyUrl + 
                                        "/GetShortlistedPropertiesForMember?language=" + 
                                        this.globalSettings.getSettings().language;

        if(this.authentication.isUserLoggedIn()){

            return this.safeHttp.get(getShortlistedPropertyUrl, options)
                        .map( response => <IPropertyArraySearchApiResult>response.json() )
                        .catch(this.handleError);
        }else{
            return new Observable(ob => ob.next({ReturnValue: []}));
        }
    }


    private handleError(error: any) {
        return Observable.throw(error.message || 'Server Error');
    }

}   
