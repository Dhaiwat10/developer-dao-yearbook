import { Web3Storage, File, getFilesFromPath } from 'web3.storage';
const { resolve } = require('path');
import formidable from 'formidable';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      console.log(fields);
    });
    return await storeEntry(req, res);
  } else {
    return res
      .status(405)
      .json({ message: 'Method not allowed', success: false });
  }
}

async function storeEntry(req, res) {
  const body = req.body;

  // const jsonObject = body.reduce((acc, [key, val]) => {
  //   acc[key] = val;
  //   return acc;
  // }, {});

  // try {
  //   const files = await makeFileObjects(body);
  //   const cid = await storeFiles(files);
  //   return res.status(200).json({ success: true, cid: cid });
  // } catch (err) {
  //   return res
  //     .status(500)
  //     .json({ error: 'Error creating entry', success: false });
  // }
}

async function storeFiles(files) {
  const client = makeStorageClient();
  const cid = await client.put(files);
  return cid;
}

async function makeFileObjects(body) {
  const buffer = Buffer.from(JSON.stringify(body));

  // const imageDirectory = resolve(process.cwd(), `public/images/${body.image}`);
  // const files = await getFilesFromPath(imageDirectory);
  const files = [body.image];

  files.push(new File([buffer], 'data.json'));
  console.log(files);
  return files;
}

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set desired value here
    },
  },
};
