const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const rateLimitSeconds = parseInt(process.env.RATE_LIMIT_SECONDS || 3600, 10);

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

    // Use conditional write with ETag to prevent race conditions
    await s3.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      IfMatch: object.ETag
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
    } else if (error.code === 'PreconditionFailed') {
      // ETag mismatch — file changed since read. Log and retry once
      console.warn(`Rate limit update conflict for IP ${ip}, retrying...`);
      return updateRateLimit(ip, email, bucket);
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
