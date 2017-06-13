'use strict';
const squel = require('squel');

module.exports = (sequelize, dialect) => {
  function query(text, values, transaction) {
    const options = {
      raw: true,
      replacements: values
    };

    transaction && Object.assign(options, {
      transaction: transaction
    });

    return sequelize.query(text, options).then(data => {
      if (/select /i.test(text)) {
        return data[0];
      }
      return data[1];
    });
  }

  function queryOne(text, values, t) {
    return query(text, values, t).then(rows => {
      return rows && rows[0];
    });
  }

  // squel init & add functions: query, queryOne
  const DIALECTS = {
    mysql: 'mysql',
    postgres: 'postgres',
    mssql: 'mssql'
  };

  const sql = squel.useFlavour(DIALECTS[dialect]);

  sql.registerValueHandler(Date, function(date) {
    return date;
  });

  sql.cls.QueryBuilder.prototype.query = function(t) {
    const param = this.toParam();
    return query(param.text, param.values, t);
  };

  sql.cls.QueryBuilder.prototype.queryOne = function(t) {
    const param = this.toParam();
    return queryOne(param.text, param.values, t);
  };

  return {
    sql: sql,
    query: query,
    queryOne: queryOne
  };
};
