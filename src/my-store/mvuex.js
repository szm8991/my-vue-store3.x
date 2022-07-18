//挂载$store
//实现store
let Vue;
class Store {
  constructor(options) {
    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrappedGetters = options.getters;
    //定义computed选项
    const computed = {};
    this.getters = {};
    const store = this;
    Object.keys(this._wrappedGetters).forEach(key => {
      //获取用户定义的getters
      const fn = store._wrappedGetters[key];
      //转换为computed可以使用的无参数形式
      computed[key] = function() {
        return fn(store.state);
      };
      //为getters定义只读属性
      Object.defineProperty(store.getters, key, {
        get: () => store._vm[key],
      });
    });
    //定义响应式数据——借助Vue.data递归响应处理——使用get隐藏
    this._vm = new Vue({
      data: {
        $$state: options.state, //两个$$不会暴露在vue实例上，只能通过vm实例_属性访问
      },
      computed,
    });
    //绑定this
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }
  get state() {
    return this._vm._data.$$state;
  }
  set state(v) {
    console.error('please use replaceState to reset state');
  }
  //commit
  commit(method, payload) {
    const entry = this._mutations[method];
    if (!entry) {
      console.error('unkown mutation method');
    }
    entry(this.state, payload);
  }
  //dispatch
  dispatch(method, payload) {
    const entry = this._actions[method];
    if (!entry) {
      console.error('unkown action method');
    }
    entry(this, payload);
  }
}
function install(_Vue) {
  Vue = _Vue;
  //注册$store
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    },
  });
}
export default { Store, install };
