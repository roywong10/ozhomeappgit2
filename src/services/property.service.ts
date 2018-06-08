import { IPropertyMapFilter } from './../models/propertyMapFilter';
import { IProperty } from './../models/property';
import { IPropertyFilter } from './../models/propertyFilter';
import { Injectable } from '@angular/core';
import {  Response, Headers, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import { ShortlistService } from "./shortlist.service";
import { IShortlistedProperty } from './../models/shortlistedProperty';
import { IPropertySearchApiResult } from "../models/api/propertySearchApiResult";
import { IPropertySummary } from "../models/propertySummary";
import { ISinglePropertyApiResult } from "../models/api/singlePropertyApiResult";
import { GlobalSettings } from "../shared/shared";
import { IMapSearchResultApi } from "../models/api/mapSearchResultApi";
import { IPropertySearchResult } from "../models/api/propertySearchResult";
import { IPropertyArraySearchApiResult } from "../models/api/propertyArraySearchResult";
import { Authentication } from './../shared/authentication.service';
import { SafeHttp } from './http.token.service';
import { IApiResult } from './../models/api/apiResult';
import * as _ from "lodash";

@Injectable()
export class PropertyService {

    private _baseUrl = this._globalSettings.getSettings().apiBaseUrl + "property";
    private _propertySearchUrl = this._baseUrl + '/GetAllProperties';
    private _propertySearchBoundsUrl = this._baseUrl + '/GetAllPropertiesByBounds';
    private _propertySearchBoundsPagedUrl = this._baseUrl + '/GetAllPropertiesByBoundsPaged';
    private _propertyMapSearchUrl = this._baseUrl + '/GetAllPropertiesLatLon';
    private _propertyByIdUrl = this._baseUrl + '/GetPropertyById';
    private _propertiesByIdUrl = this._baseUrl + '/GetPropertiesByIds';
    private _addPropertyToShortlistById = this._baseUrl + '/AddPropertyToShortlistById';
    private _removePropertyFromShortlistById = this._baseUrl + '/RemovePropertyFromShortlistById';
    private shortlistService: ShortlistService;

    constructor(private _safeHttp: SafeHttp, _shortlistService: ShortlistService, private _globalSettings: GlobalSettings, private authentication: Authentication) {
        this.shortlistService = _shortlistService;
    }

    getPropertyById(propertyId: number): Observable<ISinglePropertyApiResult> {
        return this._safeHttp.get(this._propertyByIdUrl, { params: { propertyId: propertyId, Language: this._globalSettings.getSettings().language } })
            .map((response: Response) => {
                return <ISinglePropertyApiResult>response.json()
            })
            .map(data => this.checkIfPropertyShortlisted(data))
            .catch(this.handleError);

    }

    getPropertiesById(propertyIds: Array<number>): Observable<IPropertyArraySearchApiResult> {

        if (propertyIds && propertyIds.length) {
            return this._safeHttp.post(this._propertiesByIdUrl, { PropertyIds: propertyIds, Language: this._globalSettings.getSettings().language })
                .map((response: Response) => <IPropertyArraySearchApiResult>response.json())
                .map(data => this.checkIfArrayOfPropertiesShortlisted(data))
                .catch(this.handleError);
        } else {
            return Observable.create(oberserver => {
                let emptyApiResponse = <IPropertySearchApiResult>{};
                emptyApiResponse.IsValid = true;
                let emptyResponse = <IPropertySearchResult>{};
                emptyResponse.TotalItems = 0;
                emptyResponse.TotalPages = 0;
                emptyResponse.Items = new Array<IProperty>();
                emptyApiResponse.ReturnValue = emptyResponse;
            })
        }


    }

    getPropertiesByIdNoCheck(propertyIds: Array<number>): Observable<IPropertyArraySearchApiResult> {

        if (propertyIds && propertyIds.length) {
            return this._safeHttp.post(this._propertiesByIdUrl, { PropertyIds: propertyIds, Language: this._globalSettings.getSettings().language })
                .map((response: Response) => <IPropertyArraySearchApiResult>response.json())
                .catch(this.handleError);
        } else {
            return Observable.create(oberserver => {
                let emptyApiResponse = <IPropertySearchApiResult>{};
                emptyApiResponse.IsValid = true;
                let emptyResponse = <IPropertySearchResult>{};
                emptyResponse.TotalItems = 0;
                emptyResponse.TotalPages = 0;
                emptyResponse.Items = new Array<IProperty>();
                emptyApiResponse.ReturnValue = emptyResponse;
            })
        }
    }

    addPropertiesToShortlist(shortlistedProperties: Array<IShortlistedProperty>): Observable<Array<IApiResult>> {

        if (!this.authentication.isUserLoggedIn()) {
            return Observable.create(observer => {
                observer.next({ IsValid: true, Errors: null });
                observer.complete();
            });
        }

        let accessToken = this.authentication.getAccessToken();
        let headers = new Headers({ 'Content-Type': 'application/json' });

        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });

        return Observable.create(observer => {

            let obs = shortlistedProperties.map(p => this._safeHttp.post(this._addPropertyToShortlistById, { PropertyId: p.PropertyID, PropertyType: p.PropertyType }, options));

            Observable.forkJoin(obs).subscribe(results => {

                let apiResults = results.map(r => <IApiResult>r.json());
                observer.next(apiResults);
                observer.complete();
            });
        });

    }

    removePropertyFromShortlist(shortlistProperty: IShortlistedProperty): Observable<IApiResult> {

        if (!this.authentication.isUserLoggedIn()) {
            return Observable.create(observer => {
                observer.next({ IsValid: true, Errors: null });
                observer.complete();
            });
        }

        let accessToken = this.authentication.getAccessToken();
        let headers = new Headers({ 'Content-Type': 'application/json' });

        headers.append('Authorization', 'Bearer ' + accessToken);
        let options = new RequestOptions({ headers: headers });

        return this._safeHttp.post(this._removePropertyFromShortlistById, shortlistProperty, options)
            .map(response => <IApiResult>response.json())
            .catch(this.handleError);
    }


    getPropertiesForMap(filterOptions: IPropertyFilter): Observable<IMapSearchResultApi> {

        let searchFilter = _.cloneDeep(filterOptions);

        searchFilter.location = searchFilter.suburbs ? searchFilter.suburbs.map(s => s.SearchResult).join(';') : "";
        searchFilter.propertyType = searchFilter.propertyTypeArray ? searchFilter.propertyTypeArray.map(s => s).join(',') : "ALL";
        delete searchFilter.suburbs;
        delete searchFilter.propertyTypeArray;

        //this code is temporary whilst we are waiting fo the API to be built
        return this._safeHttp.get(this._propertyMapSearchUrl, { params: searchFilter })
            .map((response: Response) => <IMapSearchResultApi>response.json())
            .catch(this.handleError);
    }


    getProperties(filterOptions: IPropertyFilter): Observable<IPropertySearchApiResult> {

        let searchFilter = _.cloneDeep(filterOptions);

        searchFilter.location = searchFilter.suburbs ? searchFilter.suburbs.map(s => s.SearchResult).join(';') : "";
        searchFilter.propertyType = searchFilter.propertyTypeArray ? searchFilter.propertyTypeArray.map(s => s).join(',') : "ALL";
        delete searchFilter.suburbs;
        delete searchFilter.propertyTypeArray;

        searchFilter.language = this._globalSettings.getSettings().language;
        return this._safeHttp.get(this._propertySearchUrl, { params: searchFilter })
            .map((response: Response) => <IPropertySearchApiResult>response.json())
            .map(data => this.checkIfShortlisted(data))
            .catch(this.handleError);
    }

    getPropertiesByBounds(filterOptions: IPropertyMapFilter, isPaged: boolean): Observable<IPropertySearchApiResult> {
        let searchFilter = _.cloneDeep(filterOptions);

        if(!isPaged){
            delete searchFilter.itemsPerPage;
            delete searchFilter.pageNum;
            delete searchFilter.orderby;
        }

        return this._safeHttp.get(isPaged ? this._propertySearchBoundsPagedUrl : this._propertySearchBoundsUrl, { params: searchFilter })
            .map((response: Response) => <IPropertySearchApiResult>response.json())
            .catch(this.handleError);
    }

    private checkIfShortlisted(data: IPropertySearchApiResult) {
        data.ReturnValue.Items.forEach(function (property) {
            this.checkIfSinglePropertyShortlisted(property);
        }, this);
        return data;
    }

    private checkIfArrayOfPropertiesShortlisted(data: IPropertyArraySearchApiResult) {

        data.ReturnValue.forEach(function (property) {
            this.checkIfSinglePropertyShortlisted(property);
        }, this);
        return data;
    }

    private checkIfSinglePropertyShortlisted(property: IPropertySummary) {
        let slservice = this.shortlistService;
        if(property != null){
            slservice.isShortlisted(property.PropertyID).then(function (result) {
                property.IsShortlisted = result.IsShortlisted;
            });
        }
    }

    private checkIfPropertyShortlisted(property: ISinglePropertyApiResult) {
        this.checkIfSinglePropertyShortlisted(property.ReturnValue);
        return property;
    }

    private handleError(error: any) {
        return Observable.throw(error.message || 'Server Error');
    }
}