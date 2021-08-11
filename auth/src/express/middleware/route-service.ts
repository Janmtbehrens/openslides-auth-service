import express, { Request, Response } from 'express';

import { AuthHandler } from '../../api/interfaces/auth-handler';
import { AuthService } from '../../api/services/auth-service';
import { Inject } from '../../util/di';
import { Logger } from '../../api/services/logger';
import { RouteHandler } from '../interfaces/route-handler';
import { Token } from '../../core/ticket';

export default class RouteService extends RouteHandler {
    public name = 'RouteHandler';

    @Inject(AuthService)
    private authHandler: AuthHandler;

    public async login(request: express.Request, response: express.Response): Promise<void> {
        const username = request.body.username;
        const password = request.body.password;
        Logger.log(`user: ${username} -- signs in`);

        const result = await this.authHandler.login(username, password);
        if (!result.result) {
            this.sendResponse(false, response, result.message, 403);
            return;
        }

        response.locals['newToken'] = result.result.token;
        response.locals['newCookie'] = result.result.cookie;
        this.sendResponse(true, response);
    }

    public async whoAmI(request: express.Request, response: express.Response): Promise<void> {
        const cookieAsString = request.cookies[AuthHandler.COOKIE_NAME];
        const result = await this.authHandler.whoAmI(cookieAsString);
        if (!result.isValid || (result.isValid && !result.result)) {
            response.clearCookie(AuthHandler.COOKIE_NAME);
            this.sendResponse(true, response, 'anonymous');
            return;
        }
        response.locals['newToken'] = result.result?.token;
        this.sendResponse(true, response);
    }

    public logout(_request: express.Request, response: express.Response): void {
        const token = response.locals['token'] as Token;
        try {
            this.authHandler.logout(token);
            response.clearCookie(AuthHandler.COOKIE_NAME);
            this.sendResponse(true, response);
        } catch (e) {
            this.sendResponse(false, response, e, 403);
        }
    }

    public async getListOfSessions(_request: express.Request, response: express.Response): Promise<void> {
        this.sendResponse(true, response, undefined, 200, { sessions: await this.authHandler.getListOfSessions() });
    }

    public clearUserSessionById(request: express.Request, response: express.Response): void {
        const userId = request.body['sessionId'];
        try {
            this.authHandler.clearUserSessionById(userId);
            this.sendResponse(true, response);
        } catch (e) {
            this.sendResponse(false, response, e, 403);
        }
    }

    public clearAllSessionsExceptThemselves(request: express.Request, response: express.Response): void {
        const token = response.locals['token'] as Token;
        try {
            this.authHandler.clearAllSessionsExceptThemselves(token.sessionId);
            this.sendResponse(true, response);
        } catch (e) {
            this.sendResponse(false, response, e, 403);
        }
    }

    public hash(request: express.Request, response: express.Response): void {
        const toHash = request.body['toHash'];
        this.sendResponse(true, response, undefined, 200, { hash: this.authHandler.toHash(toHash) });
    }

    public isEquals(request: express.Request, response: express.Response): void {
        const toHash = request.body['toHash'];
        const toCompare = request.body['toCompare'];
        this.sendResponse(true, response, undefined, 200, {
            isEquals: this.authHandler.isEquals(toHash, toCompare)
        });
    }

    public async notFound(request: Request, response: Response): Promise<void> {
        this.sendResponse(false, response, 'Your requested resource is not found...', 404);
    }

    public index(_: any, response: Response): void {
        this.sendResponse(true, response, 'Authentication service is available');
    }

    public secureIndex(_: any, response: Response): void {
        this.sendResponse(true, response, 'Yeah! An api resource!');
    }

    public authenticate(_: any, response: Response): void {
        const token = response.locals['token'] as Token;
        this.sendResponse(true, response, undefined, 200, { userId: token.userId, sessionId: token.sessionId });
    }
}
