export interface IPropertyMapFilter {

    language: string;
    pageNum: number;
    itemsPerPage: number;
    pricefrom: number;
    priceto: number;
    propertyTypeArray: Array<string>;
    propertyType: string;
    beds: number;
    baths: number;
    cars: number;
    orderby: string;
    isSold: boolean;
    north: number; //ne lat
    south: number; //sw lat
    east: number; //ne long
    west: number; //sw long
}