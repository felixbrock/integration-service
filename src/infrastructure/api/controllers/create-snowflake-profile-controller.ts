// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateSnowflakeProfile,
  CreateSnowflakeProfileAuthDto,
  CreateSnowflakeProfileRequestDto,
  CreateSnowflakeProfileResponseDto,
} from '../../../domain/snowflake-profile/create-snowflake-profile';
import { buildSnowflakeProfileDto } from '../../../domain/snowflake-profile/snowflake-profile-dto';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateSnowflakeProfileController extends BaseController {
  readonly #createSnowflakeProfile: CreateSnowflakeProfile;

  readonly #getAccounts: GetAccounts;

  readonly #dbo: Dbo;

  constructor(
    createSnowflakeProfile: CreateSnowflakeProfile,
    getAccounts: GetAccounts,
    dbo: Dbo
  ) {
    super();
    this.#createSnowflakeProfile = createSnowflakeProfile;
    this.#getAccounts = getAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): CreateSnowflakeProfileRequestDto => ({
    accountId: httpRequest.body.accountId,
    username: httpRequest.body.username,
    password: httpRequest.body.password,
    warehouseName: httpRequest.body.warehouseName,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): CreateSnowflakeProfileAuthDto => {
    if (!userAccountInfo.callerOrgId) throw new Error('Unauthorized');

    return {
      callerOrgId: userAccountInfo.callerOrgId,
      isSystemInternal: userAccountInfo.isSystemInternal
    };
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateSnowflakeProfileController.unauthorized(
          res,
          'Unauthorized'
        );

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateSnowflakeProfileController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateSnowflakeProfileController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new ReferenceError('Authorization failed');

      const requestDto: CreateSnowflakeProfileRequestDto =
        this.#buildRequestDto(req);
      const authDto: CreateSnowflakeProfileAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateSnowflakeProfileResponseDto =
        await this.#createSnowflakeProfile.execute(
          requestDto,
          authDto,
          this.#dbo.dbConnection
        );

      if (!useCaseResult.success) {
        return CreateSnowflakeProfileController.badRequest(res);
      }

      const resultValue = useCaseResult.value
        ? buildSnowflakeProfileDto(useCaseResult.value)
        : useCaseResult.value;

      return CreateSnowflakeProfileController.ok(
        res,
        resultValue,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message) console.trace(error.message);
      else if (error) console.trace(error);
      return CreateSnowflakeProfileController.fail(
        res,
        'Unknown internal error occurred'
      );
    }
  }
}
