require('dotenv').config();
const express = require("express")
const fs = require("fs")
const {google} = require("googleapis")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}))

app.listen(1000, () => console.log("port 1000"))

app.use(cors({
    origin: '*'
}));

const jsonFilePath = './credentials.json'
let credentials = JSON.parse(fs.readFileSync(jsonFilePath))

// Add dotenv variables to the credentials object
credentials.type = "service_account"
credentials.project_id = process.env.PROJECT_ID
credentials.private_key_id = process.env.PRIVATE_KEY_ID
// Properly parse private key to handle newline characters
credentials.private_key = process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
credentials.client_email = process.env.CLIENT_EMAIL
credentials.client_id = process.env.CLIENT_ID
credentials.auth_uri = "https://accounts.google.com/o/oauth2/auth"
credentials.token_uri = "https://oauth2.googleapis.com/token"
credentials.auth_provider_x509_cert_url = "https://www.googleapis.com/oauth2/v1/certs"
credentials.client_x509_cert_url = "https://www.googleapis.com/robot/v1/metadata/x509/acceptation%40acceptation-404617.iam.gserviceaccount.com"
credentials.universe_domain = "googleapis.com"

// Write back to JSON file
try {
  fs.writeFileSync(jsonFilePath, JSON.stringify(credentials, null, 5));
  console.log('Credentials file updated.')
} catch (error) {
  console.log("this is the error : ", error);
}

app.post("/", async(req, res) => {
    try{
        const auth = new google.auth.GoogleAuth({
            keyFile: "credentials.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets"
        })
        const client = await auth.getClient()
        const googleSheets = google.sheets({ version: 'v4', auth : client})
        const spreadsheetID = ""  // here you should add the id of your spreadsheet, it is the part of the spreadsheet's link between /d/ and /
        // note that you should share your spreadsheet with the client email : "acceptation@acceptation-404617.iam.gserviceaccount.com" as an editor

        // get data from the spreadsheet
        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetID,
            range: `liste!A:E` // Accessing the range from cell A to cell E in the tab 'liste'
            //so in your case you should replace this with the actual range that you need in your row, the general syntax is "Tab name!Start of range:End of range"
        });
        const rows = response.data.values;
        // get the email's cell, in my spreadsheet, the email is in the third cell
        const rowIndex = rows.findIndex(row => row[2] === req.body.email) // the count starts from 0 that's why we use 2 for the third cell
        if (rowIndex !== -1) {
            rows[rowIndex][4] = "yes" 
            
            // Update spreadsheet with new data
            await googleSheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetID,
                range: `liste!A${rowIndex+1}:E${rowIndex+1}`, // the specific line that we have changed
                valueInputOption: "RAW",
                requestBody: {
                    values: [rows[rowIndex]]
                }
            })
            res.status(200).send("Line successfully updated")
        } else {
            res.status(404).send("There is no line with this email");
        }
    }catch(error) {
        res.status(500).send("catch an errror : " + error)
        console.log("catch an errror : " + error)
    }
})