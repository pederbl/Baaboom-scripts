// run `node index.js` in the terminal
import 'dotenv/config';
import got from "got";

console.log(process.env);

const PERSONS_TABLE_ID = "tblQbFE3X5joGozyp";

const PROJECTS = {
  "Baaboom: Leads Processing Survey": {
    "tabelId": "tblC1qVTgeo9uELs3", 
    "addToProjectViewId": "viwfS35j3X4lRc1lG"
  }
}

function airtableEndpoint(table, view) {
  const baseUrl = "https://api.airtable.com/v0/apptlz2qif1C2K11c/";
  const path = [table, view].filter(Boolean).join("/");

  return BASE_URL + path;
}

async function main() {
  const project = "Baaboom: Leads Processing Survey"

  while (true) {
    const records = await getNextPersonToAddToProject(project);

    if (records.length === 0) {
      console.log("Done");
      break;
    }

    for (const record of records) {
      await addPersonToProject(project, record);      
    }
  }
}

async function getNextPersonToAddToProject(project) {
  
  const headers = {
    "Authorization": "Bearer " + process.env['AIRTABLE_SECRET']
  };
  
  const params = {
    view: "Set person"
  };
  
  const options = {
    searchParams: params,
    responseType: "json",
    headers: headers
  };
  
  const response = await got(BAD_EMAIL_ADDRESSES_ENDPOINT, options);
  const records = response.body.records;

  return records;
}

async function setPersonOnBadEmailAddressRecord(record) {
  const email = record.fields.Email.trim();
  console.log(email);
  const personId = await getPersonIdFromEmail(email);
  const fields = {
      Person: [personId]    
  }
  patchBadEmailAddressRecord(record, fields);  
}

async function getPersonIdFromEmail(email) {

  const headers = {
    "Authorization": "Bearer " + process.env['airtable']
  };

  const params = {
        filterByFormula: `{Email} = '${email}'`
  };
  

  const options = {
    searchParams: params,
    responseType: "json",
    headers: headers
  };

  const response = await got(PERSONS_ENDPOINT, options);

  const personRecords = response.body.records;
  if (personRecords.length > 1) throw new Error("More than one records with matching email adress");

  const personRecord = personRecords[0];
  if (!personRecord) {
    throw new Error("No person with that email");
  }

  return personRecord.id
}

async function patchBadEmailAddressRecord(record, fields) {

  const headers = {
    "Authorization": "Bearer " + process.env['airtable'], 
    "Content-Type": "application/json"
  };

  const data = {
    records: [{
      id: record.id, 
      fields: fields
    }] 
  }

  const options = {
    body: JSON.stringify(data),
    responseType: "json",
    headers: headers
  };
  
  const response = await got.patch(BAD_EMAIL_ADDRESSES_ENDPOINT, options).catch(err => {
    console.log(err.response.body);
    throw err;
  });

  if (response.statusCode !== 200) throw new Error("Not success");
}

(async () => {
    try {
        await main();
    } catch (e) {
        console.log(e)
    }
})();
