export interface IShortlistedProperty{

    PropertyID: number;
    PropertyType: string;   
}

export class ShortlistedProperty implements IShortlistedProperty{

    constructor(propertyId, propertyType){
        this.PropertyID = propertyId;
        this.PropertyType = propertyType;
    }
    public PropertyID: number;
    public PropertyType: string;   
}