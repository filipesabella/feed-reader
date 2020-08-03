import { DBSettings, Database } from '../lib/database';

const fileName = 'feed-reader';
export async function downloaData(database: Database, settings: DBSettings)
  : Promise<any> {
  const response =
    await fetch(`https://api.github.com/gists/${settings.gistId}`);

  if (response.status !== 200) {
    throw 'Could not download gist';
  } else {
    const json = await response.json();
    const dump = JSON.parse(json.files[fileName].content);
    database.import(dump);
  }
}

export async function uploadData(database: Database, settings: DBSettings)
  : Promise<void> {
  const dump = await database.dump();

  const resp = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `token ${settings.githubToken}`,
    },
    body: JSON.stringify({
      description: 'data for feed-reader',
      files: {
        [fileName]: {
          content: JSON.stringify(dump)
        }
      }
    }),
  });

  if (resp.status !== 200) {
    throw 'Could not upload data';
  }
}
