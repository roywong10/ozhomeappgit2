import { SafeHttp } from './http.token.service';
import { StorageService } from './storage.service';
import { ISuburb } from './../models/suburb';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Response } from '@angular/http'
import { ISuburbSearchApiResult } from "../models/api/suburbSearchApiResult";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { GlobalSettings } from "../shared/shared";

@Injectable()
export class SuburbServiceService {

    private _sburbSearchUrl = this._globalSettings.getSettings().apiBaseUrl + 'property/GetSuburbInfo';

    //keep the last 5 searched for suburb
    private previouslySearchedSuburbs: Promise<Array<ISuburb>>;


    constructor(private safeHttp: SafeHttp,
        private _globalSettings: GlobalSettings,
        private storageService: StorageService) {

        this.previouslySearchedSuburbs = this.storageService.getSearchedSuburbs();
    }


    getSuburbs(searchTerm: string): Observable<ISuburbSearchApiResult> {

        return this.safeHttp.get(this._sburbSearchUrl, { params: { searchTerm } })
            .map((response: Response) => <ISuburbSearchApiResult>response.json())
            .catch(this.handleError);

    }

    getPrevioulsySearchSuburbs() {
        return this.previouslySearchedSuburbs;
    }

    updatedPrevioulsySearchSuburbs(suburbs: Array<ISuburb>) {

        if (suburbs && suburbs.length) {
            
            //check for suburbs to add to array
            this.previouslySearchedSuburbs.
                then(pSuburbs => {
                    suburbs.forEach(suburb => {
                        if (pSuburbs.find(s => s.SearchResult === suburb.SearchResult) === undefined) {
                            if (pSuburbs.length > 4) {
                                pSuburbs.shift();
                            }
                            pSuburbs.push(suburb);
                        }

                    });
                    this.storageService.setSearchedSuburbs(pSuburbs);
                });
        }

    }

    private handleError(error: Response) {
        return Observable.throw(error);
    }

}