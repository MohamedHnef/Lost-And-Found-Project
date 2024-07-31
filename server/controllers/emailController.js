// controllers/emailController.js

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const pool = require('../db');
const logger = require('../logger');
require('dotenv').config();

const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const emailCampaignsApi = new SibApiV3Sdk.EmailCampaignsApi();

const sendItemFoundEmail = (req, res) => {
    const { itemId } = req.body;

    logger.info(`Received request to send notification email for item found with ID: ${itemId}`); // Updated logging

    if (!itemId) {
        logger.error('Item ID is missing in the request body.');
        return res.status(400).json({ error: 'Item ID is required' });
    }

    const query = `
        SELECT l.contactEmail AS lostContactEmail, l.itemName, uLost.username AS lostUsername
        FROM tbl_123_founditems AS f
        JOIN tbl_123_lostitems AS l ON f.itemName = l.itemName
        JOIN tbl_123_users AS uLost ON l.userId = uLost.id
        WHERE f.id = ?
    `;

    pool.query(query, [itemId], (err, results) => {
        if (err) {
            logger.error('Error querying database:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            logger.warn('No matching item found in the database for the provided item ID:', itemId);
            return res.status(404).send('No matching item found');
        }

        const { lostContactEmail, lostUsername, itemName } = results[0];
        logger.info(`Sending email to: ${lostContactEmail} for item: ${itemName}`);

        const emailCampaign = new SibApiV3Sdk.CreateEmailCampaign();
        emailCampaign.name = "Item Found Notification";
        emailCampaign.subject = "Good News! Your Lost Item Has Been Found";
        emailCampaign.sender = { name: "Lost and Found Team", email: "amir.kh1232001@gmail.com" }; // Use your verified sender email
        emailCampaign.type = "classic";
        emailCampaign.htmlContent = `
            Dear ${lostUsername},<br><br>
            We are thrilled to inform you that your lost item, ${itemName}, has been found! Our team has successfully located your item and it is now available for you to claim.<br><br>
            Please log in to your account to view the details and arrange for the pickup or delivery of your item.<br><br>
            Thank you for using our Lost and Found service. We are here to help you recover your belongings.<br><br>
            Best regards,<br>
            The Lost and Found Team
        `;

        emailCampaign.recipients = { listIds: [2] }; // Ensure this is set to the correct list ID for the recipients

        emailCampaignsApi.createEmailCampaign(emailCampaign).then(function(data) {
            logger.info('API called successfully. Returned data: ' + JSON.stringify(data));

            emailCampaignsApi.sendEmailCampaignNow(data.id).then(function(sendData) {
                logger.info('Email sent successfully. Returned data: ' + JSON.stringify(sendData));
                res.status(200).send('Notification email sent');
            }, function(sendError) {
                logger.error('Error sending email campaign:', sendError);
                res.status(500).send('Error sending email campaign');
            });
        }, function(error) {
            logger.error('Error creating email campaign:', error);
            res.status(500).send('Error creating email campaign: ' + JSON.stringify(error));
        });
    });
};

module.exports = {
    sendItemFoundEmail,
};
