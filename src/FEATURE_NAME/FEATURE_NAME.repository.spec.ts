// <MongoDB>
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { config } from '../config';
import { ServerError } from '../utils/errors/applicationError';
import { IFeatureName } from './FEATURE_NAME.interface';
import { FeatureNameRepository } from './FEATURE_NAME.repository';

const validId: string = new mongoose.Types.ObjectId().toHexString();
const invalidId: string = 'invalid id';
const featureName: IFeatureName = {
    property: 'prop',
};
const featureNameArr: IFeatureName[] = ['prop', 'prop', 'prop', 'b', 'c', 'd'].map(item => ({ property: item }));
const invalidFeatureName: any = {
    property: { invalid: true },
};
const featureNameFilter: Partial<IFeatureName> = { property: 'prop' };
const featureNameDataToUpdate: Partial<IFeatureName> = { property: 'updated' };
const unexistingFeatureName: Partial<IFeatureName> = { property: 'unexisting' };
const unknownProperty: Object = { unknownProperty: true };

describe('FeatureName Repository', function () {
    before(async function () {
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
    });

    afterEach(async function () {
        await mongoose.connection.dropDatabase();
    });

    after(async function () {
        await mongoose.connection.close();
    });

    describe('#create()', function () {
        context('When featureName is valid', function () {
            it('Should create featureName', async function () {
                const createdFeatureName = await FeatureNameRepository.create(featureName);
                expect(createdFeatureName).to.exist;
                expect(createdFeatureName).to.have.property('property', 'prop');
                expect(createdFeatureName).to.have.property('createdAt');
                expect(createdFeatureName).to.have.property('updatedAt');
                expect(createdFeatureName).to.have.property('_id').which.satisfies((id: any) => {
                    return mongoose.Types.ObjectId.isValid(id);
                });
            });
        });

        context('When featureName is invalid', function () {
            it('Should throw validation error when incorrect property type', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.create(invalidFeatureName);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/cast.+failed/i);
                    expect(err).to.have.property('errors');
                    expect(err.errors).to.have.property('property');
                    expect(err.errors.property).to.have.property('name', 'CastError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should throw validation error when empty featureName passed', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.create({} as IFeatureName);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown);
                }
            });
        });
    });

    describe('#createMany()', function () {
        context('When data is valid', function () {
            it('Should create many documents', async function () {
                const createdDocuments = await FeatureNameRepository.createMany(featureNameArr);

                expect(createdDocuments).to.exist;
                expect(createdDocuments).to.be.an('array');
                expect(createdDocuments).to.have.lengthOf(6);
            });

            it('Should not create documents when empty array passed', async function () {
                const docs = await FeatureNameRepository.createMany([]);

                expect(docs).to.exist;
                expect(docs).to.be.an('array');
                expect(docs).to.be.empty;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when 1 of the docs invalid', async function () {
                let hasThrown = false;
                const docs: IFeatureName[] = [
                    ...featureNameArr,
                    {} as IFeatureName,
                ];

                try {
                    await FeatureNameRepository.createMany(docs);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#updateById()', function () {

        let createdFeatureName: IFeatureName;

        beforeEach(async function () {
            createdFeatureName = await FeatureNameRepository.create(featureName);
            expect(createdFeatureName).have.property('id');
        });

        context('When data is valid', function () {

            it('Should update an existsing featureName', async function () {
                const updatedDoc = await FeatureNameRepository.updateById(createdFeatureName.id!, featureNameDataToUpdate);
                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('id', createdFeatureName.id);
                for (const prop in featureNameDataToUpdate) {
                    expect(updatedDoc).to.have.property(prop, featureNameDataToUpdate[prop as keyof IFeatureName]);
                }
            });

            it('Should not update an existing featureName when empty data provided', async function () {
                const updatedDoc = await FeatureNameRepository.updateById(createdFeatureName.id!, {});
                expect(updatedDoc).to.exist;
                expect(updatedDoc).to.have.property('id', createdFeatureName.id);

                for (const prop in featureName) {
                    expect(updatedDoc).to.have.property(prop, createdFeatureName[prop as keyof IFeatureName]);
                }
            });

            it('Should return null when updated doc does not exists', async function () {
                const updatedDoc = await FeatureNameRepository.updateById(new mongoose.Types.ObjectId().toHexString(), {});
                expect(updatedDoc).to.not.exist;
            });
        });

        context('When data is not valid', function () {
            it('Should throw error when updated doc is not valid', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.updateById(createdFeatureName.id as string, { property: null } as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ValidationError');
                    expect(err).to.have.property('message').that.matches(/path.+required/i);
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#updateMany()', function () {

        beforeEach(async function () {
            await FeatureNameRepository.createMany(featureNameArr);
        });

        context('When data is valid', function () {

            it('Should update many documents', async function () {
                const updated = await FeatureNameRepository.updateMany(featureNameFilter, featureNameDataToUpdate);

                const amountOfRequiredUpdates = featureNameArr.filter((item: IFeatureName) => {
                    let match = true;
                    for (const prop in featureNameFilter) {
                        match = match && item[prop as keyof IFeatureName] === featureNameFilter[prop as keyof IFeatureName];
                    }

                    return match;
                }).length;

                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', amountOfRequiredUpdates);

                const documents = await FeatureNameRepository.getMany(featureNameDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(amountOfRequiredUpdates);
            });

            it('Should update all documents when no filter passed', async function () {
                const updated = await FeatureNameRepository.updateMany({}, featureNameDataToUpdate);
                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', featureNameArr.length);

                const documents = await FeatureNameRepository.getMany(featureNameDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(featureNameArr.length);
            });

            it('Should do nothing when criteria does not match any document', async function () {
                const updated = await FeatureNameRepository.updateMany(unexistingFeatureName, featureNameDataToUpdate);
                expect(updated).to.exist;
                expect(updated).to.have.property('nModified', 0);

                const documents = await FeatureNameRepository.getMany(featureNameDataToUpdate);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });

        });

        context('When data is invalid', function () {

            it('Should throw error when empty data provided', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.updateMany(featureNameFilter, {});
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err instanceof ServerError).to.be.true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should not update documents when invalid data passed', async function () {
                await FeatureNameRepository.updateMany({}, unknownProperty);

                const documents = await FeatureNameRepository.getMany({});
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.satisfy((documents: IFeatureName[]) => {
                    documents.forEach((doc: IFeatureName) => {
                        for (const prop in unknownProperty) {
                            expect(doc).to.not.have.property(prop);
                        }
                    });

                    return true;
                });
            });
        });
    });

    describe('#deleteById()', function () {

        let document: IFeatureName;

        beforeEach(async function () {
            document = await FeatureNameRepository.create(featureName);
        });

        context('When data is valid', function () {

            it('Should delete document by id', async function () {
                const deleted = await FeatureNameRepository.deleteById(document.id!);
                expect(deleted).to.exist;
                expect(deleted).to.have.property('id', document.id);

                const doc = await FeatureNameRepository.getById(document.id!);
                expect(doc).to.not.exist;
            });

            it('Should return null when document not exists', async function () {
                const deleted = await FeatureNameRepository.deleteById(new mongoose.Types.ObjectId().toHexString());
                expect(deleted).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when id is not in the correct format', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.deleteById('invalid id');
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'CastError');
                    expect(err).to.have.property('kind', 'ObjectId');
                    expect(err).to.have.property('path', '_id');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getById()', function () {

        context('When data is valid', function () {

            let document: IFeatureName;
            beforeEach(async function () {
                document = await FeatureNameRepository.create(featureName);
            });

            it('Should return document by id', async function () {
                const doc = await FeatureNameRepository.getById(document.id!);
                expect(doc).to.exist;
                expect(doc).to.have.property('id', document.id);
                for (const prop in featureName) {
                    expect(doc).to.have.property(prop, featureName[prop as keyof IFeatureName]);
                }
            });

            it('Should return null when document not exists', async function () {
                const doc = await FeatureNameRepository.getById(validId);
                expect(doc).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when id is not in correct format', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.getById(invalidId);
                } catch (err) {
                    hasThrown = true;

                    expect(err).to.exist;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });
        });
    });

    describe('#getOne()', function () {

        context('When data is valid', function () {
            let document: IFeatureName;

            beforeEach(async function () {
                document = await FeatureNameRepository.create(featureName);
            });

            it('Should return document by id', async function () {
                const doc = await FeatureNameRepository.getOne({ _id: document.id } as Partial<IFeatureName>);
                expect(doc).to.exist;
                for (const prop in featureName) {
                    expect(doc).to.have.property(prop, featureName[prop as keyof IFeatureName]);
                }
            });

            it('Should return document by property', async function () {
                const doc = await FeatureNameRepository.getOne(featureNameFilter);
                expect(doc).to.exist;
                expect(doc).to.have.property('id', document.id);
                for (const prop in featureName) {
                    expect(doc).to.have.property(prop, featureName[prop as keyof IFeatureName]);
                }
            });

            it('Should return null when document not exists', async function () {
                const doc = await FeatureNameRepository.getOne(unexistingFeatureName);
                expect(doc).to.not.exist;
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when filter not exists', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.getOne({});
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err instanceof ServerError).to.be.true;
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return null when filter is not in the correct format', async function () {
                const doc = await FeatureNameRepository.getOne(unknownProperty);
                expect(doc).to.not.exist;
            });
        });
    });

    describe('#getMany()', function () {

        context('When data is valid', function () {

            beforeEach(async function () {
                await FeatureNameRepository.createMany(featureNameArr);
            });

            it('Should return all documents when filter is empty', async function () {
                const documents = await FeatureNameRepository.getMany({});
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(featureNameArr.length);
            });

            it('Should return only matching documents', async function () {
                const documents = await FeatureNameRepository.getMany(featureNameFilter);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');

                const amountOfRequiredDocuments = featureNameArr.filter((item: IFeatureName) => {
                    let match = true;
                    for (const prop in featureNameFilter) {
                        match = match && item[prop as keyof IFeatureName] === featureNameFilter[prop as keyof IFeatureName];
                    }

                    return match;
                }).length;

                expect(documents).to.have.lengthOf(amountOfRequiredDocuments);
            });

            it('Should return empty array when critiria not matching any document', async function () {
                const documents = await FeatureNameRepository.getMany(unexistingFeatureName);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });
        });

        context('When data is invalid', function () {
            it('Should throw error when filter is not an object', async function () {
                let hasThrown = false;

                try {
                    await FeatureNameRepository.getMany(0 as any);
                } catch (err) {
                    hasThrown = true;
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'ObjectParameterError');
                } finally {
                    expect(hasThrown).to.be.true;
                }
            });

            it('Should return null when filter is not in correct format', async function () {
                const documents = await FeatureNameRepository.getMany(unknownProperty);
                expect(documents).to.exist;
                expect(documents).to.be.an('array');
                expect(documents).to.have.lengthOf(0);
            });
        });
    });

    describe('#getAmount()', function () {

        context('When data is valid', function () {

            beforeEach(async function () {
                await FeatureNameRepository.createMany(featureNameArr);
            });

            it('Should return amount of all documents when no filter provided', async function () {
                const amount = await FeatureNameRepository.getAmount({});
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(featureNameArr.length);
            });

            it('Should return amount of filtered documents', async function () {
                const amount = await FeatureNameRepository.getAmount(featureNameFilter);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');

                const amountOfRequiredDocuments = featureNameArr.filter((item: IFeatureName) => {
                    let match = true;
                    for (const prop in featureNameFilter) {
                        match = match && item[prop as keyof IFeatureName] === featureNameFilter[prop as keyof IFeatureName];
                    }

                    return match;
                }).length;

                expect(amount).to.equal(amountOfRequiredDocuments);
            });

            it('Should return 0 when no documents matching filter', async function () {
                const amount = await FeatureNameRepository.getAmount(unexistingFeatureName);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });
        });

        context('When data is invalid', function () {
            it('Should return 0 when filter is not in the correct format', async function () {
                const amount = await FeatureNameRepository.getAmount(unknownProperty);
                expect(amount).to.exist;
                expect(amount).to.be.a('number');
                expect(amount).to.equal(0);
            });
        });
    });

});
// </MongoDB>
