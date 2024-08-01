const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
require('dotenv').config();

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const emailCampaignsApi = new SibApiV3Sdk.EmailCampaignsApi();

module.exports = {
    emailCampaignsApi,
    SibApiV3Sdk
};