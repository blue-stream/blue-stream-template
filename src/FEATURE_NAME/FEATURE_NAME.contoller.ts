import { Request, Response } from 'express';
import { FeatureNameManager } from './FEATURE_NAME.manager';
// <MongoDB>
import { FeatureNameNotFoundError } from '../utils/errors/userErrors';
import { UpdateWriteOpResult } from 'mongodb';

type UpdateResponse = UpdateWriteOpResult['result'];
export class FeatureNameController {
    static async create(req: Request, res: Response) {
        res.json(await FeatureNameManager.create(req.body.featureName));
    }

    static async createMany(req: Request, res: Response) {
        res.json(await FeatureNameManager.createMany(req.body.featureNames));
    }

    static async updateById(req: Request, res: Response) {
        const updated = await FeatureNameManager.updateById(req.params.id, req.body.featureName);
        if (!updated) {
            throw new FeatureNameNotFoundError();
        }

        res.json(updated);
    }

    static async updateMany(req: Request, res: Response) {

        const updated: UpdateResponse = await FeatureNameManager.updateMany(req.body.featureNameFilter, req.body.featureName);

        if (updated.n === 0) {
            throw new FeatureNameNotFoundError();
        }

        res.json(updated);
    }

    static async deleteById(req: Request, res: Response) {
        const deleted = await FeatureNameManager.deleteById(req.params.id);
        if (!deleted) {
            throw new FeatureNameNotFoundError();
        }

        res.json(deleted);
    }

    static async getById(req: Request, res: Response) {
        const featureName = await FeatureNameManager.getById(req.params.id);
        if (!featureName) {
            throw new FeatureNameNotFoundError();
        }

        res.json(featureName);
    }

    static async getOne(req: Request, res: Response) {
        const featureName = await FeatureNameManager.getOne(req.query);
        if (!featureName) {
            throw new FeatureNameNotFoundError();
        }

        res.json(featureName);
    }

    static async getMany(req: Request, res: Response) {
        res.json(await FeatureNameManager.getMany(req.query));
    }

    static async getAmount(req: Request, res: Response) {
        res.json(await FeatureNameManager.getAmount(req.query));
    }
}
// </MongoDB>
// !<MongoDB>
export class FeatureNameController_REMOVE/*MongoDB*/ {
    static async create(req: Request, res: Response) {
        res.json(await FeatureNameManager.create(req.body));
    }
}
// !</MongoDB>
