import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {
    readonly validProperty: string = '12345';

    readonly featureName = {
        property: this.validProperty,
    };

    readonly featureNameFilter = this.featureName;

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    create = createRequest({
        method: 'POST',
        url: '/api/featureName/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureName: this.featureName,
        },
    });

    createMany = createRequest({
        method: 'POST',
        url: '/api/featureName/many/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureNames: [
                this.featureName,
                this.featureName,
                this.featureName,
            ],
        },
    });

    updateMany = createRequest({
        method: 'PUT',
        url: '/api/featureName/many',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureNameFilter: this.featureNameFilter,
            featureName: this.featureName,
        },
    });

    updateById = createRequest({
        method: 'PUT',
        url: '/api/featureName/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
        body: {
            featureName: this.featureName,
        },
    });

    deleteById = createRequest({
        method: 'DELETE',
        url: '/api/featureName/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });

    getOne = createRequest({
        method: 'GET',
        url: `/api/featureName/one?featureNameFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.featureName,
    });

    getMany = createRequest({
        method: 'GET',
        url: `/api/featureName/many?featureNameFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.featureName,
    });

    getAmount = createRequest({
        method: 'GET',
        url: `/api/featureName/amount?featureNameFilter={'property':${this.validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.featureName,
    });

    getById = createRequest({
        method: 'GET',
        url: '/api/featureName/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
        },
    });
}
