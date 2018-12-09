import * as request from 'supertest';
import { expect } from 'chai';
// <MongoDB>
import * as mongoose from 'mongoose';
// </MongoDB>

import { IFeatureName } from './FEATURE_NAME.interface';
import { Server } from '../server';
import { PropertyInvalidError, IdInvalidError, FeatureNameNotFoundError } from '../utils/errors/userErrors';
import { config } from '../config';
import { FeatureNameManager } from './FEATURE_NAME.manager';
import { sign } from 'jsonwebtoken';

describe('FeatureName Module', function () {
    let server: Server;
    const validProppertyString: string = '12345';
    const featureName: IFeatureName = {
        property: validProppertyString,
    };
    const authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;
    const invalidId: string = '1';
    const invalidProppertyString: string = '123456789123456789';
    const invalidFeatureName: IFeatureName = {
        property: invalidProppertyString,
    };
    // <MongoDB>

    const featureName2: IFeatureName = {
        property: '45678',
    };
    const featureName3: IFeatureName = {
        property: '6789',
    };

    const unexistingFeatureName: IFeatureName = {
        property: 'a',
    };

    const featureNames: IFeatureName[] =
        [featureName, featureName2, featureName3, featureName3];

    const invalidFeatureNames: IFeatureName[] =
        [featureName, invalidFeatureName, featureName3];

    // </MongoDB>
    before(async function () {
        // <MongoDB>
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
        // </MongoDB>
        server = Server.bootstrap();
    });

    // <MongoDB>
    after(async function () {
        await mongoose.connection.db.dropDatabase();
    });
    // </MongoDB>

    describe('#POST /api/featureName/', function () {
        context('When request is valid', function () {
            // <MongoDB>
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });
            // </MongoDB>

            it('Should return created featureName', function (done: MochaDone) {
                request(server.app)
                    .post('/api/featureName/')
                    .send({ featureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', validProppertyString);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            // <MongoDB>
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });
            // </MongoDB>

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .post('/api/featureName/')
                    .send({ featureName: invalidFeatureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });
    // <MongoDB>
    describe('#POST /api/featureName/many/', function () {
        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });

            it('Should return created featureName', function (done: MochaDone) {
                request(server.app)
                    .post('/api/featureName/many/')
                    .send({ featureNames })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body[1]).to.have.property('property', featureNames[1].property);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .post('/api/featureName/many/')
                    .send({ featureNames: invalidFeatureNames })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#PUT /api/featureName/many', function () {
        let returnedFeatureNames: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureNames = await FeatureNameManager.createMany(featureNames);
            });

            it('Should return updated featureName', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/many`)
                    .send({ featureName: featureName2, featureNameFilter: featureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('ok', 1);
                        expect(res.body).to.have.property('nModified', 1);

                        done();
                    });
            });

            it('Should return 404 error status code', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/many`)
                    .send({ featureName, featureNameFilter: unexistingFeatureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(404)
                    .end((error: Error, res: request.Response) => {
                        expect(res).to.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', FeatureNameNotFoundError.name);
                        expect(res.body).to.have.property('message', new FeatureNameNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureNames = await FeatureNameManager.createMany(featureNames);
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/many`)
                    .send({ featureName: invalidFeatureName, featureNameFilter: featureName2 })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#PUT /api/featureName/:id', function () {
        let returnedFeatureName: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return updated featureName', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/${returnedFeatureName.id}`)
                    .send({ featureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', featureName.property);

                        done();
                    });
            });

            it('Should return error status when id is not found', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/${new mongoose.Types.ObjectId()}`)
                    .send({ featureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', FeatureNameNotFoundError.name);
                        expect(res.body).to.have.property('message', new FeatureNameNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/2`)
                    .send({ featureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });

            it('Should return error status when property is invalid', function (done: MochaDone) {
                request(server.app)
                    .put(`/api/featureName/${returnedFeatureName.id}`)
                    .send({ featureName: invalidFeatureName })
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', PropertyInvalidError.name);
                        expect(res.body).to.have.property('message', new PropertyInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#DELETE /api/featureName/:id', function () {
        let returnedFeatureName: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return updated featureName', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/featureName/${returnedFeatureName.id}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', featureName.property);

                        done();
                    });
            });

            it('Should return error status when id not found', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/featureName/${new mongoose.Types.ObjectId()}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', FeatureNameNotFoundError.name);
                        expect(res.body).to.have.property('message', new FeatureNameNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .delete(`/api/featureName/${invalidId}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/featureName/one', function () {
        let returnedFeatureNames: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureNames = await FeatureNameManager.createMany(featureNames);
            });

            it('Should return featureName', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/one?property=${featureName3.property}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', featureNames[2].property);

                        done();
                    });
            });

            it('Should return error when featureName not found', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/one?property=${unexistingFeatureName.property}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(res).to.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', FeatureNameNotFoundError.name);
                        expect(res.body).to.have.property('message', new FeatureNameNotFoundError().message);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/featureName/many', function () {
        let returnedFeatureNames: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureNames = await FeatureNameManager.createMany(featureNames);
            });

            it('Should return featureName', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/many?property=${featureName3.property}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('array');
                        expect(res.body[1]).to.have.property('property', featureNames[2].property);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/featureName/amount', function () {
        let returnedFeatureNames: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureNames = await FeatureNameManager.createMany(featureNames);
            });

            it('Should return featureName', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/amount?property=${featureName3.property}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).be.equal(2);

                        done();
                    });
            });
        });
    });

    describe('#GET /api/featureName/:id', function () {
        let returnedFeatureName: any;

        context('When request is valid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return featureName', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/${returnedFeatureName.id}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res).to.exist;
                        expect(res.status).to.equal(200);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('property', featureName.property);

                        done();
                    });
            });

            it('Should return error when featureName not found', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/${new mongoose.Types.ObjectId()}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(404)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(res).to.exist;
                        expect(res.status).to.equal(404);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', FeatureNameNotFoundError.name);
                        expect(res.body).to.have.property('message', new FeatureNameNotFoundError().message);

                        done();
                    });
            });
        });

        context('When request is invalid', function () {
            beforeEach(async function () {
                await mongoose.connection.db.dropDatabase();
                returnedFeatureName = await FeatureNameManager.create(featureName);
            });

            it('Should return error status when id is invalid', function (done: MochaDone) {
                request(server.app)
                    .get(`/api/featureName/${invalidId}`)
                    // <Authentication using JWT>
                    .set({ authorization: authorizationHeader })
                    // </Authentication using JWT>
                    .expect(400)
                    .expect('Content-Type', /json/)
                    .end((error: Error, res: request.Response) => {
                        expect(error).to.not.exist;
                        expect(res.status).to.equal(400);
                        expect(res).to.have.property('body');
                        expect(res.body).to.be.an('object');
                        expect(res.body).to.have.property('type', IdInvalidError.name);
                        expect(res.body).to.have.property('message', new IdInvalidError().message);

                        done();
                    });
            });
        });
    });
    // </MongoDB>
});
