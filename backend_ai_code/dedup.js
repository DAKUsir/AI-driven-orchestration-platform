require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Competition = require('./src/models/Competition');
  const SheetLink = require('./src/models/SheetLink');

  // Remove competition duplicates — keep the oldest _id per (platform, title)
  const comps = await Competition.aggregate([
    { $group: { _id: { platform: '$platform', title: '$title' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  let compDel = 0;
  for (const g of comps) {
    const toDelete = g.ids.slice(1);
    await Competition.deleteMany({ _id: { $in: toDelete } });
    compDel += toDelete.length;
  }
  console.log('Deleted', compDel, 'duplicate competitions');

  // Remove sheet duplicates — keep oldest per title
  const sheets = await SheetLink.aggregate([
    { $group: { _id: '$title', ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  let sheetDel = 0;
  for (const g of sheets) {
    const toDelete = g.ids.slice(1);
    await SheetLink.deleteMany({ _id: { $in: toDelete } });
    sheetDel += toDelete.length;
  }
  console.log('Deleted', sheetDel, 'duplicate sheets');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
