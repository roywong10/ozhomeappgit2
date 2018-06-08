import { IPropertySummary } from "./propertySummary";
import { IInspection } from "./inspection";
import { IRealEstateAgent } from "./realEstateAgent";

export interface IProperty extends IPropertySummary {

    Heading: string;
    FullDescription: string;
    FloorPlans: Array<string>;
    State: string
    Suburb: string;
    Street: string;
    SaleType: string;
    Inspections:Array<IInspection>;
    AuctionDate: Date;
    AuctionText: string;
    RealEstateName: string;
    RealEstateAddress: string;
    Agents: Array<IRealEstateAgent>;
    RelatedProperties: Array<IProperty>;
    CrossOver: string;
    VideoUrl: string;

}



