import { IPropertyBase } from "./propertyBase";

export interface IPropertySummary extends IPropertyBase {

    PropertyID: number;
    PropertyType: string;
    Price: string;
    Address: string;
    Bedrooms: number;
    Bathrooms: number;
    Parking: number;
    Images: Array<string>;
    RealestateOfficeLogo: string;
    IsSold: boolean;
    IsNew: boolean;
    IsUnderContract: boolean;
    Latitude: number;
    Longtitude: number;
    IsShortlisted: boolean;
    LandType: string;
    LandSize: string;
    NextInspectionTime: Date;
    WebsiteUrl:string;
    
}