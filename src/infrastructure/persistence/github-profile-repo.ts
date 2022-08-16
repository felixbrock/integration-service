// use MongoDB: https://www.mongodb.com/docs/manual/core/csfle/

import {
    Db,
    Document,
    InsertOneResult,
    ObjectId,
  } from 'mongodb';
  import sanitize from 'mongo-sanitize';
  
  import { IGithubProfileRepo } from '../../domain/github-profile/i-github-profile-repo';
  import {
    GithubProfile,
    GithubProfileProperties,
  } from '../../domain/entities/github-profile';
  
  interface GithubProfilePersistence {
    _id: ObjectId;
    installationId: string;
    organizationId: string;
  }
  
  
  const collectionName = 'githubProfile';
  
  export default class GithubProfileRepo implements IGithubProfileRepo {
    findOne = async (
      installationId: string,
      dbConnection: Db,
    ): Promise<GithubProfile | null> => {
      try {
        const result: any = await dbConnection
          .collection(collectionName)
          .findOne({ organizationId: sanitize(installationId) });
  
        if (!result) return null;
  
        return this.#toEntity(await this.#buildProperties(result));
      } catch (error: unknown) {
        if (typeof error === 'string') return Promise.reject(error);
        if (error instanceof Error) return Promise.reject(error.message);
        return Promise.reject(new Error('Unknown error occured'));
      }
    };
  
    insertOne = async (
      githubProfile: GithubProfile,
      dbConnection: Db,
    ): Promise<string> => {
      try {
        const result: InsertOneResult<Document> = await dbConnection
          .collection(collectionName)
          .insertOne(
            await this.#toPersistence(sanitize(githubProfile))
          );
  
        if (!result.acknowledged)
          throw new Error(
            'GithubProfile creation failed. Insert not acknowledged'
          );
  
        return result.insertedId.toHexString();
      } catch (error: unknown) {
        if (typeof error === 'string') return Promise.reject(error);
        if (error instanceof Error) return Promise.reject(error.message);
        return Promise.reject(new Error('Unknown error occured'));
      }
    };
  
    
    #toEntity = (properties: GithubProfileProperties): GithubProfile =>
      GithubProfile.create(properties);
  
    #buildProperties = async (
      githubProfile: GithubProfilePersistence,
    ): Promise<GithubProfileProperties> => ({
       
      
        // eslint-disable-next-line no-underscore-dangle
        id: githubProfile._id.toHexString(),
        installationId: githubProfile.installationId,
        organizationId: githubProfile.organizationId,
      
    });
  
    #toPersistence = async (
      githubProfile: GithubProfile,
    ): Promise<Document> => {
      
      const persistenceObject: GithubProfilePersistence = {
        _id: ObjectId.createFromHexString(githubProfile.id),
        installationId: githubProfile.installationId,
        organizationId: githubProfile.organizationId,
      };
  
      return persistenceObject;
    };
  }
  