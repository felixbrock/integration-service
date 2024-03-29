// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  UpdateGithubProfile,
  UpdateGithubProfileAuthDto,
  UpdateGithubProfileRequestDto,
  UpdateGithubProfileResponseDto,
} from '../../../domain/github-profile/update-github-profile';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class UpdateGithubProfileController extends BaseController {
  readonly #updateGithubProfile: UpdateGithubProfile;

  readonly #getAccounts: GetAccounts;

  readonly #dbo: Dbo;

  constructor(
    updateGithubProfile: UpdateGithubProfile,
    getAccounts: GetAccounts,
    dbo: Dbo
  ) {
    super();
    this.#updateGithubProfile = updateGithubProfile;
    this.#getAccounts = getAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): UpdateGithubProfileRequestDto => ({
    targetOrgId: httpRequest.body.targetOrgId,
    updateDto: httpRequest.body.updateDto,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): UpdateGithubProfileAuthDto => ({
    isSystemInternal: userAccountInfo.isSystemInternal,
    callerOrgId: userAccountInfo.callerOrgId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return UpdateGithubProfileController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await UpdateGithubProfileController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return UpdateGithubProfileController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new ReferenceError('Authorization failed');

      const requestDto: UpdateGithubProfileRequestDto =
        this.#buildRequestDto(req);
      const authDto: UpdateGithubProfileAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: UpdateGithubProfileResponseDto =
        await this.#updateGithubProfile.execute(
          requestDto,
          authDto,
          this.#dbo.dbConnection
        );

      if (!useCaseResult.success) {
        return UpdateGithubProfileController.badRequest(
          res,
          
        );
      }

      return UpdateGithubProfileController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message) console.trace(error.message);
      else if (error) console.trace(error);
      return UpdateGithubProfileController.fail(res, 'Unknown internal error occurred');
    }
  }
}
