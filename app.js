const axios = require('axios');
const logger = require('./logger');
const csv = require('csv-parser');
const fs = require('fs');
const rl = require("readline");
require('dotenv').config()
const url_sever = process.env.URL_SERVER;
const messages_list = process.env.MESSAGES_LIST;

let start = async () => {
    try {

        var data = fs.readFileSync(messages_list, "utf8").split("\r\n");
        var arr_title = ['message','to_name','from_name','key'];
        var csv_change = [];
        csv_change = data;

        for (let i in csv_change) { // SPLIT ROWS
            csv_change[i] = csv_change[i].split(",");
/*             for (let j in csv_change[i]) { // SPLIT COLUMNS
                csv_change[i][j] = csv_change[i][j].split(",");
            } */
        }
        //console.log(csv_change);

        for (let i in csv_change) { 
            try {
                if (csv_change[i] == arr_title || csv_change[i] == '') {
                } else {
                    if (csv_change[i].length == 4) {   //if there is key = update the message!
                        try {
                            let response = await axios.get(url_sever + '/' + `${csv_change[i][3]}`)  //GET call -select message by key
                            //.then(function (response) {
                            //})
                            if (response.data.payload != "") {
                                logger.info('The message was found');
                                update_message(csv_change[i][0],csv_change[i][3]);
                            }
                        } catch (error) {
                            logger.error(error.message);
                        }
                    } else {   //Otherwise create the message!
                        var return_key = await insert_message(csv_change[i][1], csv_change[i][2], csv_change[i][0]);
                        if (return_key != "") {
                            csv_change[i][3] = return_key;
                        }
                    }
                }
            } catch (error) {
                logger.error(error.message);
            }
        }

        logger.info('CSV file successfully processed');
        console.log('CSV file successfully processed');

        //console.log(csv_change);
         fs.writeFileSync(messages_list, '', function (err) {
            if (err) return console.log(err);
        });
        for (let i in csv_change) {
            fs.appendFileSync(messages_list, `${csv_change[i]}\r\n`, function (err) {
                if (err) return console.log(err);
            });
        } 
        //console.log(csv_change);

    } catch (error) {
        logger.error(error.message);
    }
};

start();

let insert_message = async (from_name, to_name, message) => {
    try {
        //console.log(from_name, to_name, message);
        let response = await axios.post(url_sever, {        //POST call -create message
            FROM_NAME: from_name,
            TO_NAME: to_name,
            MESSAGE: message
        });
        if (response.data.key) {
            logger.info(response.data.message);
            //console.log(response.data.key);
            return response.data.key;
        } else {
            if (response.data.status == 'fail') logger.error(response.data.message);
        }

    } catch (error) {
        logger.error(error.message);
    }
};


let update_message = async (message,key) => {
    try {
        let response = await axios.get(url_sever + '/update/' + `${key}`+'/'+`${message}`);  //UPDATE call -update message by key
        if (response.data.status == 'ok') {
            logger.info('Message updated');
        } else {
            if (response.data.status == 'fail') logger.error(response.data.message);
        }
    } catch (error) {
        logger.error(error.message);
    }
};