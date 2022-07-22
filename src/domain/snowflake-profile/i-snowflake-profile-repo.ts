import { SnowflakeProfile } from '../entities/snowflake-profile';
import { DbConnection } from '../services/i-db';

export interface SnowflakeProfileUpdateDto {
  accountId?: string;
  username?: string;
  password?: string;
}


export interface ISnowflakeProfileRepo {
  findOne(organizationId: string, dbConnection: DbConnection): Promise<SnowflakeProfile | null>;
  insertOne(snowflakeProfile: SnowflakeProfile, dbConnection: DbConnection): Promise<string>;
  updateOne(
    id: string,
    updateDto: SnowflakeProfileUpdateDto,
    dbConnection: DbConnection
  ): Promise<string>;
  deleteOne(id: string, dbConnection: DbConnection): Promise<string>;
}
