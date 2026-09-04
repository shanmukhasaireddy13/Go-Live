/**
 * BaseRepository - Abstract Repository pattern encapsulation for database operations
 */
class BaseRepository {
  /**
   * @param {import('mongoose').Model} model
   */
  constructor(model) {
    if (!model) {
      throw new Error("Repository must be instantiated with a Mongoose Model");
    }
    this.model = model;
  }

  async findById(id, projection = null, options = {}) {
    return this.model.findById(id, projection, options);
  }

  async findOne(filter = {}, projection = null, options = {}) {
    return this.model.findOne(filter, projection, options);
  }

  async find(filter = {}, projection = null, options = {}) {
    return this.model.find(filter, projection, options);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateOne(filter, update, options = { new: true }) {
    return this.model.findOneAndUpdate(filter, update, options);
  }

  async updateMany(filter, update, options = {}) {
    return this.model.updateMany(filter, update, options);
  }

  async deleteOne(filter) {
    return this.model.deleteOne(filter);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;
