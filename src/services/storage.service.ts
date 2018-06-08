import { ISuburb } from './../models/suburb';
import { IPropertyAlert } from './../models/propertyAlert';
import { IUserAccount } from './../models/userAccount';
import { IShortlistedProperty } from './../models/shortlistedProperty';
import { Storage } from '@ionic/storage';
import { Injectable } from "@angular/core";

@Injectable()

export class StorageService {

    constructor(public storage: Storage) {

    }

    getLanguage(): Promise<string> {
        return this.storage.get('lang');
    }

    setLanguage(language: string): Promise<string> {
        return this.storage.set('lang', language);
    }

    getAppOpenedFirstTime(): Promise<boolean> {
        return this.storage.get('appOpenedFirstTime');
    }
    setAppOpenedFirstTime(hasOpened: boolean): Promise<boolean> {
        return this.storage.set('appOpenedFirstTime', hasOpened);
    }

    getAccessToken(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.storage.get('accessToken').then(result => {
                resolve(result || null);
            });
        });
    }

    setAccessToken(token: string): Promise<string> {
        return this.storage.set('accessToken', token);
    }

    removeAccessToken(): Promise<string> {
        return this.storage.remove('accessToken');
    }

    getUserInfo(): Promise<IUserAccount> {
        return this.storage.get('userInfo');
    }

    setUserInfo(user) {
        return this.storage.set('userInfo', user);
    }

    getShortList(): Promise<Array<IShortlistedProperty>> {
        return new Promise((resolve, reject) => {

            this.storage.get('shortlist').then(result => {

                if (result != null) {
                    resolve(result)
                } else {
                    resolve(new Promise((resolve, reject) => resolve(new Array<IShortlistedProperty>())))
                }
            })
        });
    }

    removePropertyFromShortlist(propertyId: number): void {
        this.getShortList().then(result => {
            let index = result.findIndex(i => i.PropertyID === propertyId);
            result.splice(index, 1);

            this.storage.set('shortlist', result);

        })
    }

    addPropertyToShortlist(property: IShortlistedProperty): void {

        this.getShortList().then(result => {
            result.push(property);

            this.storage.set('shortlist', result);

        })

    }

    addPropertiesToShortlist(properties: Array<IShortlistedProperty>): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            this.getShortList().then(result => {
                let combined = result.concat(properties);
                this.storage.set('shortlist', combined).then(() => { resolve() });
            })
        });
    }

    clearShortlist(): Promise<void> {
        return this.storage.set('shortlist', null);
    }

    getAlerts(): Promise<Array<IPropertyAlert>> {
        return new Promise((resolve, reject) => {

            this.storage.get('userAlerts').then(result => {

                if (result != null) {
                    resolve(result)
                } else {
                    resolve(new Promise((resolve, reject) => resolve(new Array<IPropertyAlert>())))
                }
            })
        });
    }

    getSearchedSuburbs(): Promise<Array<ISuburb>> {
        return new Promise((resolve, reject) => {

            this.storage.get('searchedSuburbs').then(result => {

                if (result != null) {
                    resolve(result)
                } else {
                    resolve(new Promise((resolve, reject) => resolve(new Array<ISuburb>())))
                }
            })
        });
    }

    setSearchedSuburbs(searchedSuburbs: Array<ISuburb>): void {
        this.storage.set('searchedSuburbs', searchedSuburbs);
    }

}