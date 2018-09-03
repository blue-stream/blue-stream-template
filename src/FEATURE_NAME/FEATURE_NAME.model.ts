// <MongoDB>
import * as mongoose from 'mongoose';
import { IFeatureName } from './FEATURE_NAME.interface';

const featureNameSchema: mongoose.Schema = new mongoose.Schema(
    {
        property: { type: String, required: true },
    },
    {
        autoIndex: false,
        timestamps: true,
        id: true,
    });

export const FeatureNameModel = mongoose.model<IFeatureName & mongoose.Document>('FeatureName', featureNameSchema);
// </MongoDB>
