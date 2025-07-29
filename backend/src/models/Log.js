import { DataTypes, Op, Sequelize } from 'sequelize';
import sequelize from '../config/db.js';

const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']],
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  meta: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'logs',
  timestamps: true,
  paranoid: false,
  underscored: true,
  indexes: [
    {
      name: 'logs_level_idx',
      fields: ['level'],
    },
    {
      name: 'logs_timestamp_idx',
      fields: ['timestamp'],
    },
    {
      name: 'logs_meta_request_id_idx',
      fields: [
        sequelize.literal(`(jsonb_extract_path_text("meta", 'requestId'))`)
      ],
      where: sequelize.literal(`jsonb_extract_path_text("meta", 'requestId') IS NOT NULL`),
    },
  ],
});

// Class methods
Object.assign(Log, {
  /**
   * Get logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<{count: number, rows: Array<Log>}>} Paginated logs
   */
  async getPaginatedLogs(options = {}) {
    const {
      page = 1,
      limit = 50,
      level,
      search,
      startDate,
      endDate,
      orderBy = 'timestamp',
      order = 'DESC',
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    if (level) {
      where.level = level;
    }

    if (search) {
      where[Op.or] = [
        { message: { [Op.iLike]: `%${search}%` } },
        { '$meta.ip$': { [Op.iLike]: `%${search}%` } },
        { '$meta.userAgent$': { [Op.iLike]: `%${search}%` } },
        { '$meta.requestId$': search },
      ];
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    return Log.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit, 10), 100), // Max 100 logs per page
      offset: parseInt(offset, 10),
      order: [[orderBy, order.toUpperCase()]],
      raw: true,
    });
  },

  /**
   * Clean up logs older than the specified number of days
   * @param {number} days - Number of days to keep logs
   * @returns {Promise<number>} Number of deleted logs
   */
  async cleanupOldLogs(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Log.destroy({
      where: {
        timestamp: {
          [Op.lt]: cutoffDate,
        },
      },
    });

    return result;
  },
});

export default Log;
