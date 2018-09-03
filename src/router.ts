import { Router } from 'express';
import { FeatureNameRouter } from './FEATURE_NAME/FEATURE_NAME.router';

const AppRouter: Router = Router();

AppRouter.use('/api/featureName', FeatureNameRouter);

export { AppRouter };
