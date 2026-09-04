const BaseRepository = require("./BaseRepository");
const User = require("../models/User");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by case-insensitive GitHub username
   */
  async findByUsername(username) {
    if (!username) return null;
    return this.model.findByUsername(username);
  }

  /**
   * Find user by GitHub numerical ID
   */
  async findByGithubId(githubId) {
    if (!githubId) return null;
    return this.model.findOne({ githubId: githubId.toString() });
  }

  /**
   * Upsert user from GitHub OAuth profile
   */
  async upsertFromGithub(ghUser, hasStarred = false) {
    return this.model.upsertFromGithub(ghUser, hasStarred);
  }

  /**
   * Update star status for user
   */
  async setStarred(username, hasStarred) {
    const user = await this.findByUsername(username);
    if (!user) return null;
    return user.setStarred(hasStarred);
  }
}

module.exports = new UserRepository();
