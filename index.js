// run `node index.js` in the terminal
import 'dotenv/config';
import got from 'got';
import axios from 'axios';

const PERSONS_TABLE_ID = 'tblQbFE3X5joGozyp';

const PROJECTS = {
  'Baaboom: Leads Processing Survey': {
    tabelId: 'tblC1qVTgeo9uELs3',
    addToProjectViewId: 'viwfS35j3X4lRc1lG',
  },
};

function generateEndpoint(table, view) {
  const baseUrl = 'https://api.airtable.com/v0/apptlz2qif1C2K11c/';
  const path = [table, view].filter(Boolean).join('/');

  return baseUrl + path;
}

async function main() {
  const project = PROJECTS['Baaboom: Leads Processing Survey'];

  while (true) {
    const personRecord = await getNextPersonToAddToProject(project);
    console.log(`Record id: ${personRecord?.id}`);

    if (!personRecord) {
      break;
    }

    await addPersonToProject(personRecord, project);
  }
  throw new Error('DONE');
}

async function getNextPersonToAddToProject(project) {
  const options = {
    headers: {
      Authorization: 'Bearer ' + process.env['AIRTABLE_SECRET'],
    },
    params: {
      view: project.addToProjectViewId,
      maxRecords: '1',
    },
  };
  const endpoint = generateEndpoint(PERSONS_TABLE_ID);

  const response = await axios.get(endpoint, options);

  if (response.status !== 200) {
    console.log(response);
    throw new Error('Not success');
  }

  const records = response.data.records;

  if (records.length === 0) {
    console.log(response);
  }

  return records[0];
}

async function addPersonToProject(personRecord, project) {
  const data = {
    records: [
      {
        fields: {
          Person: [personRecord.id],
        },
      },
    ],
  };

  const options = {
    headers: {
      Authorization: 'Bearer ' + process.env['AIRTABLE_SECRET'],
    },
    responseType: 'json',
  };

  const endpoint = generateEndpoint(project.tabelId);

  console.log(data);

  const response = await axios.post(endpoint, data, options);

  if (response.status !== 200) throw new Error('Not success');
  console.log('Added');
}

(async () => {
  await main();
})();
