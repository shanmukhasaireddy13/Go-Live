const BaseRepository = require("./BaseRepository");
const AuditLog = require("../models/AuditLog");

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  /**
   * Record structured audit log entry
   */
  async record({
    action,
    actor = "SYSTEM",
    entityType = "SYSTEM",
    entityId = "",
    status = "SUCCESS",
    details = {},
    ipAddress = "",
    userAgent = "",
  }) {
    return this.model.record({
      action,
      actor,
      entityType,
      entityId,
      status,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Find recent audit logs by entity
   */
  async findRecentByEntity(entityType, entityId, limit = 20) {
    return this.model.findRecentByEntity(entityType, entityId, limit);
  }

  /**
   * Find recent audit logs by actor
   */
  async findRecentByActor(actor, limit = 20) {
    return this.model.findRecentByActor(actor, limit);
  }
}

module.exports = new AuditLogRepository();
