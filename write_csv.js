const fs = require('fs');
const logger = require('./logger');
const messages_list = process.env.MESSAGES_LIST;

async function write_to_csv (csv_change){
    try {
        let csvContent = "";

        csv_change.forEach(function (rowArray) {   //Analysis of values
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });
    
        fs.writeFileSync(messages_list, csvContent, function (err) {   //Writing the csv file
            if (err) return logger.error(error.message);
        });
    } catch (error) {
        logger.error(error.message);
    }

};

module.exports.write_to_csv = write_to_csv;

