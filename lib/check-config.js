'use strict';

function checkConfig(config, requiredVars) {
  let missingVars = requiredVars.filter(function (key) {
    return config[key] === undefined || config[key] === null;
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing configuration variables: ${missingVars.join(', ')}`);
  }
}

module.exports = checkConfig;
