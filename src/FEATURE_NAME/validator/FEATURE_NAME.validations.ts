// <MongoDB>
import { Types } from 'mongoose';
// </MongoDB>
export class FeatureNameValidations {
    static isPropertyValid(property: string): boolean {
        return (!!property && property.length < 10);
    }

    // <MongoDB>
    static isIdValid(id: string): boolean {
        return (!!id && Types.ObjectId.isValid(id));
    }
    // </MongoDB>

    // !<MongoDB>
    static isIdValid_REMOVE(id: string): boolean {
        return (!!id);
    }
    // !</MongoDB>

}
