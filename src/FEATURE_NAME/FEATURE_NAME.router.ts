import { Router } from 'express';
import { FeatureNameValidator } from './validator/FEATURE_NAME.validator';
import { FeatureNameController } from './FEATURE_NAME.contoller';
import { Wrapper } from '../utils/wrapper';

const FeatureNameRouter: Router = Router();

FeatureNameRouter.post('/', FeatureNameValidator.canCreate, Wrapper.wrapAsync(FeatureNameController.create));

// <MongoDB>
FeatureNameRouter.post('/many', FeatureNameValidator.canCreateMany, Wrapper.wrapAsync(FeatureNameController.createMany));
FeatureNameRouter.put('/many', FeatureNameValidator.canUpdateMany, Wrapper.wrapAsync(FeatureNameController.updateMany));
FeatureNameRouter.put('/:id', FeatureNameValidator.canUpdateById, Wrapper.wrapAsync(FeatureNameController.updateById));
FeatureNameRouter.delete('/:id', FeatureNameValidator.canDeleteById, Wrapper.wrapAsync(FeatureNameController.deleteById));
FeatureNameRouter.get('/one', FeatureNameValidator.canGetOne, Wrapper.wrapAsync(FeatureNameController.getOne));
FeatureNameRouter.get('/many', FeatureNameValidator.canGetMany, Wrapper.wrapAsync(FeatureNameController.getMany));
FeatureNameRouter.get('/amount', FeatureNameValidator.canGetAmount, Wrapper.wrapAsync(FeatureNameController.getAmount));
FeatureNameRouter.get('/:id', FeatureNameValidator.canGetById, Wrapper.wrapAsync(FeatureNameController.getById));

// </MongoDB>
export { FeatureNameRouter };
