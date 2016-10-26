import {expect} from "chai";
import {join} from "path";
const simple = require("simple-mock");
import {create} from "../../lib/config";

describe("config", function () {
  afterEach(function (done) {
    simple.restore();
    done();
  });

  describe("default", function () {
    let config;

    beforeEach(function (done) {
      config = create();
      done();
    });

    describe("configure()", function () {
      it("should merge provided options", function (done) {
        config.configure({
          etc: "abc"
        });

        expect(config.etc).equals("abc");
        done();
      });
    });

    describe("_init()", function () {
      it("should load JSON config file", function (done) {
        simple.mock(process.env, "MSB_CONFIG_PATH", join(__dirname, "_fixtures", "sample_config.json"));

        config._init();

        expect(config.configurationTestValue).equals(12345);

        done();
      });

      it("should load JS config file", function (done) {
        simple.mock(process.env, "MSB_CONFIG_PATH", join(__dirname, "_fixtures", "sample_config.js"));

        config._init();

        expect(Date.now() - config.configurationTestValue).lessThan(2000);

        done();
      });
    });
  });

  describe("create()", function () {

    it("should load config from environment variables", function (done) {

      simple.mock(process.env, "MSB_BROKER_ADAPTER", "a");
      simple.mock(process.env, "MSB_BROKER_HOST", "c");
      simple.mock(process.env, "MSB_BROKER_PORT", "e");
      simple.mock(process.env, "MSB_BROKER_PASS", "g");
      simple.mock(process.env, "MSB_BROKER_USER", "i");
      simple.mock(process.env, "MSB_AMQP_VHOST", "j");

      const config = create();

      expect(config.brokerAdapter).equals("a");
      expect(config.amqp.host).equals("c");
      expect(config.amqp.port).equals("e");
      expect(config.amqp.login).equals("i");
      expect(config.amqp.password).equals("g");
      expect(config.amqp.vhost).equals("j");
      done();
    });
  });

});