"use strict";

const request = require("supertest");
const sinon = require("sinon").createSandbox();
const expect = require("must-dist");

require("../../testutil/configureForTest");
const activitystore = require("../../lib/activities/activitystore");
const persistence = require("../../lib/activities/activitiesPersistence");
const Activity = require("../../lib/activities/activity");

const createApp = require("../../testutil/testHelper")("activities").createApp;

describe("Activity application with DB - shows activities -", () => {
  const tomorrow = new Date(Date.now() + 86400000); // + 1 day
  const dayAfterTomorrow = new Date(Date.now() + 86400000 + 86400000); // + 2 days
  const yesterday = new Date(Date.now() - 86400000); // - 1 day
  const dayBeforeYesterday = new Date(Date.now() - 86400000 - 86400000); // - 2 days

  const futureActivity = new Activity({
    id: "futureActivity",
    title: "Future Activity",
    description: "description1",
    assignedGroup: "groupname",
    location: "location1",
    direction: "direction1",
    startDate: tomorrow,
    endDate: dayAfterTomorrow,
    url: "url_future",
    owner: "owner",
    resources: { Veranstaltung: { _registeredMembers: [], _registrationOpen: true } },
    version: 1,
  });
  const currentActivity = new Activity({
    id: "currentActivity",
    title: "Current Activity",
    description: "description1",
    assignedGroup: "groupname",
    location: "location1",
    direction: "direction1",
    startDate: yesterday,
    endDate: tomorrow,
    url: "url_current",
    owner: "owner",
    resources: { Veranstaltung: { _registeredMembers: [], _registrationOpen: true } },
    version: 1,
  });
  const pastActivity = new Activity({
    id: "pastActivity",
    title: "Past Activity",
    description: "description1",
    assignedGroup: "groupname",
    location: "location1",
    direction: "direction1",
    startDate: dayBeforeYesterday,
    endDate: yesterday,
    url: "url_past",
    owner: "owner",
    resources: { Veranstaltung: { _registeredMembers: [], _registrationOpen: true } },
    version: 1,
  });

  beforeEach(() => {
    // if this fails, you need to start your mongo DB
    persistence.recreateForTest();
    activitystore.saveActivity(futureActivity);
    activitystore.saveActivity(currentActivity);
    activitystore.saveActivity(pastActivity);
  });

  afterEach(() => {
    sinon.restore();
  });

  it("shows only current and future activities as upcoming", (done) => {
    request(createApp())
      .get("/upcoming")
      .expect(200)
      .expect(/Current Activity/)
      .expect(/Future Activity/, (err, res) => {
        expect(res.text).to.not.contain("Past Activity");
        done(err);
      });
  });

  it("shows only current and past activities as past", (done) => {
    request(createApp())
      .get("/past")
      .expect(200)
      .expect(/Current Activity/)
      .expect(/Past Activity/, (err, res) => {
        expect(res.text).to.not.contain("Future Activity");
        done(err);
      });
  });
});
