import { Request, Response, NextFunction } from 'express';
import { FeatureNameValidations } from './FEATURE_NAME.validations';
import { PropertyInvalidError, IdInvalidError } from '../../utils/errors/userErrors';
import { IFeatureName } from '../FEATURE_NAME.interface';

export class FeatureNameValidator {

    static canCreate(req: Request, res: Response, next: NextFunction) {
        next(FeatureNameValidator.validateProperty(req.body.featureName.property));
    }

    static canCreateMany(req: Request, res: Response, next: NextFunction) {
        const propertiesValidations: (Error | undefined)[] = req.body.featureNames.map((featureName: IFeatureName) => {
            return FeatureNameValidator.validateProperty(featureName.property);
        });

        next(FeatureNameValidator.getNextValueFromArray(propertiesValidations));
    }

    static canUpdateById(req: Request, res: Response, next: NextFunction) {
        next(
            FeatureNameValidator.validateId(req.params.id) ||
            FeatureNameValidator.validateProperty(req.body.featureName.property));
    }

    static canUpdateMany(req: Request, res: Response, next: NextFunction) {
        next(FeatureNameValidator.validateProperty(req.body.featureName.property));
    }

    static canDeleteById(req: Request, res: Response, next: NextFunction) {
        next(FeatureNameValidator.validateId(req.params.id));
    }

    static canGetById(req: Request, res: Response, next: NextFunction) {
        next(FeatureNameValidator.validateId(req.params.id));
    }

    static canGetOne(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetMany(req: Request, res: Response, next: NextFunction) {
        next();
    }

    static canGetAmount(req: Request, res: Response, next: NextFunction) {
        next();
    }

    private static validateProperty(property: string) {
        if (!FeatureNameValidations.isPropertyValid(property)) {
            return new PropertyInvalidError();
        }

        return undefined;
    }

    private static validateId(id: string) {
        if (!FeatureNameValidations.isIdValid(id)) {
            return new IdInvalidError();
        }

        return undefined;
    }

    private static getNextValueFromArray(validationsArray: (Error | undefined)[]) {
        let nextValue: Error | undefined;

        for (let index = 0; index < validationsArray.length; index++) {
            if (validationsArray[index] !== undefined) {
                nextValue = validationsArray[index];
            }
        }

        return nextValue;
    }
}
