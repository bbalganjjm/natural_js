async pageModule => {
    const {
        mountPage
      } = await import(pageModule),
      hosts = [document.createElement("div"), document.createElement("div")];
    document.body.append(...hosts);
    const events = [],
      receivers = [],
      controllers = [],
      broadPaths = [];
    const contextMethods = [];
    class ConstructorValue {
      constructor(value) {
        this.value = value;
      }
    }
    var _count = /*#__PURE__*/new WeakMap();
    class Controller {
      constructor(context) {
        this.context = context;
        _classPrivateFieldInitSpec(this, _count, 0);
        this.ConstructorValue = ConstructorValue;
        this.actions = void 0;
        this.actions = {
          value: context.input.name,
          search(value) {
            return this.value + ":" + value;
          },
          finish: () => {
            events.push(context.input.name + ":owned");
          }
        };
        controllers.push(this);
        contextMethods.push({
          own: context.own,
          output: context.output
        });
        context.own(() => this.actions.finish());
      }
      init() {
        var _this$count, _this$count2;
        _classPrivateFieldSet(_count, this, (_this$count = _classPrivateFieldGet(_count, this), _this$count2 = _this$count++, _this$count)), _this$count2;
      }
      activate() {}
      deactivate() {}
      dispose() {
        var _this$count3, _this$count4;
        _classPrivateFieldSet(_count, this, (_this$count3 = _classPrivateFieldGet(_count, this), _this$count4 = _this$count3++, _this$count3)), _this$count4;
      }
      count() {
        return _classPrivateFieldGet(_count, this);
      }
    }
    const advice = Object.freeze([Object.freeze({
      match: function (path, _owner, context) {
        "use strict";

        receivers.push(this);
        return context.root.matches("article[data-advised]") && /^(init|activate|deactivate|dispose|actions\.(search|finish))$/.test(path);
      },
      wrap: function (proceed, path, _owner, context) {
        "use strict";

        receivers.push(this);
        return function () {
          "use strict";

          receivers.push(this);
          events.push(context.input.name + ":" + path);
          return proceed(...Array.from(arguments));
        };
      }
    }), Object.freeze({
      match: path => {
        broadPaths.push(path);
        return true;
      },
      wrap: (proceed, _path, _owner, context) => {
        context.own(() => {
          events.push(context.input.name + ":advice-owned");
        });
        context.output("installation");
        return proceed;
      }
    })]);
    const definition = {
      view: () => {
        const root = document.createElement("article");
        root.dataset.advised = "";
        root.innerHTML = "<h1>Authored page</h1><button type='button'>Search</button>";
        return root;
      },
      advice,
      controller: context => new Controller(context)
    };
    const first = mountPage(hosts[0], definition, {
        name: "first"
      }),
      second = mountPage(hosts[1], definition, {
        name: "second"
      });
    await Promise.all([first.ready, second.ready]);
    const firstSearch = controllers[0].actions.search,
      secondSearch = controllers[1].actions.search;
    const values = [{
      run: firstSearch
    }.run("A"), {
      run: secondSearch
    }.run("B")];
    const classValue = controllers.every(controller => controller.ConstructorValue === ConstructorValue && new controller.ConstructorValue(7).value === 7);
    const frameworkMethods = controllers.every((controller, index) => controller.context.own === contextMethods[index].own && controller.context.output === contextMethods[index].output);
    const contextSkipped = broadPaths.every(path => !path.startsWith("context."));
    await first.dispose();
    const sibling = controllers[1].actions.search("C");
    await second.dispose();
    const empty = hosts.every(host => host.childElementCount === 0);
    hosts.forEach(host => host.remove());
    return {
      values,
      sibling,
      classValue,
      frameworkMethods,
      contextSkipped,
      empty,
      plain: receivers.every(receiver => receiver === undefined),
      counts: controllers.map(controller => controller.count()),
      events
    };
  }