const http = require('http');
const AWS = require('aws-sdk');
const config = require('./config.json');

if (config.profile) {
  var credentials = new AWS.SharedIniFileCredentials({ profile: config.profile });
  AWS.config.credentials = credentials;
}

const route53 = new AWS.Route53();

function getCurrentIp() {
  return new Promise(resolve => {
    const req = http.request(
      { 
        hostname: 'checkip.amazonaws.com',
        method: 'GET'
      }, 
      res => {
        res.on('data', ip => {
          resolve(ip.toString().trim())
        })
      })
    
    req.end();
  });
}

async function getDnsIP() {
  const record = await route53.listResourceRecordSets({
    HostedZoneId: config.hostedZoneId,
    MaxItems: '1',
    StartRecordName: config.domain,
    StartRecordType: 'A'
  }).promise();

  return record.ResourceRecordSets[0].ResourceRecords[0].Value;
}

async function updateDnsIP(newIP) {
  const result = await route53.changeResourceRecordSets({
    HostedZoneId: config.hostedZoneId,
    ChangeBatch: {
      Comment:"Updated from update-ip.js script",
      Changes:[{
        Action: "UPSERT",
        ResourceRecordSet: {
          ResourceRecords: [{
            Value: newIP
          }],
          Name: config.domain,
          Type: "A",
          TTL: 3600
        }
      }]
    }
  }).promise();
  console.log(result);
}

async function main() {
  const currentIp = await getCurrentIp();
  console.log('Current IP: ', currentIp);

  const dnsIp = await getDnsIP();
  console.log('DNS IP: ', dnsIp);

  if (currentIp !== dnsIp) {
    console.log('Updating DNS IP to ' + currentIp);
    updateDnsIP(currentIp);
  }
}

main();