import { Types } from 'mongoose';
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();
const validProperty: string = '12345';

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
                property: validProperty,
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
                property: validProperty,
            },
            {
                property: validProperty,
            },
            {
                property: validProperty,
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
                property: validProperty,
            },
            featureName: {
                property: validProperty,
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
                property: validProperty,
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
        url: `/api/featureName/one?featureNameFilter={'property':${validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: validProperty,
        },
    });

    getMany = createRequest({
        method: 'GET',
        url: `/api/featureName/many?featureNameFilter={'property':${validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: validProperty,
        },
    });

    getAmount = createRequest({
        method: 'GET',
        url: `/api/featureName/amount?featureNameFilter={'property':${validProperty}}`,
        headers: {
            authorization: this.authorizationHeader,
        },
        query: {
            property: validProperty,
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
