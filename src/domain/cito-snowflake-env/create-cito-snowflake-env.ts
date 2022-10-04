import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { DbConnection } from '../services/i-db';
import { QuerySnowflake } from '../snowflake-api/query-snowflake';
import {
  citoMaterializationTypes,
  getCreateTableQuery,
  getCreateDbSchemaQuery,
} from '../services/snowflake-materialization-creation-model';

export type CreateCitoSnowflakeEnvRequestDto = null;

export interface CreateCitoSnowflakeEnvAuthDto {
  callerOrganizationId: string;
  isSystemInternal: boolean;
}

export type CreateCitoSnowflakeEnvResponseDto = Result<{
  organizationId: string;
  success: boolean;
}>;

export class CreateCitoSnowflakeEnv
  implements
    IUseCase<
      CreateCitoSnowflakeEnvRequestDto,
      CreateCitoSnowflakeEnvResponseDto,
      CreateCitoSnowflakeEnvAuthDto,
      DbConnection
    >
{
  readonly #querySnowflake: QuerySnowflake;

  #dbConnection: DbConnection;

  constructor(querySnowflake: QuerySnowflake) {
    this.#querySnowflake = querySnowflake;
  }

  async execute(
    request: CreateCitoSnowflakeEnvRequestDto,
    auth: CreateCitoSnowflakeEnvAuthDto,
    dbConnection: DbConnection
  ): Promise<CreateCitoSnowflakeEnvResponseDto> {
    try {
      this.#dbConnection = dbConnection;

      const createSchemaResult = await await this.#querySnowflake.execute(
        {
          query: getCreateDbSchemaQuery(),
        },
        {
          callerOrganizationId: auth.callerOrganizationId,
          isSystemInternal: auth.isSystemInternal,
        },
        this.#dbConnection
      );

      if (!createSchemaResult.success)
        throw new Error(createSchemaResult.error);

      const createTableResults = await Promise.all(
        citoMaterializationTypes.map(async (type) => {
          const query = getCreateTableQuery(type);
          const createTableResult = await this.#querySnowflake.execute(
            {
              query,
            },
            {
              callerOrganizationId: auth.callerOrganizationId,
              isSystemInternal: auth.isSystemInternal,
            },
            this.#dbConnection
          );

          return createTableResult;
        })
      );

      if (createTableResults.some((el: any) => !el.success))
        throw new Error(createTableResults[0].error);

      // if (snowflakeCreate.organizationId !== auth.organizationId)
      //   throw new Error('Not authorized to perform action');

      return Result.ok({
        organizationId: auth.callerOrganizationId,
        success: true,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message) console.trace(error.message);
      else if (!(error instanceof Error) && error) console.trace(error);
      return Result.fail('');
    }
  }
}
