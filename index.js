// run `node index.js` in the terminal
import 'dotenv/config';
import got from 'got';

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

    if (!personRecord) {
      console.log('Done');
      break;
    }

    await addPersonToProject(personRecord, project);
  }
}

async function getNextPersonToAddToProject(project) {
  const options = {
    headers: {
      Authorization: 'Bearer ' + process.env['AIRTABLE_SECRET'],
    },
    searchParams: {
      view: project.addToProjectViewId,
      maxRecords: '1',
    },
    responseType: 'json',
  };
  const endpoint = generateEndpoint(PERSONS_TABLE_ID);

  const response = await got(endpoint, options).catch((err) => {
    console.log(err.response.body);
    throw err;
  });
  const records = response.body.records;

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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    responseType: 'json',
  };

  const endpoint = generateEndpoint(project.tabelId);

  console.log(endpoint);

  const response = await got.post(endpoint, options).catch((err) => {
    console.log(err.response.body);
    throw err;
  });
  console.log(1);

  if (response.statusCode !== 200) throw new Error('Not success');

  console.log(response);
  throw new Error('Breakpoint!');
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.log(e);
  }
})();
