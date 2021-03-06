import {expect} from "chai";
import * as sinon from "sinon";
import {Builder} from "../../../lib/api/publisher";
const channelManager = require("../../../lib/channelManager").default;

const TOPIC = "test:topic";
const TTL = 10000;
const PAYLOAD = {message: "test"};

describe("api.Publisher", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should publish message with defaults only if configuration is not provided", () => {

    // arrange and assert
    sandbox.stub(channelManager, "findOrCreateProducer", (topic, brokerConfig) => {
      // assert channelManager properties
      expect(topic).to.equal(TOPIC);
      expect(brokerConfig).to.eql({type: "fanout"});

      return {
        publish: (message) => {
          // assert message meta
          expect(message.meta.ttl).to.be.null;

          // assert message topic, tags, payload
          expect(message.topics.to).to.equal(TOPIC);
          expect(message.topics.routingKey).to.be.undefined;
          expect(message.tags).to.eql([]);
          expect(message.payload).to.eql(PAYLOAD);
        },
      };
    });

    // act
    new Builder(TOPIC).publish(PAYLOAD);

  });

  it("should publish message including configuration if it was provided", () => {

    // arrange and assert
    sandbox.stub(channelManager, "findOrCreateProducer", (topic, brokerConfig) => {
      // assert channelManager properties
      expect(topic).to.equal(TOPIC);
      expect(brokerConfig).to.eql({type: "topic"});

      return {
        publish: (message) => {
          // assert message meta
          expect(message.meta.ttl).to.equal(TTL);

          // assert message topic, tags, payload
          expect(message.topics.to).to.equal(TOPIC);
          expect(message.topics.routingKey).to.equal("event:updated");
          expect(message.tags).to.eql(["tag1", "tag2"]);
          expect(message.payload).to.eql(PAYLOAD);
        },
      };
    });

    // act
    new Builder(TOPIC)
      .withTtl(TTL)
      .withExchangeType("topic")
      .withRoutingKey("event:updated")
      .withTags(["tag1", "tag2"])
      .publish(PAYLOAD);
  });

});
