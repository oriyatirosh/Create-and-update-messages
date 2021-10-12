const axios = require('axios');
const logger = require('./logger');
const fs = require('fs');
require('dotenv').config()
const url_sever = process.env.URL_SERVER;


async function insert_message(from_name, to_name, message) {
    try {
        let response = await axios.post(url_sever, {        //POST call -create message
            FROM_NAME: from_name,
            TO_NAME: to_name,
            MESSAGE: message
        });

        if (response.data.key) {
            logger.info("Create message: "+response.data.key);
            return response.data.key;
        } else {
            if (response.data.status == 'fail') logger.error(response.data.message);
        }

    } catch (error) {
        logger.error(error.message);
    }
};


async function update_message(message, key) {
    try {
        let response = await axios.put(url_sever, {        //UPDATE call -update message by key
            KEY: key,
            MESSAGE: message
        });  
        if (response.data.status == 'ok') {
            logger.info('Message updated');
        } else {
            if (response.data.status == 'fail') logger.error(response.data.message);
        }
    } catch (error) {
        logger.error(error.message);
    }
};

module.exports.insert_message = insert_message;
module.exports.update_message = update_message;