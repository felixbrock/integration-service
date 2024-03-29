import { GithubProfile } from '../entities/github-profile';

export interface GithubProfileDto {
  id: string;
  installationId: string;
  organizationId: string;
  repositoryNames: string[];
}

export const buildGithubProfileDto = (
  githubProfile: GithubProfile
): GithubProfileDto => ({
  id: githubProfile.id,
  installationId: githubProfile.installationId,
  organizationId: githubProfile.organizationId,
  repositoryNames: githubProfile.repositoryNames,
});
