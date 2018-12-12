// <MongoDB>
import { Types } from 'mongoose';
// </MongoDB>
import { createRequest, createResponse } from 'node-mocks-http';
import { sign } from 'jsonwebtoken';
import { config } from '../../config';

export const responseMock = createResponse();

export class ValidRequestMocks {
    readonly validProperty: string = '12345';
    readonly validProperty2: string = '23456';
    readonly validProperty3: string = '34567';

    readonly featureName = {
        property: this.validProperty,
    };

    readonly featureName2 = {
        property: this.validProperty2,
    };

    readonly featureName3 = {
        property: this.validProperty3,
    };

    readonly featureNameFilter = this.featureName;

    authorizationHeader = `Bearer ${sign('mock-user', config.authentication.secret)}`;

    create = createRequest({
        method: 'POST',
        url: '/api/featureName/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: this.featureName,
    });

    // <MongoDB>

    createMany = createRequest({
        method: 'POST',
        url: '/api/featureName/many/',
        headers: {
            authorization: this.authorizationHeader,
        },
        body: [
            this.featureName,
            this.featureName2,
            this.featureName3,
        ],
    });

    updateById = createRequest({
        method: 'PUT',
        url: '/api/featureName/:id',
        headers: {
            authorization: this.authorizationHeader,
        },
        params: {
            id: new Types.ObjectId(),
            id_REMOVE: '12345',
        },
        body: this.featureName,
    });

    updateMany = createRequest({
        method: 'PUT',
        url: '/api/featureName/many',
        headers: {
            authorization: this.authorizationHeader,
        },
        query: this.featureNameFilter,
        body: this.featureName,
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
    // <MongoDB>
}
