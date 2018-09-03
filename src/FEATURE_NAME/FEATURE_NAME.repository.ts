// <MongoDB>
import { IFeatureName } from './FEATURE_NAME.interface';
import { FeatureNameModel } from './FEATURE_NAME.model';
import { ServerError } from '../utils/errors/applicationError';

export class FeatureNameRepository {
    static create(featureName: IFeatureName)
        : Promise<IFeatureName> {
        return FeatureNameModel.create(featureName);
    }

    static createMany(featureNames: IFeatureName[])
        : Promise<IFeatureName[]> {
        return FeatureNameModel.insertMany(featureNames);
    }

    static updateById(id: string, featureName: Partial<IFeatureName>)
        : Promise<IFeatureName | null> {
        return FeatureNameModel.findByIdAndUpdate(
            id,
            { $set: featureName },
            { new: true, runValidators: true },
        ).exec();
    }

    static updateMany(featureNameFilter: Partial<IFeatureName>, featureName: Partial<IFeatureName>)
        : Promise<any> {

        if (Object.keys(featureName).length === 0) {
            throw new ServerError('Update data is required.');
        }

        return FeatureNameModel.updateMany(
            featureNameFilter,
            { $set: featureName },
        ).exec();
    }

    static deleteById(id: string)
        : Promise<IFeatureName | null> {
        return FeatureNameModel.findByIdAndRemove(
            id,
        ).exec();
    }

    static getById(id: string)
        : Promise<IFeatureName | null> {
        return FeatureNameModel.findById(
            id,
        ).exec();
    }

    static getOne(featureNameFilter: Partial<IFeatureName>)
        : Promise<IFeatureName | null> {
        if (Object.keys(featureNameFilter).length === 0) {
            throw new ServerError('Filter is required.');
        }
        return FeatureNameModel.findOne(
            featureNameFilter,
        ).exec();
    }

    static getMany(featureNameFilter: Partial<IFeatureName>)
        : Promise<IFeatureName[]> {
        return FeatureNameModel.find(
            featureNameFilter,
        ).exec();
    }

    static getAmount(featureNameFilter: Partial<IFeatureName>)
        : Promise<number> {
        return FeatureNameModel
            .countDocuments(featureNameFilter)
            .exec();
    }
}
// </MongoDB>
