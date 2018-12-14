


export default class {
  
  static bar() {
    return {
      star:'xx'
    }
  }

  zoom(){
    return {
      a: 'aaa',
      b: true
    }
  }
}

//
// export type FooX = Array<keyof ReturnType<typeof Foo.prototype.zoom>>;
// export type Foo1 = Array<keyof ReturnType<typeof Foo.bar>>
//
// const v: FooX = ['a', 'b'];
//
// console.log(v);
