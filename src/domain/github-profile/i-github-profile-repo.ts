import { GithubProfile } from '../entities/github-profile';
import { DbConnection } from '../services/i-db';

export interface GithubProfileUpdateDto {
  repositoryNames?: string[];
  installationId?: string;
}
export interface IGithubProfileRepo {
  findOne(
    dbConnection: DbConnection,
    installationId?: string,
    organizationId?: string
  ): Promise<GithubProfile | null>;

  insertOne(
    githubProfile: GithubProfile,
    dbConnection: DbConnection
  ): Promise<string>;

  updateOne(
    id: string,
    updateDto: GithubProfileUpdateDto,
    dbConnection: DbConnection
  ): Promise<string>;

  deleteOne(id: string, dbConnection: DbConnection): Promise<string>;
}
