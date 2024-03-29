import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { DbConnection } from '../services/i-db';
import { ISlackApiRepo } from './i-slack-api-repo';
import { ReadSlackProfile } from '../slack-profile/read-slack-profile';
import { SlackProfile } from '../entities/slack-profile';
import { SlackConversationInfo } from '../value-types/slack-conversation-info';

export type GetSlackConversationsRequestDto = {
  accessToken?: string;
};

export interface GetSlackConversationsAuthDto {
  callerOrgId: string;
}

export type GetSlackConversationsResponseDto = Result<SlackConversationInfo[]>;

export class GetSlackConversations
  implements
    IUseCase<
      GetSlackConversationsRequestDto,
      GetSlackConversationsResponseDto,
      GetSlackConversationsAuthDto,
      DbConnection
    >
{
  readonly #slackApiRepo: ISlackApiRepo;

  readonly #readSlackProfile: ReadSlackProfile;

  #dbConnection: DbConnection;

  constructor(slackApiRepo: ISlackApiRepo, readSlackProfile: ReadSlackProfile) {
    this.#slackApiRepo = slackApiRepo;
    this.#readSlackProfile = readSlackProfile;
  }

  #getSlackProfile = async (
    organizationId: string
  ): Promise<SlackProfile | undefined> => {
    const readSlackProfileResult = await this.#readSlackProfile.execute(
      null,
      {
        callerOrgId: organizationId,
      },
      this.#dbConnection
    );

    if (!readSlackProfileResult.success)
      throw new Error(readSlackProfileResult.error);

    return readSlackProfileResult.value;
  };

  async execute(
    request: GetSlackConversationsRequestDto,
    auth: GetSlackConversationsAuthDto,
    dbConnection: DbConnection
  ): Promise<GetSlackConversationsResponseDto> {
    try {
      this.#dbConnection = dbConnection;

      let {accessToken} = request;

      if (!accessToken) {
        const slackProfile = await this.#getSlackProfile(
          auth.callerOrgId
        );

        if (!slackProfile) return Result.ok([]);

        accessToken = slackProfile.accessToken;
      }

      const conversations = await this.#slackApiRepo.getConversations(
        accessToken
      );

      // if (slackQuery.organizationId !== auth.organizationId)
      //   throw new Error('Not authorized to perform action');

      return Result.ok(conversations);
    } catch (error: unknown) {
      if(error instanceof Error) console.error(error.stack);
      else if (error) console.trace(error);
      return Result.fail('');
    }
  }
}
