import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    create = createRequest({
        method: 'POST',
        url: '/api/featureName/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureName: {
                property: '12345',
            },
        },
    });

    createMany = createRequest({
        method: 'POST',
        url: '/api/featureName/many/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureNames: [{
                property: '12345',
            },
            {
                property: '34567',
            },
            {
                property: '56789',
            }],
        },
    });

    updateMany = createRequest({
        method: 'PUT',
        url: '/api/featureName/many',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: {
            featureNameFilter: {
                property: '12345',
            },
            featureName: {
                property: '12345',
            },
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
            featureName: {
                property: '12345',
            },
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
        url: `/api/featureName/one?featureNameFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
    });

    getMany = createRequest({
        method: 'GET',
        url: `/api/featureName/many?featureNameFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
    });

    getAmount = createRequest({
        method: 'GET',
        url: `/api/featureName/amount?featureNameFilter={'property':'12345'}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: '12345',
        },
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
