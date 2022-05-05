# Notes

- "Show Variables" btn doesn't show which fields are required or not telling devs if a field will be undefined
- Prefer ES6 modules
- "Test your DataHook" -> why do I have to hand-jam in data instead of using realistic data?
  - Fields show indicate which fields are required (using an \*)
  - Why are "Test Result" fields editable??
- Create "FlatFile/utils" npm package for customers to use
- Can we enable Typescript? Expose types in a package? I don't know the structure of "record", recordBatch, session, logger, etc.
- Can we add a code format button?
- Way too much scrolling up and down when writing Hooks. Code window with is really small, maybe collapse left menu
- No warning when leaving un-saved changes
- Should have popup indicating code was copied to clipboard when user clicks copy code button
- Why does deploying a new version of my Hooks delete all my test data?
- Why do I have re-deploy just to test changes?
- How can prevent "bad states" from happening BEFORE the execute? Need more feeback on actual issue
- Deploying reloads the page and causes my position in my code to reset back to defaults
- This doesn't work... logger.info("firstName", firstName); --> has to be logger.info(firstName);
- What if we had a GitHub repo with examples? Easy to keep up to day and easy to show variations of a theme. e.g. 1 date vs multiple dates
- Is there a way to run these cloud functions locally? It would speed up dev time.

- A few times I was running code on test data with the logger but the logs never showed up and there was no error/status
  - no warning of missing dependency
