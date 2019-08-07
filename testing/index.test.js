var assert = require("assert");
var assertLib = require("../");

describe(__filename, function() {
	describe("xor", function() {
		var tests = [
			{ it : "true, true", a : true, b : true, message : /true === true/ },
			{ it : "false, false", a : false, b : false, message : /false === false/ },
			{ it : "true, false", a : true, b : false, valid : true },
			{ it : "false, true", a : false, b : true, valid : true }
		]
		
		tests.forEach(function(test) {
			it(test.it, function() {
				try {
					assertLib.xor(test.a, test.b);
					assert.strictEqual(true, test.valid);
				} catch (e) {
					assert.ok(e.message.match(test.message));
				}
			});
		});
	});
	
	describe("deepCheck", function() {
		var TestClass = function(args) {
			var self = this;
			
			Object.keys(args).forEach(function(val, i) {
				self[val] = args[val];
			});
		}
		
		var testFn = function(arg1, arg2) {
			return [arg1, arg2].join("_");
		}
		
		var tests = [
			{ it : "string valid", data : "foo", schema : "foo", valid : true },
			{ it : "string type only valid", data : "foo", schema : { type : "string" }, valid : true },
			{ it : "string type only invalid", data : 5, schema : { type : "string" }, valid : false, message : "data at root was not a string, but it should be" },
			{ it : "string invalid", data : "foo", schema : "bar", valid : false, message : "data 'foo' did not equal 'bar' at root" },
			{ it : "string object valid", data : "foo", schema : { type : "string", data : "foo" }, valid : true },
			{ it : "string object invalid", data : "foo", schema : { type : "string", data : "bar" }, valid : false, message : "data 'foo' did not equal 'bar' at root" },
			{ it : "string regex valid", data : "foo something crazy", schema : { type : "string", data : /^foo.*crazy$/ }, valid : true },
			{ it : "string regex invalid", data : "foo something crazy", schema : { type : "string", data : /bogus/ }, valid : false, message : "data 'foo something crazy' did not contain '/bogus/' at root" },
			{
				it : "string regex array, valid",
				data : "foo something crazy",
				schema : { type : "string", data : [/foo/, /crazy/] },
				valid : true
			},
			{
				it : "string regex array, invalid",
				data : "foo something crazy",
				schema : { type : "string", data : [/foo/, /bogus/] },
				valid : false,
				message : "data 'foo something crazy' did not contain '/bogus/' at root"
			},
			{ it : "number valid", data : 1, schema : 1, valid : true },
			{ it : "number type only valid", data : 5, schema : { type : "number" }, valid : true },
			{ it : "number type only invalid", data : "foo", schema : { type : "number" }, valid : false, message : "data at root was not a number, but it should be" },
			{ it : "number invalid", data : 1, schema : 2, valid : false, message : "data '1' did not equal '2' at root" },
			{ it : "number object valid", data : 1, schema : { type : "number", data : 1 }, valid : true },
			{ it : "boolean valid", data : true, schema : true, valid : true },
			{ it : "boolean invalid", data : false, schema : true, valid : false, message : "data 'false' did not equal 'true' at root" },
			{ it : "boolean type only valid", data : false, schema : { type : "boolean" }, valid : true },
			{ it : "boolean type only invalid", data : 5, schema : { type : "boolean" }, valid : false, message : "data at root was not a boolean, but it should be" },
			{ it : "object valid", data : { foo : "fooValue" }, schema : { type : "object", data : { foo : "fooValue" } }, valid : true },
			{ it : "object invalid", data : { foo : "fooValue" }, schema : { type : "object", data : { foo : "barValue" } }, valid : false, message : "data 'fooValue' did not equal 'barValue' at root.foo" },
			{ it : "object valid more keys", data : { foo : "fooValue", bar : "barValue" }, schema : { type : "object", data : { foo : "fooValue" } }, valid : true },
			{ it : "object invalid more keys", data : { foo : "fooValue" }, schema : { type : "object", data : { foo : "fooValue", bar : "barValue" } }, valid : false, message : "data at root.bar was not a string, but it should be" },
			{
				it : "object recurse valid",
				data : { foo : { bar : { baz : "bazValue" } } },
				schema : { type : "object", data : { foo : { type : "object", data : { bar : { type : "object", data : { baz : "bazValue" } } } } } },
				valid : true
			},
			{
				it : "object recurse invalid",
				data : { foo : { bar : { baz : "bazValue" } } },
				schema : { type : "object", data : { foo : { type : "object", data : { bar : { type : "object", data : { baz : "wrongValue" } } } } } },
				valid : false,
				message : "data 'bazValue' did not equal 'wrongValue' at root.foo.bar.baz"
			},
			{
				it : "object shorthand valid",
				data : { foo : { bar : { baz : "bazValue" } } },
				schema : { foo : { bar : { baz : "bazValue" } } },
				valid : true
			},
			{
				it : "object shorthand invalid",
				data : { foo : { bar : { baz : "bazValue" } } },
				schema : { foo : { bar : { baz : "bazValue2" } } },
				valid : false,
				message : "data 'bazValue' did not equal 'bazValue2' at root.foo.bar.baz"
			},
			{
				it : "object empty",
				data : {},
				schema : {},
				valid : true
			},
			{
				it : "object failed recursion",
				data : { foo : { bar : { baz : "bazValue" } } },
				schema : { foo : { baz : { qux : "quxValue" } } },
				valid : false,
				message : "data at root.foo.baz was not an object, but it should be"
			},
			{
				it : "object enforce keys",
				data : { foo : "fooValue", bar : "barValue" },
				schema : { type : "object", allowExtraKeys : false, data : { foo : "fooValue" } },
				valid : false,
				message : "extra key 'bar' at root"
			},
			{
				it : "object shorthand enforce key invalid",
				data : { foo : "fooValue", bar : "barValue" },
				schema : { _deepCheck_allowExtraKeys : false, foo : "fooValue" },
				valid : false,
				message : "extra key 'bar' at root"
			},
			{
				it : "object shorthand enforce key valid",
				data : { foo : "fooValue", bar : "barValue" },
				schema : { _deepCheck_allowExtraKeys : false, foo : "fooValue", bar : "barValue" },
				valid : true
			},
			{
				it : "object class valid",
				data : { foo : new TestClass({ foo : "fooValue", bar : "barValue" }) },
				schema : { foo : { type : "object", allowExtraKeys : false, data : { foo : "fooValue", bar : "barValue" }, class : TestClass } },
				valid : true
			},
			{
				it : "object class invalid",
				data : { foo : new TestClass({ foo : "fooValue", bar : "barValue" }) },
				schema : { foo : { type : "object", allowExtraKeys : false, data : { foo : "fooValue", bar : "barValue" }, class : Date } },
				valid : false,
				message : "data at root.foo was not instanceof the proper class"
			},
			{
				it : "object with no data",
				data : { foo : new Date() },
				schema : { foo : { type : "object", class : Date } },
				valid : true
			},
			{
				it : "object key check",
				data : new TestClass({ foo : "something", bar : "somethingElse" }),
				schema : { type : "object", class : TestClass, allowExtraKeys : false, data : { foo : "something" } },
				valid : false,
				message : "extra key 'bar' at root"
			},
			{
				it : "function check valid",
				data : testFn,
				schema : { type : "function", data : testFn },
				valid : true
			},
			{
				it : "function check invalid",
				data : testFn,
				schema : { type : "function", data : function() {} },
				valid : false,
				message : "data at root was not the correct function reference"
			},
			{
				it : "function check shorthand valid",
				data : testFn,
				schema : testFn,
				valid : true
			},
			{
				it : "function check shorthand invalid",
				data : testFn,
				schema : function() {},
				valid : false,
				message : "data at root was not the correct function reference"
			},
			{
				it : "function check with calls valid",
				data : testFn,
				schema : { type : "function", data : testFn, calls : [{ args : ["foo", "bar"], result : "foo_bar" }, { args : ["foo"], result : "foo_" }] },
				valid : true
			},
			{
				it : "function check with calls invalid",
				data : { foo : testFn },
				schema : { foo : { type : "function", calls : [{ args : ["foo"], result : "foo_" }, { args : ["foo", "bar"], result : "foo" }] } },
				valid : false,
				message : "data 'foo_bar' did not match 'foo' returned by the function at root.foo on call index 1"
			},
			{ it : "date shorthand valid", data : new Date(2011, 1, 1), schema : new Date(2011, 1, 1), valid : true },
			{ it : "date shorthand invalid", data : new Date(2011, 1, 1), schema : new Date(2011, 1, 1, 1), valid : false, message : "date data '2011-02-01T00:00:00.000Z' did not equal '2011-02-01T01:00:00.000Z' at root" },
			{ it : "date shorthand invalid str", data : "foo", schema : new Date(2011, 1, 1), valid : false, message : "data at root was not of type date" },
			{ it : "date valid", data : new Date(2011, 1, 1), schema : { type : "date", data : "2011-02-01T00:00:00.000Z" }, valid : true },
			{ it : "date invalid type", data : "foo", schema : { type : "date", data : "2011-02-01T00:00:00.000Z" }, valid : false, message : "data at root was not of type date" },
			{ it : "date valid type only", data : new Date(2011, 1, 1), schema : { type : "date" }, valid : true },
			{ it : "date valid date as data", data : new Date(2011, 1, 1), schema : { type : "date", data : new Date(2011, 1, 1) }, valid : true },
			{ it : "date invalid value", data : new Date(2011, 1, 1), schema : { type : "date", data : "2012-02-01T00:00:00:00.000Z" }, valid : false, message : "date data '2011-02-01T00:00:00.000Z' did not equal '2012-02-01T00:00:00:00.000Z' at root" },
			{ it : "date invalid str", data : "2011-02-01T00:00:00.000Z", schema : { type : "date", data : "2011-02-01T00:00:00.000Z" }, valid : false, message : "data at root was not of type date" },
			{ it : "array simple valid", data : ["foo", "bar"], schema : { type : "array", data : ["foo", "bar"] }, valid : true },
			{ it : "array simple invalid", data : ["foo", "bar"], schema : { type : "array", data : ["foo", "baz"] }, valid : false, message : "data 'bar' did not equal 'baz' at root.1" },
			{ it : "array simple invalid length", data : ["foo", "bar", "baz"], schema : { type : "array", data : ["foo", "bar"] }, valid : false, message : "data at root was length 3, should have been length 2" },
			{ it : "array simple missing items", data : ["foo", "bar"], schema : { type : "array", data : ["foo", "bar", "baz"] }, valid : false, message : "data at root was length 2, should have been length 3" },
			{ it : "array object valid", data : [{ foo : "fooValue" }], schema : { type : "array", data : [{ type : "object", data : { foo : "fooValue" } }] }, valid : true },
			{
				it : "array object invalid",
				data : [{ foo : "fooValue" }],
				schema : { type : "array", data : [{ type : "object", data : { foo : "barValue" } }] },
				valid : false,
				message : "data 'fooValue' did not equal 'barValue' at root.0.foo"
			},
			{
				it : "array object invalid second",
				data : [{ foo : "fooValue" }, { bar : "barValue" }],
				schema : { type : "array", data : [{ type : "object", data : { foo : "fooValue" } }, { type : "object", data : { bar : "fooValue2" } }] },
				valid : false,
				message : "data 'barValue' did not equal 'fooValue2' at root.1.bar"
			},
			{
				it : "array shorthand valid",
				data : [{ foo : "fooValue" }, { bar : "barValue" }],
				schema : [{ foo : "fooValue" }, { bar : "barValue" }],
				valid : true
			},
			{
				it : "array shorthand invalid",
				data : [{ foo : "fooValue" }, { bar : "barValue" }],
				schema : [{ foo : "fooValue" }, { bar : "bazValue" }],
				valid : false,
				message : "data 'barValue' did not equal 'bazValue' at root.1.bar"
			},
			{
				it : "array empty valid",
				data : [],
				schema : [],
				valid : true
			},
			{
				it : "object shorthand with non-standard type",
				data : { type : "foo", foo : "dataValue" },
				schema : { type : "foo", foo : "dataValue" },
				valid : true
			},
			{
				it : "object shorthand with non-standard type invalid",
				data : { type : "foo", foo : "dataValue" },
				schema : { type : "bar", foo : "dataValue" },
				valid : false,
				message : "data 'foo' did not equal 'bar' at root.type"
			},
			{
				it : "null shorthand valid",
				data : { foo : null },
				schema : { foo : null },
				valid : true
			},
			{
				it : "null shorthand invalid",
				data : { foo : undefined },
				schema : { foo : null },
				valid : false,
				message : "data at root.foo was not null, but it should be"
			},
			{
				it : "invalid call syntax root",
				data : "foo",
				schema : { type : "bogus" },
				valid : false,
				message : "Validation Error\r\n\tField \'type\' must be a value in \'boolean,string,array,number,undefined,function,object,date,null\'."
			},
			{
				it : "invalid call syntax function",
				data : testFn,
				schema : { type : "function", calls : [{ foo : "something" }] },
				valid : false,
				message : "Validation Error\r\n\tObject 'calls.0' contains extra key 'foo' not declared in schema."
			},
			{
				it : "shorthand with just data key valid",
				data : {
					data : { something : true }
				},
				schema : {
					data : { something : true }
				},
				valid : true
			},
			{
				it : "shorthand with just data key invalud",
				data : {
					data : { something : true }
				},
				schema : {
					data : { something : false }
				},
				valid : false,
				message : "data 'true' did not equal 'false' at root.data.something"
			},
			{
				it : "nasty mess of short-hand and non-shorthand valid",
				data : {
					foo : [true, "yes", 5],
					bar : [false, "no", 10],
					nested : {
						foo : "fooValue",
						bar : "barValue",
						notCheck : "notChecked"
					},
					obj : {
						arrData : [{ foo : "fooValue1" }, { foo : "fooValue2" }, { foo : "fooValue3", bar : "barValue" }],
						isHere : true,
						notChecked : [1,2,3]
					}
				},
				schema : {
					type : "object",
					data : {
						foo : [true, "yes", 5],
						bar : [{ type : "boolean", data : false }, { type : "string", data : "no" }, 10],
						nested : {
							foo : "fooValue",
							bar : { type : "string", data : "barValue" }
						},
						obj : {
							type : "object",
							data : {
								arrData : {
									type : "array",
									data : [
										{ type : "object", data : { foo : "fooValue1" } },
										{ foo : "fooValue2" },
										{ foo : "fooValue3", bar : { type : "string", data : "barValue" } }
									]
								},
								isHere : true
							}
						}
					}
				},
				valid : true
			}
		]
		
		tests.forEach(function(test) {
			(test.only ? it.only : it )(test.it, function() {
				try {
					assertLib.deepCheck(test.data, test.schema);
				} catch(e) {
					assert.strictEqual(e.message, test.message);
					return;
				}
				
				assert.strictEqual(true, test.valid);
			});
		});
	});
	
	describe("throws", function() {
		var tests = [
			{ it : "string valid", fn : function() { throw new Error("yes") }, checker : "yes", valid : true },
			{ it : "string not valid", fn : function() { throw new Error("no") }, checker : "yes", message : "no !== yes", valid : false },
			{ it : "string not throw", fn : function() {}, checker : "yes", message : "Was supposed to throw but didn't", valid : false },
			{ it : "regex valid", fn : function() { throw new Error("yes more stuff") }, checker : /more/, valid : true },
			{ it : "regex invalid", fn : function() { throw new Error("yes more stuff") }, checker : /^more/, message : "'yes more stuff'.match(/^more/) === null", valid : false },
			{ it : "regex not throw", fn : function() {}, checker : /more/, message : "Was supposed to throw but didn't", valid : false },
			{ it : "fn valid", fn : function() { throw new Error("custom") }, checker : function(err) { assert.strictEqual(err.message, "custom") }, valid : true },
			{ it : "fn invalid", fn : function() { throw new Error("custom") }, checker : function(err) { assert.strictEqual(err.message, "customBogus", "'custom' !== 'customBogus'") }, message : "'custom' !== 'customBogus'", valid : false },
			{ it : "fn not throw", fn : function() {}, checker : function(err) { assert.strictEqual(err.message, "what?") }, message : "Was supposed to throw but didn't", valid : false },
			{ it : "fn clean valid", fn : function() { throw new Error("\t\tBogus\r\n\t\tSomething\t\t") }, checker : function(err) { assertLib.trimErr(err, "    \tBogus  \r\nSomething\r\n    ") }, valid : true },
			{ it : "fn clean not valid", fn : function() { throw new Error("    \r\n\t\tDoes\n\n not\n\n match") }, checker : function(err) { assertLib.trimErr(err, "Does not Match") }, message : "'Does not match' !== 'Does not Match'", valid : false }
		]
		
		tests.forEach(function(test) {
			it(test.it, function() {
				try {
					assertLib.throws(test.fn, test.checker);
				} catch(e) {
					assert.strictEqual(e.message, test.message);
					assert.strictEqual(test.valid, false);
					return;
				}
				
				assert.strictEqual(test.valid, true);
			});
		});
	});
	
	describe("assertHtml", function() {
		var tests = [
			{
				name : "should get count of selector, valid",
				html : "<div class='test'>This is content</div>",
				checks : [
					{
						selector : ".test",
						count : 1
					}
				],
				valid : true
			},
			{
				name : "should get count of selector, invalid",
				html : "<div class='test'>This is content</div>",
				checks : [
					{
						selector : ".bogus",
						count : 1
					}
				],
				message : "Count mismatch for selector '.bogus'. 0 !== 1",
				valid : false
			},
			{
				name : "should check html content with trimming, valid",
				html : "<div class='test'>\t\t\r\nTesting      \t\t\t    More\t\t  </div>",
				checks : [
					{
						selector : ".test",
						html : "Testing More"
					}
				],
				valid : true
			},
			{
				name : "should check html content with trimming, invalid",
				html : "<div class='test'>\t\t\r\nTesting2      \t\t\t    More\t\t  </div>",
				checks : [
					{
						selector : ".test",
						html : "Testing More"
					}
				],
				message : "Html mismatch for selector '.test'. 'Testing2 More' !== 'Testing More'",
				valid : false
			},
			{
				name : "should not escape unescaped characters with html, valid",
				html : `<div class='text'>This is 'something' "foo"</div>`,
				checks : [
					{
						selector : ".text",
						html : `This is 'something' "foo"`
					}
				],
				valid : true
			},
			{
				name : "characters not escape escaped characters with html, valid",
				html : `<div class='text'>&nbsp; &apos;foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;</div>`,
				checks : [
					{
						selector : ".text",
						html : `&nbsp; &apos;foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;`
					}
				],
				valid : true
			},
			{
				name : "characters with escaped html, invalid",
				html : `<div class='text'>&nbsp; &apos;foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;</div>`,
				checks : [
					{
						selector : ".text",
						html : `&nbsp; &apos;Foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;`
					}
				],
				message : "Html mismatch for selector '.text'. '&nbsp; &apos;foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;' !== '&nbsp; &apos;Foo&apos; <span>test</span> &lt;b&gt;yes&lt;/b&gt; &quot;bar&quot;'",
				valid : false
			},
			{
				name : "should check text content with trimming, valid",
				html : `<div class='test'>\t\t\r\nTesting \t\t\t    More\t\t  </div>`,
				checks : [
					{
						selector : ".test",
						text : `Testing More`
					}
				],
				valid : true
			},
			{
				name : "should check text content with trimming, invalid",
				html : `<div class='test'>\t\t\r\nTesting2 \t\t\t    More\t\t  </div>`,
				checks : [
					{
						selector : ".test",
						text : `Testing More`
					}
				],
				message : `Text mismatch for selector '.test'. 'Testing2 More' !== 'Testing More'`,
				valid : false
			},
			{
				name : "should not escape characters with text",
				html : `<div class='text'>This is 'something' "foo"</div>`,
				checks : [
					{
						selector : ".text",
						text : `This is 'something' "foo"`
					}
				],
				valid : true
			},
			{
				name : "should strip inner html with text",
				html : `<div class='text'>This is <span>Something</span> with <b>Inner</b> html</div>`,
				checks : [
					{
						selector : ".text",
						text : "This is Something with Inner html"
					}
				],
				valid : true
			},
			{
				name : "should check via regex, valid",
				html : `<div class="text">This is a test of regex</div>`,
				checks : [
					{
						selector : ".text",
						textRegex : /This.*regex/
					}
				],
				valid : true
			},
			{
				name : "should check via regex, invalid",
				html : `<div class="text">This is a test of regex</div>`,
				checks : [
					{
						selector : ".text",
						textRegex : /this.*regex/
					}
				],
				message : "textRegex mismatch for selector '.text'. 'This is a test of regex' did not contain '/this.*regex/'",
				valid : false
			},
			{
				name : "should do multiple checks, valid",
				html : "<ul><li>Test 1</li><li>Test 2</li></ul>",
				checks : [
					{
						selector : "li",
						eq : 0,
						html : "Test 1"
					},
					{
						selector : "li",
						eq : 1,
						html : "Test 2"
					}
				],
				valid : true
			},
			{
				name : "should do multiple checks, invalid",
				html : "<ul><li>Test 1</li><li>Test 2</li></ul>",
				checks : [
					{
						selector : "li",
						eq : 0,
						html : "Test 1"
					},
					{
						selector : "li",
						eq : 1,
						html : "Test Bogus"
					}
				],
				message : "Html mismatch for selector 'li'. 'Test 2' !== 'Test Bogus'",
				valid : false
			},
			{
				name : "should do nested checks, valid",
				html : "<ul><li>Bogus</li></ul><ul><li>Valid</li></ul>",
				checks : [
					{
						selector : "ul",
						eq : 1,
						checks : [
							{
								selector : "li",
								html : "Valid"
							}
						]
					}
				],
				valid : true
			},
			{
				name : "should reach in without changing selector",
				html : "<ul><li>First</li><li>Second</li><li>Third</li></ul>",
				checks : [
					{
						selector : "ul li",
						count : 3,
						checks : [
							{
								eq : 0,
								html : "First"
							},
							{
								eq : 1,
								html : "Second"
							},
							{
								eq : 2,
								html : "Third"
							}
						]
					}
				],
				valid : true
			},
			{
				name : "should childCount, valid",
				html : "<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>",
				checks : [
					{
						selector : "ul",
						childCount : 3
					}
				],
				valid : true
			},
			{
				name : "should childCount, invalid",
				html : "<ul><li>Foo</li><li>Bar</li><li>Baz</li></ul>",
				checks : [
					{
						selector : "ul",
						childCount : 2
					}
				],
				message : "childCount mismatch for selector 'ul'. 3 !== 2",
				valid : false
			},
			{
				name : "should check attributes, valid",
				html : "<div data-foo='fooValue' data-bar></div>",
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : "fooValue", "data-bar" : "" }
					}
				],
				valid : true
			},
			{
				name : "should check attributes, valid",
				html : "<div data-foo='fooValue' data-bar='bogus'></div>",
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : "fooValue", "data-bar" : "" }
					}
				],
				message : "attrs mismatch for selector 'div' attr 'data-bar'. 'bogus' !== ''",
				valid : false
			},
			{
				name : "should check attrs against regex, valid",
				html : `<div data-foo='{ "foo" : [{ "complex" : true }] }'></div>`,
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : /complex/ }
					}
				],
				valid : true
			},
			{
				name : "should check attrs against regex, invalid",
				html : `<div data-foo='{ "foo" : [{ "complex" : true }] }'></div>`,
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : /bogus/ }
					}
				],
				message : `attrs mismatch for selector 'div' attr 'data-foo'. '{ "foo" : [{ "complex" : true }] }' did not contain '/bogus/'`,
				valid : false
			},
			{
				name : "should check array of regexs, valid",
				html : `<div data-foo='{ "foo" : [{ "complex" : true }, { "magic" : "yes" }] }'></div>`,
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : [/complex/, /magic/] }
					}
				],
				valid : true
			},
			{
				name : "should check array of regexs, invalid",
				html : `<div data-foo='{ "foo" : [{ "complex" : true }, { "magic" : "yes" }] }'></div>`,
				checks : [
					{
						selector : "div",
						attrs : { "data-foo" : [/complex/, /bogus/] }
					}
				],
				message : `attrs mismatch for selector 'div' attr 'data-foo'. '{ "foo" : [{ "complex" : true }, { "magic" : "yes" }] }' did not contain '/bogus/'`,
				valid : false
			},
			{
				name : "should allow exec on nodes, valid",
				html : `<ul><li>One</li><li>Two</li><li>Three</li></ul>`,
				checks : [
					{
						selector : "ul",
						exec : ({ $, node }) => {
							node.find("li").eq(0).attr("added", true);
						}
					},
					// this block ensures that our exec was called by checking the altered state of the dom
					{
						selector : "li",
						eq : 0,
						attrs : {
							added : "true"
						}
					}
				],
				valid : true
			},
			{
				name : "should allow exec on nodes, invalid",
				html : `<ul><li>One</li><li>Two</li><li>Three</li></ul>`,
				checks : [
					{
						selector : "ul",
						exec : ({ $, node }) => {
							throw new Error("Failure in exec");
						}
					}
				],
				message : "Failure in exec",
				valid : false
			},
			{
				name : "should allow each on nodes, valid",
				html : `<ul><li>One</li><li>Two</li><li>Three</li></ul>`,
				checks : [
					{
						selector : "li",
						each : ({ $, node, i }) => {
							node.attr("i", i);
						}
					},
					{
						selector : "li",
						eq : 0,
						attrs : {
							i : "0"
						}
					},
					{
						selector : "li",
						eq : 1,
						attrs : {
							i : "1"
						}
					},
					{
						selector : "li",
						eq : 2,
						attrs : {
							i : "2"
						}
					}
				],
				valid : true
			},
			{
				name : "should allow each on nodes, valid",
				html : `<ul><li>One</li><li>Two</li><li>Three</li></ul>`,
				checks : [
					{
						selector : "li",
						each : ({ $, node, i }) => {
							throw new Error("Each fail");
						}
					}
				],
				message : "Each fail",
				valid : false
			}
		]
		
		tests.forEach(function(test) {
			(test.only ? it.only : it)(test.name, function(done) {
				try {
					assertLib.assertHtml(test.html, test.checks);
				} catch(e) {
					assert.strictEqual(e.message, test.message);
					assert.strictEqual(test.valid, false);
					return done();
				}
				
				assert.strictEqual(test.valid, true);
				
				return done();
			});
		});
	});
});