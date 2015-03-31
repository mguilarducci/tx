'use strict';

module.exports = {
  production: {
    port: process.env.PORT || 80,
    db: process.env.COMPOSE_MONGO_URL
  },

  development: {
    port: process.env.PORT || 3000,
    db: process.env.COMPOSE_MONGO_URL || 'mongodb://localhost/tx-development'
  },

  test: {
    port: process.env.PORT || 3000,
    db: process.env.COMPOSE_MONGO_URL || 'mongodb://localhost/tx-test'
  }
};
