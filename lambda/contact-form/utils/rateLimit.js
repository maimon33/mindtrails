const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const rateLimitSeconds = 3600;

function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function checkRateLimit(ip, bucket) {
  const monthKey = getMonthKey();
  const s3Key = `ip-tracking/${monthKey}.json`;

  try {
    const object = await s3.getObject({
      Bucket: bucket,
      Key: s3Key
    }).promise();

    const data = JSON.parse(object.Body.toString());
    const ipRecord = data[ip];

    if (!ipRecord) {
      return { allowed: true };
    }

    const now = Date.now();
    const lastSubmissionTime = ipRecord.timestamp;
    const timeDifference = now - lastSubmissionTime;

    if (timeDifference < rateLimitSeconds * 1000) {
      const secondsUntilAllowed = Math.ceil((rateLimitSeconds * 1000 - timeDifference) / 1000);
      return {
        allowed: false,
        error: 'Rate limit exceeded',
        lastEmail: ipRecord.email,
        secondsUntilAllowed
      };
    }

    return { allowed: true };
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return { allowed: true };
    }
    throw error;
  }
}

async function updateRateLimit(ip, email, bucket) {
  const monthKey = getMonthKey();
  const s3Key = `ip-tracking/${monthKey}.json`;

  try {
    const object = await s3.getObject({
      Bucket: bucket,
      Key: s3Key
    }).promise();

    const data = JSON.parse(object.Body.toString());
    data[ip] = {
      email,
      timestamp: Date.now()
    };

    await s3.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: JSON.stringify(data),
      ContentType: 'application/json'
    }).promise();
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      const data = {
        [ip]: {
          email,
          timestamp: Date.now()
        }
      };

      await s3.putObject({
        Bucket: bucket,
        Key: s3Key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
      }).promise();
    } else {
      throw error;
    }
  }
}

module.exports = {
  checkRateLimit,
  updateRateLimit,
  rateLimitSeconds
};
