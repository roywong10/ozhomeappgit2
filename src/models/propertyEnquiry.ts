export interface IPropertyEnquiry {
    priceGuide: boolean;
    contractOfSale: boolean;
    similarProperties: boolean;
    inspectionTimes: boolean;

    name: string;
    phone: string;
    email: string;
    weChatId: string;
    other: string;

    propertyType: string;
    propertyId: number;
}