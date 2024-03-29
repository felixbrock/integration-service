export interface GithubProfileProperties {
  id: string;
  installationId: string;
  organizationId: string;
  repositoryNames: string[];
}

export class GithubProfile {

  #id: string;

  #installationId: string;

  #organizationId: string;

  #repositoryNames: string[];

  get id(): string{
    return this.#id;
  }

  get installationId(): string {
    return this.#installationId;
  }
  
  get organizationId(): string {
    return this.#organizationId;
  }

  get repositoryNames(): string[] {
    return this.#repositoryNames;
  }

  private constructor(properties: GithubProfileProperties) {
    this.#id = properties.id;
    this.#installationId = properties.installationId;
    this.#organizationId = properties.organizationId;
    this.#repositoryNames = properties.repositoryNames;
  }

  static create = (properties: GithubProfileProperties): GithubProfile => {
    if (!properties.id) throw new TypeError('GithubProfile must have Id');
    if (!properties.installationId) throw new TypeError('GithubProfile must have installationId');
    if (!properties.organizationId) throw new TypeError('GithubProfile must have organizationId');

    return new GithubProfile(properties);
  };
}
