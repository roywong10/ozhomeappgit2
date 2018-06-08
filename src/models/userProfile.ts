import { IUserAccount } from './userAccount';
export interface IUserProfile extends IUserAccount {
    suburb: string;
    state: string;
    postcode: string;
    isSocialLogin : boolean;
}