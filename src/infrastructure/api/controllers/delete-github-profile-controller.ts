// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteGithubProfile,
  DeleteGithubProfileAuthDto,
  DeleteGithubProfileRequestDto,
  DeleteGithubProfileResponseDto,
} from '../../../domain/github-profile/delete-github-profile';
import Result from '../../../domain/value-types/transient-types/result';
import Dbo from '../../persistence/db/mongo-db';

import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteGithubProfileController extends BaseController {
  readonly #deleteGithubProfile: DeleteGithubProfile;

  readonly #getAccounts: GetAccounts;

  readonly #dbo: Dbo;

  constructor(
    deleteGithubProfile: DeleteGithubProfile,
    getAccounts: GetAccounts,
    dbo: Dbo
  ) {
    super();
    this.#deleteGithubProfile = deleteGithubProfile;
    this.#getAccounts = getAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): DeleteGithubProfileRequestDto => {
    const targetOrgId = httpRequest.query.organizationId;
    if(!targetOrgId) throw new Error('missing organizationId in deletion operation');
    if(typeof targetOrgId !== 'string') throw new Error('Query param need to be provided as string');

    return  {targetOrgId};
  };

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): DeleteGithubProfileAuthDto => ({
    isSystemInternal: userAccountInfo.isSystemInternal,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return DeleteGithubProfileController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteGithubProfileController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteGithubProfileController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new ReferenceError('Authorization failed');

      const requestDto: DeleteGithubProfileRequestDto =
        this.#buildRequestDto(req);
      const authDto: DeleteGithubProfileAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteGithubProfileResponseDto =
        await this.#deleteGithubProfile.execute(
          requestDto,
          authDto,
          this.#dbo.dbConnection,
        );

      if (!useCaseResult.success) {
        return DeleteGithubProfileController.badRequest(
          res,
          
        );
      }

      return DeleteGithubProfileController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message) console.trace(error.message);
      else if (error) console.trace(error);
      return DeleteGithubProfileController.fail(res, 'Unknown internal error occurred');
    }
  }
}
