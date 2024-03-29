// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  QuerySnowflake,
  QuerySnowflakeAuthDto,
  QuerySnowflakeRequestDto,
  QuerySnowflakeResponseDto,
} from '../../../domain/snowflake-api/query-snowflake';
import { buildSnowflakeQueryDto } from '../../../domain/snowflake-api/snowflake-query-dto';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class QuerySnowflakeController extends BaseController {
  readonly #querySnowflake: QuerySnowflake;

  readonly #getAccounts: GetAccounts;

  readonly #dbo: Dbo;

  constructor(
    querySnowflake: QuerySnowflake,
    getAccounts: GetAccounts,
    dbo: Dbo
  ) {
    super();
    this.#querySnowflake = querySnowflake;
    this.#getAccounts = getAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): QuerySnowflakeRequestDto => ({
    query: httpRequest.body.query,
    targetOrgId: httpRequest.body.targetOrgId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): QuerySnowflakeAuthDto => ({
    callerOrgId: userAccountInfo.callerOrgId,
    isSystemInternal: userAccountInfo.isSystemInternal,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return QuerySnowflakeController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await QuerySnowflakeController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return QuerySnowflakeController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new ReferenceError('Authorization failed');

      const requestDto: QuerySnowflakeRequestDto = this.#buildRequestDto(req);
      const authDto: QuerySnowflakeAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: QuerySnowflakeResponseDto =
        await this.#querySnowflake.execute(
          requestDto,
          authDto,
          this.#dbo.dbConnection
        );

      if (!useCaseResult.success) {
        return QuerySnowflakeController.badRequest(res);
      }

      const resultValue = useCaseResult.value
        ? buildSnowflakeQueryDto(useCaseResult.value)
        : useCaseResult.value;

      return QuerySnowflakeController.ok(res, resultValue, CodeHttp.CREATED);
    } catch (error: unknown) {
      if (error instanceof Error && error.message) console.trace(error.message);
      else if (error) console.trace(error);
      return QuerySnowflakeController.fail(
        res,
        'Unknown internal error occurred'
      );
    }
  }
}
