'use strict';

////////////

class Foo {

}

class Bar {

}

export const foo = {
  Foo, Bar
};

//load async deps for any of your suman tests
export default ($core: Object, $deps: Object) => {

  return {

    dependencies: {

      'chuck': function () {
        return 'berry';
      },

      'mark': function (cb: Function) {
        cb(null, 'rutherfurd');
      },

    }

  };

};
