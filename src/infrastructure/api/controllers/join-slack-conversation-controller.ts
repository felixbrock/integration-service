// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  JoinSlackConversation,
  JoinSlackConversationAuthDto,
  JoinSlackConversationRequestDto,
  JoinSlackConversationResponseDto,
} from '../../../domain/slack-api/join-conversation';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class JoinSlackConversationController extends BaseController {
  readonly #joinSlackConversation: JoinSlackConversation;

  readonly #getAccounts: GetAccounts;

  readonly #dbo: Dbo;

  constructor(
    joinSlackConversation: JoinSlackConversation,
    getAccounts: GetAccounts,
    dbo: Dbo
  ) {
    super();
    this.#joinSlackConversation = joinSlackConversation;
    this.#getAccounts = getAccounts;
    this.#dbo = dbo;
  }

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): JoinSlackConversationAuthDto => {
    if (!userAccountInfo.callerOrganizationId) throw new Error('Unauthorized');

    return {
      callerOrganizationId: userAccountInfo.callerOrganizationId,
    };
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return JoinSlackConversationController.unauthorized(
          res,
          'Unauthorized'
        );

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await JoinSlackConversationController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return JoinSlackConversationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new ReferenceError('Authorization failed');

      const requestDto: JoinSlackConversationRequestDto = null;
      const authDto: JoinSlackConversationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: JoinSlackConversationResponseDto =
        await this.#joinSlackConversation.execute(
          requestDto,
          authDto,
          this.#dbo.dbConnection,
          this.#dbo.encryption
        );

      if (!useCaseResult.success) {
        return JoinSlackConversationController.badRequest(
          res,
          useCaseResult.error
        );
      }

      const resultValue = useCaseResult.value;

      return JoinSlackConversationController.ok(
        res,
        resultValue,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return JoinSlackConversationController.fail(res, error);
      if (error instanceof Error)
        return JoinSlackConversationController.fail(res, error);
      return JoinSlackConversationController.fail(res, 'Unknown error occured');
    }
  }
}