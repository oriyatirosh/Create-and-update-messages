const axios = require('axios');
const logger = require('./logger');
const fs = require('fs');
const data_function = require('./data_function');
const write_csv = require('./write_csv');
require('dotenv').config()
const url_sever = process.env.URL_SERVER;
const messages_list = process.env.MESSAGES_LIST;

let start = async () => {
    try {
        if (!fs.existsSync(messages_list))throw new Error('The file does not exist');

        var data = fs.readFileSync(messages_list, "utf8").split("\r\n");// Csv file reading
        var arr_title = [ 'message', 'to_name', 'from_name', 'key' ];
        var csv_change = [];
        csv_change = data;

        for (let i in csv_change) { // Placing file values in an array of arrays
            csv_change[i] = csv_change[i].split(",");
        }

        if (JSON.stringify(csv_change[0])!=JSON.stringify(arr_title)) {    //Checking the correctness of the title
            throw new Error('Title fields are incorrect');  
        }

        for (let i in csv_change) { 
            try {
                if (csv_change[i] != '') {

                    if (csv_change[i].length == 4) {   //if there is key = update the message!

                        //Checking the correctness of the key
                        if (csv_change[i][3].match(/^[0-9a-z]+$/) && csv_change[i][3].length == 4) {
                            try {
                                let response = await axios.get(url_sever + '/' + `${csv_change[i][3]}`)  //GET call -select message by key
    
                                if (response.data.payload != "") {
                                    logger.info('The message was found');
                                    await data_function.update_message(csv_change[i][0],csv_change[i][3]);  //Update message func
                                }
                            } catch (error) {
                                logger.error(error.message);
                            }
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

        write_csv.write_to_csv(csv_change);  //Update the csv file

    } catch (error) {
        logger.error(error.message);
    }
};

start();

