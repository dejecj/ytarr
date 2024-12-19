migrate((app) => {
  try {
    app.findAuthRecordByEmail("_superusers", "admin@ytarr.local");
    return;
  } catch (err) {
    //silent continue (superuser not created yet)
  }
  let superusers = app.findCollectionByNameOrId("_superusers");

  let record = new Record(superusers)

  // note: the values can be eventually loaded via $os.getenv(key)
  // or from a special local config file
  record.set("email", "admin@ytarr.local")
  record.set("password", "admin_ytarr")

  app.save(record)
}, (app) => { // optional revert operation
  try {
    let record = app.findAuthRecordByEmail("_superusers", "admin@ytarr.local")
    app.delete(record)
  } catch {
    // silent errors (probably already deleted)
  }
})