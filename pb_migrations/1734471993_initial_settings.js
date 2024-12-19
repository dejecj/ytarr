migrate((app) => {
  let settings = app.settings()

  // for all available settings fields you could check
  // /jsvm/interfaces/core.Settings.html
  settings.batch.enabled = true;
  settings.batch.maxRequests = 10000;
  settings.batch.timeout = 10;

  app.save(settings)
})