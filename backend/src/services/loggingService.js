import { Log } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

/**
 * Create a new request log entry
 * @param {Object} logData - Log data to be saved
 * @returns {Promise<Object>} Created log entry
 */
const createRequestLog = async (logData) => {
  try {
    const {
      method,
      url,
      status,
      responseTime,
      user,
      ip,
      userAgent,
      referrer,
      requestId,
      body,
      query,
      params,
      headers,
    } = logData;

    const logEntry = await Log.create({
      level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
      message: `${method} ${url} - ${status} (${responseTime}ms)`,
      meta: {
        method,
        url,
        status,
        responseTime,
        user,
        ip,
        userAgent,
        referrer,
        requestId,
        body,
        query,
        params,
        headers,
      },
      timestamp: new Date(),
    });

    return logEntry;
  } catch (error) {
    logger.error('Failed to create request log:', error);
    throw error;
  }
};

/**
 * Get logs with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} [options.limit=50] - Number of logs to return
 * @param {number} [options.offset=0] - Number of logs to skip
 * @param {string} [options.level] - Filter by log level (error, warn, info, etc.)
 * @param {string} [options.search] - Search term to filter logs
 * @param {Date} [options.startDate] - Filter logs after this date
 * @param {Date} [options.endDate] - Filter logs before this date
 * @returns {Promise<Object>} Paginated logs and total count
 */
const getLogs = async ({
  limit = 50,
  offset = 0,
  level,
  search,
  startDate,
  endDate,
} = {}) => {
  try {
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
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    
    const { count, rows } = await Log.findAndCountAll({
      where,
      limit: Math.min(parseInt(limit, 10), 100), // Max 100 logs per page
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    
    return {
      total: count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      logs: rows,
    };
  } catch (error) {
    logger.error('Failed to fetch logs:', error);
    throw error;
  }
};

/**
 * Get a log entry by ID
 * @param {string} id - Log entry ID
 * @returns {Promise<Object>} Log entry
 */
const getLogById = async (id) => {
  try {
    const logEntry = await Log.findByPk(id);
    return logEntry;
  } catch (error) {
    logger.error(`Failed to fetch log with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete logs older than the specified number of days
 * @param {number} days - Number of days to keep logs
 * @returns {Promise<number>} Number of deleted logs
 */
const cleanupOldLogs = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await Log.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });
    
    logger.info(`Cleaned up ${result} log entries older than ${days} days`);
    return result;
  } catch (error) {
    logger.error('Failed to clean up old logs:', error);
    throw error;
  }
};

export {
  createRequestLog,
  getLogs,
  getLogById,
  cleanupOldLogs,
};

export default {
  createRequestLog,
  getLogs,
  getLogById,
  cleanupOldLogs,
};
