const AWS = require('aws-sdk');
const s3 = new AWS.S3();

function getMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

async function storeSubmission(submission, bucket) {
  const monthKey = getMonthKey();
  const s3Key = `submissions/${monthKey}.json`;

  const entry = {
    timestamp: Date.now(),
    name: submission.name,
    email: submission.email,
    message: submission.message,
    ip: submission.ip
  };

  try {
    const object = await s3.getObject({
      Bucket: bucket,
      Key: s3Key
    }).promise();

    const data = JSON.parse(object.Body.toString());
    data.push(entry);

    // Use conditional write with ETag to prevent concurrent write conflicts
    await s3.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      IfMatch: object.ETag
    }).promise();
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      const data = [entry];

      await s3.putObject({
        Bucket: bucket,
        Key: s3Key,
        Body: JSON.stringify(data),
        ContentType: 'application/json'
      }).promise();
    } else if (error.code === 'PreconditionFailed') {
      // ETag mismatch — file changed since read. Retry to get latest version
      console.warn(`Submission storage conflict for ${submission.email}, retrying...`);
      return storeSubmission(submission, bucket);
    } else {
      throw error;
    }
  }
}

module.exports = {
  storeSubmission
};
