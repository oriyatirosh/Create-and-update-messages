const axios = require('axios');
const logger = require('./logger');
var fs = require('fs').promises;
var fs1 = require('fs');
var path = require('path');
var parse = require('csv-parse/lib/sync');
var stringify = require('csv-stringify');
const data_function = require('./data_function');
require('dotenv').config()
const url_sever = process.env.URL_SERVER;
const messages_list = process.env.MESSAGES_LIST;


let start = async () => {
    try {
        //Check if the file exists
        if (!fs1.existsSync(messages_list))throw new Error('The file does not exist');

        const fileContent = await fs.readFile(messages_list);// Csv file reading
        const arr_title = ['message', 'to_name', 'from_name', 'key'];
        const csv_change = parse(fileContent, {});

        const title_csv = csv_change[0].map(i => i.toLowerCase());

        //Checking the correctness of the title
        if (!(title_csv.length == arr_title.length && title_csv.every((v) => arr_title.indexOf(v) >= 0))) {
            throw new Error('Title fields are incorrect');
        }

        for (let i in csv_change) {
            try {
                if (csv_change[i] != '') {
                    if (csv_change[i][3]) {   //if there is key = update the message!

                        //Checking the correctness of the key
                        if (csv_change[i][3].match(/^[0-9a-z]+$/) && csv_change[i][3].length == 4) {
                            try {
                                let response = await axios.get(url_sever + '/' + `${csv_change[i][3]}`)  //GET call -select message by key

                                if (response.data.payload != "") {
                                    logger.info('The message was found');
                                    await data_function.update_message(csv_change[i][0], csv_change[i][3]);  //Update message func
                                } else {
                                    logger.error('The message was not found');
                                }
                            } catch (error) {
                                logger.error(error.message);
                            }
                        } else {
                            logger.error('The key is incorrect');
                        }

                    } else {   //Otherwise create the message!
                        var return_key = await data_function.insert_message(csv_change[i][1], csv_change[i][2], csv_change[i][0]);
                        if (return_key != null) {
                            csv_change[i][3] = return_key;  //Update the returned key
                        }
                    }
                }
            } catch (error) {
                logger.error(error.message);
            }
        }

        logger.info('CSV file successfully processed');
        console.log('CSV file successfully processed');

        stringify(csv_change, {  //Update the csv file
            //header: true
        }, function (err, output) {
            fs.writeFile(messages_list, output);
        })

    } catch (error) {
        logger.error(error.message);
    }
};

start();

