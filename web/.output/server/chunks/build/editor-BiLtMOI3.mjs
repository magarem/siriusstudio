import { f as useCookie, c as useToast, d as script$2, i as fetchDefaults, s as script$5, e as useNuxtApp, g as asyncDataDefaults, j as useRequestFetch, k as script$8, l as useConfirm, m as script$7, h as createError } from './server.mjs';
import script from './index-DHtgys4e.mjs';
import { defineComponent, shallowRef, inject, computed, toRaw, onMounted, watch, onBeforeUnmount, h as h$1, ref, withAsyncContext, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, toValue, reactive, withDirectives, vModelText, toDisplayString, Fragment, renderList, withKeys, withModifiers, createTextVNode, getCurrentInstance, onServerPrefetch, nextTick, toRef, isRef, useSSRContext, createElementBlock, provide, cloneVNode } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderSlot, ssrRenderAttr, ssrGetDirectiveProps, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import script$3 from './index-Ct44sGTi.mjs';
import script$1 from './index-DWeLxCOT.mjs';
import { VueDraggable } from 'vue-draggable-plus';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import script$6 from './index-55uJlOsk.mjs';
import script$4 from './index-CmPL1XSo.mjs';
import { T as Tooltip } from './index-CyqpZpGj.mjs';
import draggable from 'vuedraggable';
import { basicSetup } from 'codemirror';
import { EditorState, Compartment, StateEffect } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { json as json$1 } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { G as hash } from '../../index.mjs';
import { isPlainObject } from '@vue/shared';
import { debounce } from 'perfect-debounce';
import script$9 from './index-BYNBKnCh.mjs';
import { Icon } from '@iconify/vue';
import 'node:http';
import 'node:https';
import '@primeuix/utils/eventbus';
import '@primeuix/styled';
import '@primeuix/utils';
import '@primeuix/utils/object';
import '@primeuix/styles/base';
import '@primeuix/utils/dom';
import '@primeuix/utils/zindex';
import '@primeuix/styles/toast';
import '@primeuix/utils/uuid';
import '@primeuix/styles/ripple';
import '@primeuix/styles/badge';
import '@primeuix/styles/button';
import '@primeuix/styles/dialog';
import '@primeuix/styles/confirmdialog';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@primevue/core/base/style';
import '@primevue/core/basecomponent/style';
import '@primeuix/styles/autocomplete';
import '@primeuix/styles/cascadeselect';
import '@primeuix/styles/checkbox';
import '@primeuix/styles/checkboxgroup';
import '@primeuix/styles/colorpicker';
import '@primeuix/styles/datepicker';
import '@primeuix/styles/floatlabel';
import '@primeuix/styles/iconfield';
import '@primeuix/styles/iftalabel';
import '@primeuix/styles/inputchips';
import '@primeuix/styles/inputgroup';
import '@primeuix/styles/inputnumber';
import '@primeuix/styles/inputotp';
import '@primeuix/styles/inputtext';
import '@primeuix/styles/knob';
import '@primeuix/styles/listbox';
import '@primeuix/styles/multiselect';
import '@primeuix/styles/password';
import '@primeuix/styles/radiobutton';
import '@primeuix/styles/radiobuttongroup';
import '@primeuix/styles/rating';
import '@primeuix/styles/select';
import '@primeuix/styles/selectbutton';
import '@primeuix/styles/slider';
import '@primeuix/styles/textarea';
import '@primeuix/styles/togglebutton';
import '@primeuix/styles/toggleswitch';
import '@primeuix/styles/treeselect';
import '@primeuix/styles/buttongroup';
import '@primeuix/styles/speeddial';
import '@primeuix/styles/splitbutton';
import '@primeuix/styles/datatable';
import '@primeuix/styles/dataview';
import '@primeuix/styles/orderlist';
import '@primeuix/styles/organizationchart';
import '@primeuix/styles/paginator';
import '@primeuix/styles/picklist';
import '@primeuix/styles/tree';
import '@primeuix/styles/treetable';
import '@primeuix/styles/timeline';
import '@primeuix/styles/virtualscroller';
import '@primeuix/styles/accordion';
import '@primeuix/styles/card';
import '@primeuix/styles/divider';
import '@primeuix/styles/fieldset';
import '@primeuix/styles/panel';
import '@primeuix/styles/scrollpanel';
import '@primeuix/styles/splitter';
import '@primeuix/styles/stepper';
import '@primeuix/styles/tabview';
import '@primeuix/styles/tabs';
import '@primeuix/styles/toolbar';
import '@primeuix/styles/confirmpopup';
import '@primeuix/styles/drawer';
import '@primeuix/styles/popover';
import '@primeuix/styles/fileupload';
import '@primeuix/styles/breadcrumb';
import '@primeuix/styles/contextmenu';
import '@primeuix/styles/dock';
import '@primeuix/styles/menu';
import '@primeuix/styles/menubar';
import '@primeuix/styles/megamenu';
import '@primeuix/styles/panelmenu';
import '@primeuix/styles/steps';
import '@primeuix/styles/tabmenu';
import '@primeuix/styles/tieredmenu';
import '@primeuix/styles/message';
import '@primeuix/styles/inlinemessage';
import '@primeuix/styles/carousel';
import '@primeuix/styles/galleria';
import '@primeuix/styles/image';
import '@primeuix/styles/imagecompare';
import '@primeuix/styles/avatar';
import '@primeuix/styles/blockui';
import '@primeuix/styles/chip';
import '@primeuix/styles/inplace';
import '@primeuix/styles/metergroup';
import '@primeuix/styles/overlaybadge';
import '@primeuix/styles/scrolltop';
import '@primeuix/styles/skeleton';
import '@primeuix/styles/progressbar';
import '@primeuix/styles/progressspinner';
import '@primeuix/styles/tag';
import '@primeuix/styles/terminal';
import '@primevue/forms/form/style';
import '@primevue/forms/formfield/style';
import '@primeuix/styles/tooltip';
import 'node:url';
import 'ipx';
import './index-1v7fOn3J.mjs';
import './index-rAVNvoJo.mjs';
import './index-DrastmS0.mjs';
import './index-pYsnWZon.mjs';
import './index-D1PZGs7A.mjs';
import './index-CkTcF-n4.mjs';
import './index-DvEv5jFA.mjs';
import './index-TfDjWAiw.mjs';
import './index-DFxuv0fG.mjs';
import './index-DYYLDEUJ.mjs';
import './index-CYznjxi4.mjs';
import './index-B9iqfGa9.mjs';
import './index-C82nOgNH.mjs';
import './index-D9B_mmE1.mjs';
import './index-BTrjfb2g.mjs';
import './index-CDpfbJq7.mjs';
import './index-Duwv2dUQ.mjs';
import './index-BK2T85CU.mjs';
import './index-BFpXv7Qa.mjs';
import './index-_P8L0NkB.mjs';
import './index-Cv6gDc49.mjs';
import './index-BYLqP2Zm.mjs';
import './index-qgoMATJ4.mjs';
import './index-XApE-1s_.mjs';

/*!
* VueCodemirror v6.1.1
* Copyright (c) Surmon. All rights reserved.
* Released under the MIT License.
* Surmon
*/
var h=Object.freeze({autofocus:false,disabled:false,indentWithTab:true,tabSize:2,placeholder:"",autoDestroy:true,extensions:[basicSetup]}),y=Symbol("vue-codemirror-global-config");var O,j=function(e){var t=e.onUpdate,n=e.onChange,o=e.onFocus,r=e.onBlur,u=function(e,t){var n={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(n[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(n[o[r]]=e[o[r]]);}return n}(e,["onUpdate","onChange","onFocus","onBlur"]);return EditorState.create({doc:u.doc,selection:u.selection,extensions:(Array.isArray(u.extensions)?u.extensions:[u.extensions]).concat([EditorView.updateListener.of((function(e){t(e),e.docChanged&&n(e.state.doc.toString(),e),e.focusChanged&&(e.view.hasFocus?o(e):r(e));}))])})},S=function(e){var t=new Compartment;return {compartment:t,run:function(n){t.get(e.state)?e.dispatch({effects:t.reconfigure(n)}):e.dispatch({effects:StateEffect.appendConfig.of(t.of(n))});}}},x=function(e,t){var n=S(e),o=n.compartment,r=n.run;return function(n){var u=o.get(e.state);r((null!=n?n:u!==t)?t:[]);}},C={type:Boolean,default:void 0},D={autofocus:C,disabled:C,indentWithTab:C,tabSize:Number,placeholder:String,style:Object,autoDestroy:C,phrases:Object,root:Object,extensions:Array,selection:Object},U={modelValue:{type:String,default:""}},w=Object.assign(Object.assign({},D),U);!function(e){e.Change="change",e.Update="update",e.Focus="focus",e.Blur="blur",e.Ready="ready",e.ModelUpdate="update:modelValue";}(O||(O={}));var z={};z[O.Change]=function(e,t){return  true},z[O.Update]=function(e){return  true},z[O.Focus]=function(e){return  true},z[O.Blur]=function(e){return  true},z[O.Ready]=function(e){return  true};var B={};B[O.ModelUpdate]=z[O.Change];var F=Object.assign(Object.assign({},z),B),P=defineComponent({name:"VueCodemirror",props:Object.assign({},w),emits:Object.assign({},F),setup:function(t,s){var f=shallowRef(),d=shallowRef(),C=shallowRef(),D=Object.assign(Object.assign({},h),inject(y,{})),U=computed((function(){var e={};return Object.keys(toRaw(t)).forEach((function(n){var o;"modelValue"!==n&&(e[n]=null!==(o=t[n])&&void 0!==o?o:D[n]);})),e}));return onMounted((function(){var e;d.value=j({doc:t.modelValue,selection:U.value.selection,extensions:null!==(e=D.extensions)&&void 0!==e?e:[],onFocus:function(e){return s.emit(O.Focus,e)},onBlur:function(e){return s.emit(O.Blur,e)},onUpdate:function(e){return s.emit(O.Update,e)},onChange:function(e,n){e!==t.modelValue&&(s.emit(O.Change,e,n),s.emit(O.ModelUpdate,e,n));}}),C.value=function(e){return new EditorView(Object.assign({},e))}({state:d.value,parent:f.value,root:U.value.root});var n=function(e){var t=function(){return e.state.doc.toString()},n=S(e).run,o=x(e,[EditorView.editable.of(false),EditorState.readOnly.of(true)]),r=x(e,keymap.of([indentWithTab])),u=S(e).run,a=S(e).run,i=S(e).run,c=S(e).run;return {focus:function(){return e.focus()},getDoc:t,setDoc:function(n){n!==t()&&e.dispatch({changes:{from:0,to:e.state.doc.length,insert:n}});},reExtensions:n,toggleDisabled:o,toggleIndentWithTab:r,setTabSize:function(e){u([EditorState.tabSize.of(e),indentUnit.of(" ".repeat(e))]);},setPhrases:function(e){a([EditorState.phrases.of(e)]);},setPlaceholder:function(e){i(placeholder(e));},setStyle:function(e){ void 0===e&&(e={}),c(EditorView.theme({"&":Object.assign({},e)}));}}}(C.value);watch((function(){return t.modelValue}),(function(e){e!==n.getDoc()&&n.setDoc(e);})),watch((function(){return t.extensions}),(function(e){return n.reExtensions(e||[])}),{immediate:true}),watch((function(){return U.value.disabled}),(function(e){return n.toggleDisabled(e)}),{immediate:true}),watch((function(){return U.value.indentWithTab}),(function(e){return n.toggleIndentWithTab(e)}),{immediate:true}),watch((function(){return U.value.tabSize}),(function(e){return n.setTabSize(e)}),{immediate:true}),watch((function(){return U.value.phrases}),(function(e){return n.setPhrases(e||{})}),{immediate:true}),watch((function(){return U.value.placeholder}),(function(e){return n.setPlaceholder(e)}),{immediate:true}),watch((function(){return U.value.style}),(function(e){return n.setStyle(e)}),{immediate:true}),U.value.autofocus&&n.focus(),s.emit(O.Ready,{state:d.value,view:C.value,container:f.value});})),onBeforeUnmount((function(){U.value.autoDestroy&&C.value&&function(e){e.destroy();}(C.value);})),function(){return h$1("div",{class:"v-codemirror",style:{display:"contents"},ref:f})}}}),T=P;

function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "→") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null) throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64) continue;
    if (code < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "" : c === 95 ? " " : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1, QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};
const _sfc_main$9 = {
  __name: "FileManager",
  __ssrInlineRender: true,
  props: {
    files: { type: Array, default: () => [] },
    currentFolder: { type: String, default: "content" },
    currentFile: { type: String, default: "" },
    isCollectionFolder: { type: Boolean, default: false },
    siteContext: String
  },
  emits: [
    "navigate",
    "select",
    "refresh",
    "create-file",
    "create-folder",
    "create-collection",
    "back",
    "refresh"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const showDraggable = ref(true);
    const showHiddenFiles = ref(false);
    const isRefreshing = ref(false);
    const localFiles = ref([]);
    const indexFile = ref(null);
    const removeExtension = (filename) => filename.replace(/\.[^/.]+$/, "");
    const filteredFiles = computed(() => {
      if (showHiddenFiles.value) return props.files;
      return props.files.filter(
        (file) => !file.name.startsWith("_") && !file.name.startsWith(".")
      );
    });
    const indexLabel = computed(() => {
      if (!props.currentFolder || props.currentFolder === "content") {
        return "Home do Site";
      }
      const folderName = props.currentFolder.split("/").pop();
      const formatted = folderName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      return `Capa de ${formatted}`;
    });
    watch(
      [() => props.files, showHiddenFiles],
      // Observa arquivos E o toggle de ocultos
      async ([newFiles]) => {
        showDraggable.value = false;
        const allFiles = [...newFiles || []];
        const candidates = ["_index.md", "index.md", "_index.json", "_index.yml"];
        indexFile.value = allFiles.find(
          (f) => !f.isDirectory && candidates.includes(f.name.toLowerCase())
        );
        if (props.isCollectionFolder) {
          localFiles.value = [];
        } else {
          localFiles.value = allFiles.filter((f) => {
            if (indexFile.value && f.name === indexFile.value.name) return false;
            if (!showHiddenFiles.value && (f.name.startsWith("_") || f.name.startsWith("."))) return false;
            if (f.isDirectory) return true;
            return [".md", ".json", ".yml", ".toml", ".yaml"].some(
              (ext) => f.name.toLowerCase().endsWith(ext)
            );
          });
        }
        await nextTick();
        showDraggable.value = true;
      },
      { immediate: true, deep: true }
    );
    const handleItemClick = (file) => {
      const baseFolder = props.currentFolder.replace(/\/$/, "");
      if (file.isDirectory) {
        if (file.data?.isDir) {
          emit("navigate", file.name);
        } else {
          const fullPath = `${baseFolder}/${file.name}/_index.md`;
          emit("select", fullPath);
        }
      } else {
        const fullPath = `${baseFolder}/${file.name}`;
        emit("select", fullPath);
      }
    };
    const onDragEnd = async () => {
      const orderedNames = localFiles.value.map((f) => f.name);
      try {
        await $fetch("/api/admin/reorder", {
          method: "POST",
          body: { folder: props.currentFolder, files: orderedNames }
        });
        emit("refresh");
      } catch (error) {
        console.error("Erro ao reordenar");
      }
    };
    const contextMenu = ref();
    const activeMenuFile = ref(null);
    const menuItems = ref([
      {
        label: "Renomear",
        icon: "pi pi-pencil",
        command: () => openRenameDialog(activeMenuFile.value)
      },
      {
        label: "Mover para...",
        icon: "pi pi-folder-open",
        command: () => openMoveDialog(activeMenuFile.value)
      },
      { separator: true },
      {
        label: "Excluir",
        icon: "pi pi-trash",
        class: "text-red-400 hover:text-red-500",
        command: () => confirmDelete(activeMenuFile.value)
      }
    ]);
    const toggleMenu = (event, file) => {
      if (/^(_?index)\.(md|json|yml|yaml|toml)$/i.test(file.name)) {
        return;
      }
      activeMenuFile.value = file;
      contextMenu.value.toggle(event);
    };
    const renameDialogVisible = ref(false);
    const renameLoading = ref(false);
    const targetFile = ref(null);
    const newFileName = ref("");
    const isIndexActive = computed(() => {
      if (!indexFile.value || !props.currentFile) return false;
      const expectedIndex = `${props.currentFolder}/${indexFile.value.name}`.replace(/\/+/g, "/");
      const current = props.currentFile.replace(/\/+/g, "/");
      return current === expectedIndex;
    });
    const openRenameDialog = (file) => {
      targetFile.value = file;
      newFileName.value = removeExtension(file.name);
      renameDialogVisible.value = true;
    };
    const confirmRename = async () => {
      if (!newFileName.value || !targetFile.value) return;
      renameLoading.value = true;
      try {
        const oldName = targetFile.value.name;
        const extension = oldName.includes(".") ? "." + oldName.split(".").pop() : "";
        let finalNewName = newFileName.value;
        if (!finalNewName.toLowerCase().endsWith(extension) && extension)
          finalNewName += extension;
        const fullOldPath = `${props.currentFolder}/${oldName}`;
        const fullNewPath = `${props.currentFolder}/${finalNewName}`;
        const response = await $fetch("/api/admin/rename", {
          method: "POST",
          body: { oldname: fullOldPath, newname: fullNewPath }
        });
        toast.add({ severity: "success", summary: "Renomeado", life: 2e3 });
        renameDialogVisible.value = false;
        emit("refresh");
        if (props.currentFile && props.currentFile.endsWith(oldName)) {
          emit("select", response?.newname || fullNewPath);
        }
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: error.data?.message
        });
      } finally {
        renameLoading.value = false;
      }
    };
    const deleteDialogVisible = ref(false);
    const itemToDelete = ref(null);
    const deleteLoading = ref(false);
    const confirmDelete = (file) => {
      itemToDelete.value = file;
      deleteDialogVisible.value = true;
    };
    const handleDelete = async () => {
      if (!itemToDelete.value) return;
      deleteLoading.value = true;
      try {
        await $fetch("/api/admin/storage", {
          method: "DELETE",
          body: { folder: props.currentFolder, file: itemToDelete.value.name }
        });
        toast.add({ severity: "success", summary: "Excluído", life: 2e3 });
        emit("refresh");
        deleteDialogVisible.value = false;
        itemToDelete.value = null;
      } catch (e) {
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao excluir."
        });
      } finally {
        deleteLoading.value = false;
      }
    };
    const moveDialogVisible = ref(false);
    const itemToMove = ref(null);
    const moveLoading = ref(false);
    const folderTree = ref([]);
    const selectedNodeKey = ref(null);
    const expandedNodeKeys = ref({});
    const destinationPath = ref("");
    const buildTree = (paths) => {
      const root = [];
      paths.forEach((path) => {
        const parts = path.split("/");
        let currentLevel = root;
        let currentPath = "";
        parts.forEach((part) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          let existingNode = currentLevel.find((n) => n.label === part);
          if (!existingNode) {
            existingNode = {
              key: currentPath,
              label: part,
              data: currentPath,
              icon: "pi pi-fw pi-folder",
              children: []
            };
            currentLevel.push(existingNode);
          }
          currentLevel = existingNode.children;
        });
      });
      return root;
    };
    const openMoveDialog = async (file) => {
      itemToMove.value = file;
      destinationPath.value = props.currentFolder;
      try {
        const folders = await $fetch("/api/admin/folders", {
          query: { site: props.siteContext }
        });
        const relevantFolders = folders.filter((p) => !p.includes("."));
        folderTree.value = buildTree(relevantFolders);
        const _expanded = {};
        relevantFolders.forEach((path) => {
          _expanded[path] = true;
        });
        expandedNodeKeys.value = _expanded;
        if (props.currentFolder)
          selectedNodeKey.value = { [props.currentFolder]: true };
        moveDialogVisible.value = true;
      } catch (e) {
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao carregar pastas."
        });
      }
    };
    const onNodeSelect = (node) => {
      destinationPath.value = node.key;
    };
    const handleMove = async () => {
      if (!itemToMove.value || !destinationPath.value) return;
      moveLoading.value = true;
      try {
        const response = await $fetch("/api/admin/rename", {
          method: "POST",
          body: {
            oldname: `${props.currentFolder}/${itemToMove.value.name}`,
            newname: `${destinationPath.value}/${itemToMove.value.name}`
          }
        });
        toast.add({ severity: "success", summary: "Movido", life: 2e3 });
        moveDialogVisible.value = false;
        emit("refresh");
        if (props.currentFile && props.currentFile.endsWith(itemToMove.value.name)) {
          emit(
            "select",
            response?.newname || `${destinationPath.value}/${itemToMove.value.name}`
          );
        }
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: error.data?.message
        });
      } finally {
        moveLoading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Menu = script;
      const _component_Dialog = script$2;
      const _component_InputText = script$1;
      const _component_Button = script$5;
      const _component_Tree = script$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full bg-[#141b18] border-r border-white/5 w-full overflow-hidden" }, _attrs))} data-v-e88a586f><div class="p-3 border-b border-white/5 shrink-0 flex items-center justify-between bg-[#141b18] z-10" data-v-e88a586f><div class="flex items-center gap-1 overflow-hidden select-none" data-v-e88a586f><button class="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-[#6f942e] transition-colors shrink-0" title="Ir para a Raiz" data-v-e88a586f><i class="pi pi-home text-xs" data-v-e88a586f></i></button><div class="w-[1px] h-3 bg-white/10 mx-0.5 shrink-0" data-v-e88a586f></div><div class="flex items-center gap-1 text-xs font-mono text-slate-400 max-w-[120px]" data-v-e88a586f><span class="truncate"${ssrRenderAttr("title", __props.currentFolder)} data-v-e88a586f>${ssrInterpolate(__props.currentFolder.split("/").pop())}</span></div></div><div class="flex items-center gap-0.5" data-v-e88a586f><button${ssrIncludeBooleanAttr(
        !__props.currentFolder.includes("/") || __props.currentFolder === "content"
      ) ? " disabled" : ""} class="${ssrRenderClass([{
        "opacity-30 cursor-not-allowed": !__props.currentFolder.includes("/") || __props.currentFolder === "content"
      }, "p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"])}" title="Subir nível" data-v-e88a586f><i class="pi pi-arrow-up text-xs" data-v-e88a586f></i></button><div class="w-[1px] h-3 bg-white/10 mx-1" data-v-e88a586f></div><button class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Nova Página" data-v-e88a586f><i class="pi pi-file-plus text-xs" data-v-e88a586f></i></button><button class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Nova Pasta" data-v-e88a586f><i class="pi pi-folder-plus text-xs" data-v-e88a586f></i></button><button class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Nova Coleção" data-v-e88a586f><i class="pi pi-database text-xs" data-v-e88a586f></i></button><div class="w-[1px] h-3 bg-white/10 mx-1" data-v-e88a586f></div><button class="p-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Atualizar" data-v-e88a586f><i class="${ssrRenderClass([{ "pi-spin": isRefreshing.value }, "pi pi-refresh text-xs"])}" data-v-e88a586f></i></button></div></div><div class="flex-1 overflow-y-auto custom-scrollbar p-2" data-v-e88a586f>`);
      if (indexFile.value) {
        _push(`<div class="${ssrRenderClass([[
          isIndexActive.value ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-400"
        ], "group flex items-center justify-between p-2 mb-2 rounded border border-transparent cursor-pointer transition-all select-none"])}" data-v-e88a586f><div class="flex items-center gap-2 overflow-hidden" data-v-e88a586f><i class="${ssrRenderClass([__props.currentFolder === "content" ? "pi-home" : "pi-id-card", "pi"])}" style="${ssrRenderStyle({ color: isIndexActive.value ? "#6f942e" : "#64748b" })}" data-v-e88a586f></i><span class="${ssrRenderClass([{ "font-bold": isIndexActive.value }, "text-sm truncate"])}" data-v-e88a586f>${ssrInterpolate(indexLabel.value)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showDraggable.value) {
        _push(ssrRenderComponent(unref(VueDraggable), {
          modelValue: localFiles.value,
          "onUpdate:modelValue": ($event) => localFiles.value = $event,
          animation: 150,
          onEnd: onDragEnd,
          class: "flex flex-col gap-0.5",
          "ghost-class": "ghost-card",
          handle: ".drag-handle"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<!--[-->`);
              ssrRenderList(localFiles.value, (file) => {
                _push2(`<div class="${ssrRenderClass([[
                  __props.currentFile.includes(`${__props.currentFolder}/${file.name}`) || __props.currentFile.endsWith(`/${file.name}`) ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-300"
                ], "group flex items-center gap-2 p-2 rounded border border-transparent cursor-pointer select-none transition-all"])}" data-v-e88a586f${_scopeId}><i class="${ssrRenderClass([[
                  file.data?.isCollection ? "pi-database text-cyan-500" : file.isDirectory ? file.data?.isDir ? "pi-folder text-amber-500/80" : "pi-file-edit text-[#6f942e]" : "pi-file text-slate-600"
                ], "drag-handle pi text-sm cursor-pointer hover:scale-110 transition-transform"])}" data-v-e88a586f${_scopeId}></i><span class="drag-handle text-sm truncate flex-1" data-v-e88a586f${_scopeId}>${ssrInterpolate(file.name.replace(/\.(md|json|yml)$/, ""))}</span>`);
                if (file.isDirectory) {
                  _push2(`<i class="pi pi-chevron-right text-[10px] text-slate-600 opacity-50" data-v-e88a586f${_scopeId}></i>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]-->`);
            } else {
              return [
                (openBlock(true), createBlock(Fragment, null, renderList(localFiles.value, (file) => {
                  return openBlock(), createBlock("div", {
                    key: file.name,
                    onClick: ($event) => handleItemClick(file),
                    onContextmenu: withModifiers(($event) => toggleMenu($event, file), ["prevent"]),
                    class: ["group flex items-center gap-2 p-2 rounded border border-transparent cursor-pointer select-none transition-all", [
                      __props.currentFile.includes(`${__props.currentFolder}/${file.name}`) || __props.currentFile.endsWith(`/${file.name}`) ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-300"
                    ]]
                  }, [
                    createVNode("i", {
                      onClick: withModifiers(($event) => emit("navigate", file.name), ["stop"]),
                      class: ["drag-handle pi text-sm cursor-pointer hover:scale-110 transition-transform", [
                        file.data?.isCollection ? "pi-database text-cyan-500" : file.isDirectory ? file.data?.isDir ? "pi-folder text-amber-500/80" : "pi-file-edit text-[#6f942e]" : "pi-file text-slate-600"
                      ]]
                    }, null, 10, ["onClick"]),
                    createVNode("span", { class: "drag-handle text-sm truncate flex-1" }, toDisplayString(file.name.replace(/\.(md|json|yml)$/, "")), 1),
                    file.isDirectory ? (openBlock(), createBlock("i", {
                      key: 0,
                      class: "pi pi-chevron-right text-[10px] text-slate-600 opacity-50"
                    })) : createCommentVNode("", true)
                  ], 42, ["onClick", "onContextmenu"]);
                }), 128))
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (localFiles.value.length === 0 && !indexFile.value) {
        _push(`<div class="text-center py-10 opacity-30" data-v-e88a586f><p class="text-xs font-mono" data-v-e88a586f>Pasta vazia</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="p-2 border-t border-white/5 bg-black/20 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 font-bold select-none shrink-0" data-v-e88a586f><div class="pl-1" data-v-e88a586f>${ssrInterpolate(filteredFiles.value.length)} Itens</div><button class="${ssrRenderClass([
        showHiddenFiles.value ? "text-cyan-400 bg-cyan-400/5" : "hover:bg-white/5 hover:text-slate-300",
        "flex items-center gap-1.5 px-2 py-1 rounded transition-all"
      ])}" data-v-e88a586f><i class="${ssrRenderClass([showHiddenFiles.value ? "pi-eye" : "pi-eye-slash", "pi"])}" style="${ssrRenderStyle({ "font-size": "10px" })}" data-v-e88a586f></i><span data-v-e88a586f>Sistema</span></button></div>`);
      _push(ssrRenderComponent(_component_Menu, {
        ref_key: "contextMenu",
        ref: contextMenu,
        model: menuItems.value,
        popup: true
      }, null, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: renameDialogVisible.value,
        "onUpdate:visible": ($event) => renameDialogVisible.value = $event,
        modal: "",
        header: "Renomear Item",
        style: { width: "400px" },
        class: "p-fluid bg-[#141b18]"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2" data-v-e88a586f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "Cancelar",
              text: "",
              severity: "secondary",
              onClick: ($event) => renameDialogVisible.value = false,
              size: "small"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, {
              label: "Salvar",
              icon: "pi pi-check",
              onClick: confirmRename,
              loading: renameLoading.value,
              class: "bg-[#6f942e] border-none text-black font-bold"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                createVNode(_component_Button, {
                  label: "Cancelar",
                  text: "",
                  severity: "secondary",
                  onClick: ($event) => renameDialogVisible.value = false,
                  size: "small"
                }, null, 8, ["onClick"]),
                createVNode(_component_Button, {
                  label: "Salvar",
                  icon: "pi pi-check",
                  onClick: confirmRename,
                  loading: renameLoading.value,
                  class: "bg-[#6f942e] border-none text-black font-bold"
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-3 pt-2 pb-2" data-v-e88a586f${_scopeId}><label class="text-xs font-bold uppercase text-slate-500 block mb-1" data-v-e88a586f${_scopeId}>Novo Nome</label>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: newFileName.value,
              "onUpdate:modelValue": ($event) => newFileName.value = $event,
              class: "w-full text-lg p-3 font-semibold bg-[#0a0f0d] text-white border border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md",
              autofocus: "",
              onKeydown: confirmRename
            }, null, _parent2, _scopeId));
            _push2(`<div class="text-xs text-slate-500 flex items-center gap-2" data-v-e88a586f${_scopeId}><i class="pi pi-info-circle" data-v-e88a586f${_scopeId}></i> A extensão original será mantida. </div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-3 pt-2 pb-2" }, [
                createVNode("label", { class: "text-xs font-bold uppercase text-slate-500 block mb-1" }, "Novo Nome"),
                createVNode(_component_InputText, {
                  modelValue: newFileName.value,
                  "onUpdate:modelValue": ($event) => newFileName.value = $event,
                  class: "w-full text-lg p-3 font-semibold bg-[#0a0f0d] text-white border border-white/10 focus:border-[#6f942e] focus:ring-0 transition-all rounded-md",
                  autofocus: "",
                  onKeydown: withKeys(confirmRename, ["enter"])
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("div", { class: "text-xs text-slate-500 flex items-center gap-2" }, [
                  createVNode("i", { class: "pi pi-info-circle" }),
                  createTextVNode(" A extensão original será mantida. ")
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: moveDialogVisible.value,
        "onUpdate:visible": ($event) => moveDialogVisible.value = $event,
        modal: "",
        header: "Mover Para...",
        style: { width: "450px" },
        class: "p-0 bg-[#141b18]"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2 mt-4" data-v-e88a586f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "Cancelar",
              text: "",
              severity: "secondary",
              onClick: ($event) => moveDialogVisible.value = false,
              size: "small"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, {
              label: "Mover Aqui",
              icon: "pi pi-arrow-right",
              onClick: handleMove,
              loading: moveLoading.value,
              class: "bg-[#6f942e] border-none text-black font-bold",
              disabled: !destinationPath.value
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2 mt-4" }, [
                createVNode(_component_Button, {
                  label: "Cancelar",
                  text: "",
                  severity: "secondary",
                  onClick: ($event) => moveDialogVisible.value = false,
                  size: "small"
                }, null, 8, ["onClick"]),
                createVNode(_component_Button, {
                  label: "Mover Aqui",
                  icon: "pi pi-arrow-right",
                  onClick: handleMove,
                  loading: moveLoading.value,
                  class: "bg-[#6f942e] border-none text-black font-bold",
                  disabled: !destinationPath.value
                }, null, 8, ["loading", "disabled"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-4 p-1" data-v-e88a586f${_scopeId}><div class="bg-zinc-900/50 border border-white/10 rounded p-2 h-72 overflow-y-auto custom-scrollbar" data-v-e88a586f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Tree, {
              selectionKeys: selectedNodeKey.value,
              "onUpdate:selectionKeys": ($event) => selectedNodeKey.value = $event,
              expandedKeys: expandedNodeKeys.value,
              "onUpdate:expandedKeys": ($event) => expandedNodeKeys.value = $event,
              value: folderTree.value,
              selectionMode: "single",
              class: "w-full bg-transparent border-none p-0 text-sm custom-tree",
              onNodeSelect
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex flex-col gap-2 bg-black/20 p-2 rounded border border-white/5" data-v-e88a586f${_scopeId}><label class="text-[10px] text-zinc-500 uppercase font-bold tracking-wider" data-v-e88a586f${_scopeId}>Destino Selecionado</label><div class="text-xs font-mono text-[#6f942e] break-all" data-v-e88a586f${_scopeId}>${ssrInterpolate(destinationPath.value || "Selecione uma pasta acima")}</div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-4 p-1" }, [
                createVNode("div", { class: "bg-zinc-900/50 border border-white/10 rounded p-2 h-72 overflow-y-auto custom-scrollbar" }, [
                  createVNode(_component_Tree, {
                    selectionKeys: selectedNodeKey.value,
                    "onUpdate:selectionKeys": ($event) => selectedNodeKey.value = $event,
                    expandedKeys: expandedNodeKeys.value,
                    "onUpdate:expandedKeys": ($event) => expandedNodeKeys.value = $event,
                    value: folderTree.value,
                    selectionMode: "single",
                    class: "w-full bg-transparent border-none p-0 text-sm custom-tree",
                    onNodeSelect
                  }, null, 8, ["selectionKeys", "onUpdate:selectionKeys", "expandedKeys", "onUpdate:expandedKeys", "value"])
                ]),
                createVNode("div", { class: "flex flex-col gap-2 bg-black/20 p-2 rounded border border-white/5" }, [
                  createVNode("label", { class: "text-[10px] text-zinc-500 uppercase font-bold tracking-wider" }, "Destino Selecionado"),
                  createVNode("div", { class: "text-xs font-mono text-[#6f942e] break-all" }, toDisplayString(destinationPath.value || "Selecione uma pasta acima"), 1)
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: deleteDialogVisible.value,
        "onUpdate:visible": ($event) => deleteDialogVisible.value = $event,
        modal: "",
        header: "Confirmar Exclusão",
        style: { width: "350px" },
        class: "p-fluid bg-[#141b18]"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-end gap-2" data-v-e88a586f${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "Cancelar",
              text: "",
              severity: "secondary",
              onClick: ($event) => deleteDialogVisible.value = false,
              size: "small"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, {
              label: "Sim, Excluir",
              icon: "pi pi-trash",
              severity: "danger",
              onClick: handleDelete,
              loading: deleteLoading.value,
              size: "small"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-end gap-2" }, [
                createVNode(_component_Button, {
                  label: "Cancelar",
                  text: "",
                  severity: "secondary",
                  onClick: ($event) => deleteDialogVisible.value = false,
                  size: "small"
                }, null, 8, ["onClick"]),
                createVNode(_component_Button, {
                  label: "Sim, Excluir",
                  icon: "pi pi-trash",
                  severity: "danger",
                  onClick: handleDelete,
                  loading: deleteLoading.value,
                  size: "small"
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-4 pt-2" data-v-e88a586f${_scopeId}><div class="bg-red-500/10 border border-red-500/20 p-4 rounded-md flex items-start gap-3" data-v-e88a586f${_scopeId}><i class="pi pi-exclamation-triangle text-red-400 text-xl mt-0.5" data-v-e88a586f${_scopeId}></i><div data-v-e88a586f${_scopeId}><p class="text-sm text-slate-200 font-bold" data-v-e88a586f${_scopeId}>Você tem certeza?</p><p class="text-xs text-slate-400 mt-1" data-v-e88a586f${_scopeId}> O item <strong class="text-white" data-v-e88a586f${_scopeId}>${ssrInterpolate(itemToDelete.value?.name)}</strong> será excluído permanentemente. </p></div></div>`);
            if (itemToDelete.value?.isDirectory) {
              _push2(`<p class="text-xs text-center text-slate-500" data-v-e88a586f${_scopeId}> (Isso apagará todo o conteúdo da pasta) </p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-4 pt-2" }, [
                createVNode("div", { class: "bg-red-500/10 border border-red-500/20 p-4 rounded-md flex items-start gap-3" }, [
                  createVNode("i", { class: "pi pi-exclamation-triangle text-red-400 text-xl mt-0.5" }),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm text-slate-200 font-bold" }, "Você tem certeza?"),
                    createVNode("p", { class: "text-xs text-slate-400 mt-1" }, [
                      createTextVNode(" O item "),
                      createVNode("strong", { class: "text-white" }, toDisplayString(itemToDelete.value?.name), 1),
                      createTextVNode(" será excluído permanentemente. ")
                    ])
                  ])
                ]),
                itemToDelete.value?.isDirectory ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-xs text-center text-slate-500"
                }, " (Isso apagará todo o conteúdo da pasta) ")) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/FileManager.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const FileManager = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-e88a586f"]]);
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "CollectionFiles",
  __ssrInlineRender: true,
  props: {
    files: { type: Array, default: () => [] },
    currentFolder: { type: String, default: "" },
    siteContext: { type: String, default: "" }
  },
  emits: ["select", "create-item", "delete-item", "reorder-items", "refresh"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const localFiles = ref([]);
    const toast = useToast();
    const showSystemFiles = ref(false);
    const extraFiles = ref([]);
    const isLoadingSchemas = ref(false);
    const first = ref(0);
    ref(10);
    const displayedFiles = computed(() => {
      if (showSystemFiles.value) {
        return [...extraFiles.value].sort((a, b) => a.name.localeCompare(b.name));
      }
      return localFiles.value;
    });
    const isIndexFile = (file) => file.name.toLowerCase().startsWith("_index");
    watch(
      [() => props.files, showSystemFiles],
      ([newFiles, isSystem]) => {
        if (isSystem) return;
        const list = newFiles.filter((file) => {
          const name = file.name;
          if (name.startsWith(".")) return false;
          if (name === "_schemas") return false;
          if (name.startsWith("_") && !isIndexFile(file)) return false;
          return true;
        });
        list.sort((a, b) => {
          if (isIndexFile(a)) return -1;
          if (isIndexFile(b)) return 1;
          const titleA = (a.data?.title || a.name).toLowerCase();
          const titleB = (b.data?.title || b.name).toLowerCase();
          return titleA.localeCompare(titleB);
        });
        localFiles.value = list;
      },
      { immediate: true, deep: true }
    );
    const onRowReorder = (event) => {
      localFiles.value = event.value;
      const orderedNames = localFiles.value.map((f) => f.name);
      emit("reorder-items", { folder: props.currentFolder, files: orderedNames });
    };
    const confirmDelete = (event, item) => {
      event.stopPropagation();
      const itemName = item.data?.title || item.name;
      if (confirm(`Tem certeza que deseja excluir "${itemName}"? 
Esta ação não poderá ser desfeita.`)) {
        handleDelete(item);
      }
    };
    const handleDelete = async (item) => {
      try {
        await $fetch("/api/admin/storage", {
          method: "DELETE",
          body: { folder: props.currentFolder, file: item.name }
        });
        toast.add({ severity: "success", summary: "Excluído", life: 1e3 });
        emit("refresh");
      } catch (e) {
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao excluir.",
          life: 1e3
        });
      }
    };
    const onRowSelect = (event) => {
      emit("select", event.data);
    };
    watch(
      () => props.currentFolder,
      () => {
        first.value = 0;
        extraFiles.value = [];
        showSystemFiles.value = false;
      }
    );
    watch(showSystemFiles, async (isActive) => {
      if (!isActive) {
        extraFiles.value = [];
        return;
      }
      const schemaFolder = props.files.find((f) => f.name === "_schemas" && f.isDirectory);
      if (schemaFolder) {
        isLoadingSchemas.value = true;
        try {
          const schemaPath = props.currentFolder ? `${props.currentFolder}/_schemas` : "_schemas";
          const data = await $fetch("/api/admin/storage", {
            query: { folder: schemaPath, site: props.siteContext }
          });
          if (data.files) {
            extraFiles.value = data.files.map((f) => ({
              ...f,
              isSchema: true,
              path: f.path || `${schemaPath}/${f.name}`
            }));
          }
        } catch (e) {
          console.error("Erro ao carregar modelos", e);
          toast.add({ severity: "error", summary: "Erro", detail: "Falha ao carregar modelos." });
        } finally {
          isLoadingSchemas.value = false;
        }
      }
    });
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      try {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      } catch (e) {
        return dateString;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_DataTable = script$4;
      const _component_Column = script$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full bg-[#0a0f0d]" }, _attrs))} data-v-8b23c843><div class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0f0d]" data-v-8b23c843><div class="flex flex-col" data-v-8b23c843><h2 class="text-xl font-bold text-slate-200 tracking-tight capitalize flex items-center gap-2" data-v-8b23c843><i class="${ssrRenderClass([showSystemFiles.value ? "pi-cog text-cyan-500" : "pi-database text-[#6f942e]", "pi"])}" data-v-8b23c843></i>`);
      if (!showSystemFiles.value) {
        _push(`<span data-v-8b23c843>${ssrInterpolate(__props.currentFolder.split("/").pop()?.replace(/-/g, " "))}</span>`);
      } else {
        _push(`<span class="text-cyan-500" data-v-8b23c843>Modelos (_schemas)</span>`);
      }
      _push(`</h2></div><div class="flex items-center gap-3" data-v-8b23c843>`);
      if (isLoadingSchemas.value) {
        _push(`<span class="text-[10px] text-slate-500 italic flex items-center gap-1" data-v-8b23c843><i class="pi pi-spin pi-spinner" data-v-8b23c843></i></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center bg-black/40 border border-white/10 rounded-md overflow-hidden shrink-0 h-[32px] shadow-lg backdrop-blur-sm" data-v-8b23c843><button class="${ssrRenderClass([[showSystemFiles.value ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"], "flex items-center gap-2 px-3 h-full font-black text-[10px] uppercase tracking-wider transition-all border-r border-white/5"])}" data-v-8b23c843><i class="pi pi-cog text-[11px]" data-v-8b23c843></i><span data-v-8b23c843>${ssrInterpolate(showSystemFiles.value ? "Ver Conteúdo" : "Modelos")}</span></button>`);
      if (!showSystemFiles.value) {
        _push(`<button class="flex items-center gap-2 px-4 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-wider transition-all" data-v-8b23c843><i class="pi pi-plus text-[10px]" data-v-8b23c843></i><span data-v-8b23c843>Novo Item</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="flex-1 overflow-hidden relative" data-v-8b23c843>`);
      _push(ssrRenderComponent(_component_DataTable, {
        value: displayedFiles.value,
        reorderableRows: !showSystemFiles.value,
        onRowReorder,
        selectionMode: "single",
        metaKeySelection: false,
        onRowSelect,
        dataKey: "name",
        class: "text-sm h-full flex flex-col",
        scrollable: "",
        scrollHeight: "flex",
        paginator: "",
        rows: 10,
        first: first.value,
        "onUpdate:first": ($event) => first.value = $event,
        rowsPerPageOptions: [10, 20, 50],
        paginatorTemplate: "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown",
        currentPageReportTemplate: "{first} a {last} de {totalRecords}",
        pt: {
          root: { class: "bg-transparent flex flex-col h-full" },
          headerRow: { class: "text-slate-500 text-[10px] uppercase tracking-widest font-black border-b border-white/5" },
          bodyRow: ({ context }) => ({
            class: [
              "transition-colors border-b border-white/5 text-slate-300",
              context.selected ? "bg-white/10 text-white" : "hover:bg-white/5 cursor-pointer"
            ]
          }),
          paginator: {
            root: { class: "bg-black/20 border-t border-white/10 p-2" },
            current: { class: "text-[10px] text-slate-500 uppercase font-bold ml-auto" },
            pages: { class: "flex gap-1" },
            pageButton: ({ context }) => ({
              class: [
                "w-7 h-7 rounded text-[10px] transition-all font-bold",
                context.active ? "bg-white text-black" : "text-slate-500 hover:bg-white/10 hover:text-white"
              ]
            }),
            prevPageButton: { class: "text-slate-500 hover:text-white" },
            nextPageButton: { class: "text-slate-500 hover:text-white" },
            firstPageButton: { class: "text-slate-500 hover:text-white" },
            lastPageButton: { class: "text-slate-500 hover:text-white" },
            rowsPerPageDropdown: { class: "bg-transparent border-white/10 text-slate-400 text-[10px]" }
          }
        }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!showSystemFiles.value) {
              _push2(ssrRenderComponent(_component_Column, {
                rowReorder: "",
                headerStyle: "width: 3rem"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(_component_Column, {
              header: "Título",
              class: "font-medium",
              sortable: "",
              field: "data.title"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex flex-col py-2.5" data-v-8b23c843${_scopeId2}><div class="flex items-center gap-2" data-v-8b23c843${_scopeId2}><span class="${ssrRenderClass([[isIndexFile(data) ? "text-white font-black" : "text-slate-300 font-medium"], "text-[13px] tracking-tight"])}" data-v-8b23c843${_scopeId2}>${ssrInterpolate(data.data?.title || data.name.replace(/-/g, " "))}</span>`);
                  if (isIndexFile(data)) {
                    _push3(`<span class="text-[8px] border border-white/20 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-black bg-white/10" data-v-8b23c843${_scopeId2}> Capa </span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  if (data.isSchema) {
                    _push3(`<span class="text-[8px] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-bold bg-white/5" data-v-8b23c843${_scopeId2}> Modelo </span>`);
                  } else {
                    _push3(`<!---->`);
                  }
                  _push3(`</div><span class="text-[10px] text-slate-600 font-mono mt-0.5" data-v-8b23c843${_scopeId2}>${ssrInterpolate(data.name)}</span></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex flex-col py-2.5" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("span", {
                          class: ["text-[13px] tracking-tight", [isIndexFile(data) ? "text-white font-black" : "text-slate-300 font-medium"]]
                        }, toDisplayString(data.data?.title || data.name.replace(/-/g, " ")), 3),
                        isIndexFile(data) ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-[8px] border border-white/20 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-black bg-white/10"
                        }, " Capa ")) : createCommentVNode("", true),
                        data.isSchema ? (openBlock(), createBlock("span", {
                          key: 1,
                          class: "text-[8px] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-bold bg-white/5"
                        }, " Modelo ")) : createCommentVNode("", true)
                      ]),
                      createVNode("span", { class: "text-[10px] text-slate-600 font-mono mt-0.5" }, toDisplayString(data.name), 1)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              header: "Data",
              style: { "width": "8rem" },
              sortable: "",
              field: "data.date"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span class="text-slate-500 text-[11px] font-mono" data-v-8b23c843${_scopeId2}>${ssrInterpolate(formatDate(data.data?.date))}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-slate-500 text-[11px] font-mono" }, toDisplayString(formatDate(data.data?.date)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              header: "Status",
              style: { "width": "7rem" },
              field: "data.draft"
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (data.data?.draft === true) {
                    _push3(`<span class="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5" data-v-8b23c843${_scopeId2}><span class="w-1 h-1 rounded-full bg-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.5)]" data-v-8b23c843${_scopeId2}></span> Rascunho </span>`);
                  } else if (data.isSchema) {
                    _push3(`<span class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5" data-v-8b23c843${_scopeId2}><i class="pi pi-cog text-[10px]" data-v-8b23c843${_scopeId2}></i> Config </span>`);
                  } else {
                    _push3(`<span class="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5" data-v-8b23c843${_scopeId2}><span class="w-1 h-1 rounded-full bg-white/20" data-v-8b23c843${_scopeId2}></span> Publicado </span>`);
                  }
                } else {
                  return [
                    data.data?.draft === true ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"
                    }, [
                      createVNode("span", { class: "w-1 h-1 rounded-full bg-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.5)]" }),
                      createTextVNode(" Rascunho ")
                    ])) : data.isSchema ? (openBlock(), createBlock("span", {
                      key: 1,
                      class: "text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
                    }, [
                      createVNode("i", { class: "pi pi-cog text-[10px]" }),
                      createTextVNode(" Config ")
                    ])) : (openBlock(), createBlock("span", {
                      key: 2,
                      class: "text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5"
                    }, [
                      createVNode("span", { class: "w-1 h-1 rounded-full bg-white/20" }),
                      createTextVNode(" Publicado ")
                    ]))
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              header: "",
              style: { "width": "4rem" }
            }, {
              body: withCtx(({ data }, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex justify-center" data-v-8b23c843${_scopeId2}><button class="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-white hover:bg-red-500/20 transition-all" title="Excluir item" data-v-8b23c843${_scopeId2}><i class="pi pi-trash text-[12px]" data-v-8b23c843${_scopeId2}></i></button></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex justify-center" }, [
                      createVNode("button", {
                        onClick: ($event) => confirmDelete($event, data),
                        class: "w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-white hover:bg-red-500/20 transition-all",
                        title: "Excluir item"
                      }, [
                        createVNode("i", { class: "pi pi-trash text-[12px]" })
                      ], 8, ["onClick"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              !showSystemFiles.value ? (openBlock(), createBlock(_component_Column, {
                key: 0,
                rowReorder: "",
                headerStyle: "width: 3rem"
              })) : createCommentVNode("", true),
              createVNode(_component_Column, {
                header: "Título",
                class: "font-medium",
                sortable: "",
                field: "data.title"
              }, {
                body: withCtx(({ data }) => [
                  createVNode("div", { class: "flex flex-col py-2.5" }, [
                    createVNode("div", { class: "flex items-center gap-2" }, [
                      createVNode("span", {
                        class: ["text-[13px] tracking-tight", [isIndexFile(data) ? "text-white font-black" : "text-slate-300 font-medium"]]
                      }, toDisplayString(data.data?.title || data.name.replace(/-/g, " ")), 3),
                      isIndexFile(data) ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-[8px] border border-white/20 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-black bg-white/10"
                      }, " Capa ")) : createCommentVNode("", true),
                      data.isSchema ? (openBlock(), createBlock("span", {
                        key: 1,
                        class: "text-[8px] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter font-bold bg-white/5"
                      }, " Modelo ")) : createCommentVNode("", true)
                    ]),
                    createVNode("span", { class: "text-[10px] text-slate-600 font-mono mt-0.5" }, toDisplayString(data.name), 1)
                  ])
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                header: "Data",
                style: { "width": "8rem" },
                sortable: "",
                field: "data.date"
              }, {
                body: withCtx(({ data }) => [
                  createVNode("span", { class: "text-slate-500 text-[11px] font-mono" }, toDisplayString(formatDate(data.data?.date)), 1)
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                header: "Status",
                style: { "width": "7rem" },
                field: "data.draft"
              }, {
                body: withCtx(({ data }) => [
                  data.data?.draft === true ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"
                  }, [
                    createVNode("span", { class: "w-1 h-1 rounded-full bg-amber-600 shadow-[0_0_5px_rgba(217,119,6,0.5)]" }),
                    createTextVNode(" Rascunho ")
                  ])) : data.isSchema ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
                  }, [
                    createVNode("i", { class: "pi pi-cog text-[10px]" }),
                    createTextVNode(" Config ")
                  ])) : (openBlock(), createBlock("span", {
                    key: 2,
                    class: "text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5"
                  }, [
                    createVNode("span", { class: "w-1 h-1 rounded-full bg-white/20" }),
                    createTextVNode(" Publicado ")
                  ]))
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                header: "",
                style: { "width": "4rem" }
              }, {
                body: withCtx(({ data }) => [
                  createVNode("div", { class: "flex justify-center" }, [
                    createVNode("button", {
                      onClick: ($event) => confirmDelete($event, data),
                      class: "w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:text-white hover:bg-red-500/20 transition-all",
                      title: "Excluir item"
                    }, [
                      createVNode("i", { class: "pi pi-trash text-[12px]" })
                    ], 8, ["onClick"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (displayedFiles.value.length === 0) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none" data-v-8b23c843><i class="pi pi-clone text-4xl mb-2" data-v-8b23c843></i><p data-v-8b23c843>${ssrInterpolate(showSystemFiles.value ? "Nenhum modelo encontrado" : "Coleção vazia")}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/CollectionFiles.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const CollectionFiles = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$8, [["__scopeId", "data-v-8b23c843"]]), { __name: "CollectionFiles" });
const _sfc_main$7 = {
  __name: "MetaEditor",
  __ssrInlineRender: true,
  props: {
    fields: { type: Array, default: () => [] },
    frontmatter: { type: Object, default: () => ({}) },
    siteContext: { type: String, required: true },
    currentFolder: { type: String, required: true },
    isCollapsed: { type: Boolean, default: false }
  },
  emits: ["open-image", "toggle-collapse", "update-schema"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const collapsedFields = ref({});
    const localSchemaOptions = ref([]);
    watch(() => props.fields, (newFields) => {
      if (newFields) {
        const initialState = { ...collapsedFields.value };
        newFields.forEach((field) => {
          if (initialState[field.key] === void 0) initialState[field.key] = true;
        });
        collapsedFields.value = initialState;
      }
    }, { immediate: true });
    const fetchLocalSchemas = async () => {
      if (!props.siteContext) return;
      localSchemaOptions.value = [];
      let found = false;
      let foldersToSearch = [];
      if (props.frontmatter.schema && props.frontmatter.schema.includes("/")) {
        const currentSchemaPath = props.frontmatter.schema;
        const parentFolder = currentSchemaPath.substring(0, currentSchemaPath.lastIndexOf("/"));
        foldersToSearch.push(parentFolder);
      }
      let tempPath = props.currentFolder;
      while (tempPath) {
        foldersToSearch.push(`${tempPath}/_schemas`);
        if (tempPath === "content" || tempPath === "") break;
        if (!tempPath.includes("/")) break;
        tempPath = tempPath.substring(0, tempPath.lastIndexOf("/"));
      }
      foldersToSearch = [...new Set(foldersToSearch)];
      for (const folder of foldersToSearch) {
        try {
          const cleanFolder = folder.replace(/\/+/g, "/");
          const data = await $fetch("/api/admin/storage", {
            params: { site: props.siteContext, folder: cleanFolder }
          });
          const validFiles = (data.files || []).filter((f) => !f.isDirectory && f.name.endsWith(".json"));
          if (validFiles.length > 0) {
            localSchemaOptions.value = validFiles.map((f) => ({
              label: f.name.replace(".json", "").toUpperCase(),
              value: `${cleanFolder}/${f.name}`.replace(/\/+/g, "/")
            }));
            found = true;
            const currentSchemaIsValid = localSchemaOptions.value.some((opt) => opt.value === props.frontmatter.schema);
            if (!props.frontmatter.schema || !currentSchemaIsValid) {
              const defaultSchemaOption = localSchemaOptions.value.find((opt) => opt.value.endsWith("/default.json"));
              if (defaultSchemaOption) {
                emit("update-schema", defaultSchemaOption.value);
              }
            }
            break;
          }
        } catch (e) {
        }
      }
      if (!found) {
        localSchemaOptions.value = [{ label: "DEFAULT", value: "default" }];
      }
    };
    watch(() => [props.currentFolder, props.frontmatter.schema], fetchLocalSchemas, { immediate: true });
    const getFieldSummary = (field) => {
      const val = props.frontmatter[field.key];
      if (!val) return "Vazio";
      if (Array.isArray(val)) return `${val.length} itens`;
      if (field.type === "image") return "Imagem definida";
      if (typeof val === "string") return val.length > 25 ? val.substring(0, 25) + "..." : val;
      return "Preenchido";
    };
    const getImageUrl = (path) => {
      if (!path) return "";
      const cleanPath = path.replace(/^\/images/, "");
      return `/assets/${props.currentFolder.replace("content/", "")}/${encodeURIComponent(cleanPath)}`;
    };
    const removeRepeaterItem = (fieldKey, index) => {
      if (confirm("Remover este item?")) props.frontmatter[fieldKey].splice(index, 1);
    };
    const removeSimpleListItem = (fieldKey, index) => {
      props.frontmatter[fieldKey].splice(index, 1);
    };
    const removeImageFromList = (list, index) => {
      if (list && list.splice) list.splice(index, 1);
    };
    const requestImage = (targetObj, key) => emit("open-image", { mode: "set", obj: targetObj, key });
    const requestImageList = (targetArray) => emit("open-image", { mode: "push", list: targetArray });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = script$5;
      const _directive_tooltip = Tooltip;
      let _temp0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full w-full overflow-hidden" }, _attrs))}><div class="${ssrRenderClass([__props.isCollapsed ? "justify-center px-0" : "justify-between px-4", "h-12 border-b border-white/5 shrink-0 flex items-center bg-[#141b18] transition-all duration-300"])}"><div class="flex items-center gap-2 overflow-hidden" style="${ssrRenderStyle(!__props.isCollapsed ? null : { display: "none" })}"><i class="pi pi-sliders-h text-[#6f942e] text-sm shrink-0"></i><span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 truncate">Propriedades</span></div><button class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-colors shrink-0"${ssrRenderAttr("title", __props.isCollapsed ? "Abrir Painel" : "Recolher Painel")}><i class="${ssrRenderClass([__props.isCollapsed ? "pi-angle-left" : "pi-angle-right", "pi transition-transform duration-300"])}"></i></button></div><div class="flex-1 overflow-y-auto p-4 space-y-3 pb-20 custom-scrollbar" style="${ssrRenderStyle(!__props.isCollapsed ? null : { display: "none" })}">`);
      if (__props.fields.length === 0) {
        _push(`<div class="bg-yellow-500/10 p-4 rounded-sm border border-yellow-500/20 text-yellow-500 text-xs"><i class="pi pi-exclamation-triangle mr-2"></i> Nenhum modelo detectado. Editando modo raw. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.fields, (field) => {
        _push(`<div class="bg-[#141b18] rounded-[0.5vw] border border-white/5 overflow-hidden transition-all duration-300"><div class="${ssrRenderClass([{ "border-b border-white/5": !collapsedFields.value[field.key] }, "p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 select-none"])}"><div class="flex items-center gap-3"><i class="${ssrRenderClass([{ "-rotate-90": collapsedFields.value[field.key] }, "pi pi-chevron-down text-[10px] text-[#6f942e] transition-transform duration-300"])}"></i><div><label class="text-[10px] font-black text-[#6f942e] uppercase tracking-[0.2em] cursor-pointer">${ssrInterpolate(field.label)}</label>`);
        if (collapsedFields.value[field.key]) {
          _push(`<div class="text-[9px] text-slate-500 font-mono mt-1">Result: <span class="text-slate-300">${ssrInterpolate(getFieldSummary(field))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (field.description && !collapsedFields.value[field.key]) {
          _push(`<i${ssrRenderAttrs(_temp0 = mergeProps({ class: "pi pi-info-circle text-[10px] text-slate-600" }, ssrGetDirectiveProps(_ctx, _directive_tooltip, field.description, void 0, { top: true })))}>${"textContent" in _temp0 ? ssrInterpolate(_temp0.textContent) : _temp0.innerHTML ?? ""}</i>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="p-5 pt-4 bg-[#0a0f0d]/30" style="${ssrRenderStyle(!collapsedFields.value[field.key] ? null : { display: "none" })}">`);
        if (field.key === "schema") {
          _push(`<div><select class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors appearance-none cursor-pointer"><!--[-->`);
          ssrRenderList(localSchemaOptions.value, (opt) => {
            _push(`<option${ssrRenderAttr("value", opt.value)}${ssrIncludeBooleanAttr(Array.isArray(__props.frontmatter[field.key]) ? ssrLooseContain(__props.frontmatter[field.key], opt.value) : ssrLooseEqual(__props.frontmatter[field.key], opt.value)) ? " selected" : ""}>${ssrInterpolate(opt.label)}</option>`);
          });
          _push(`<!--]--></select><div class="text-[9px] text-slate-500 mt-1 italic break-all px-1">Path: ${ssrInterpolate(__props.frontmatter[field.key])}</div></div>`);
        } else if (field.type === "text") {
          _push(`<input${ssrRenderAttr("value", __props.frontmatter[field.key])}${ssrRenderAttr("placeholder", field.placeholder)} class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors">`);
        } else if (field.type === "textarea") {
          _push(`<textarea rows="3" class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 text-sm text-white focus:border-[#6f942e] outline-none transition-colors resize-none">${ssrInterpolate(__props.frontmatter[field.key])}</textarea>`);
        } else if (field.type === "image") {
          _push(`<div class="flex gap-2 items-stretch"><div class="relative flex-1"><input${ssrRenderAttr("value", __props.frontmatter[field.key])} class="w-full bg-[#0a0f0d] border border-white/10 rounded-sm px-3 py-2 pl-8 text-sm text-white focus:border-[#6f942e] outline-none"><i class="pi pi-image absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i></div>`);
          _push(ssrRenderComponent(_component_Button, {
            icon: "pi pi-folder-open",
            severity: "secondary",
            onClick: ($event) => requestImage(__props.frontmatter, field.key),
            class: "p-button-sm"
          }, null, _parent));
          if (__props.frontmatter[field.key]) {
            _push(`<div class="w-10 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"><img${ssrRenderAttr("src", getImageUrl(__props.frontmatter[field.key]))} class="w-full h-full object-cover"></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (field.type === "image_list") {
          _push(`<div class="bg-black/20 p-4 rounded-sm border border-white/5 mt-2">`);
          if (!__props.frontmatter[field.key]) {
            _push(`<div>${ssrInterpolate(__props.frontmatter[field.key] = [])}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.frontmatter[field.key]?.length > 0) {
            _push(ssrRenderComponent(unref(draggable), {
              modelValue: __props.frontmatter[field.key],
              "onUpdate:modelValue": ($event) => __props.frontmatter[field.key] = $event,
              "item-key": (element) => element,
              class: "grid grid-cols-3 gap-3 mb-3",
              "ghost-class": "ghost-image"
            }, {
              item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="relative group aspect-square bg-black rounded-sm overflow-hidden border border-white/10 cursor-move hover:border-[#6f942e]/50 transition-all"${_scopeId}><img${ssrRenderAttr("src", getImageUrl(element.replace("/images", "")))} class="w-full h-full object-cover pointer-events-none"${_scopeId}><div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Button, {
                    icon: "pi pi-trash",
                    rounded: "",
                    text: "",
                    severity: "danger",
                    size: "small",
                    onClick: ($event) => removeImageFromList(__props.frontmatter[field.key], index)
                  }, null, _parent2, _scopeId));
                  _push2(`</div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "relative group aspect-square bg-black rounded-sm overflow-hidden border border-white/10 cursor-move hover:border-[#6f942e]/50 transition-all" }, [
                      createVNode("img", {
                        src: getImageUrl(element.replace("/images", "")),
                        class: "w-full h-full object-cover pointer-events-none"
                      }, null, 8, ["src"]),
                      createVNode("div", { class: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" }, [
                        createVNode(_component_Button, {
                          icon: "pi pi-trash",
                          rounded: "",
                          text: "",
                          severity: "danger",
                          size: "small",
                          onClick: ($event) => removeImageFromList(__props.frontmatter[field.key], index)
                        }, null, 8, ["onClick"])
                      ])
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<div class="text-center py-4 text-[10px] text-slate-600 italic">Galeria vazia</div>`);
          }
          _push(ssrRenderComponent(_component_Button, {
            label: "Adicionar Imagens",
            icon: "pi pi-plus",
            size: "small",
            outlined: "",
            class: "w-full text-[10px] border-dashed border-[#6f942e]/30 text-[#6f942e]",
            onClick: ($event) => requestImageList(__props.frontmatter[field.key])
          }, null, _parent));
          _push(`</div>`);
        } else if (field.type === "simple_list") {
          _push(`<div class="mt-2">`);
          if (!__props.frontmatter[field.key]) {
            _push(`<div>${ssrInterpolate(__props.frontmatter[field.key] = [])}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(unref(draggable), {
            modelValue: __props.frontmatter[field.key],
            "onUpdate:modelValue": ($event) => __props.frontmatter[field.key] = $event,
            "item-key": "_uuid",
            handle: ".drag-handle",
            class: "space-y-2"
          }, {
            item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center gap-2 group"${_scopeId}><i class="pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white"${_scopeId}></i><input${ssrRenderAttr("value", element.text)} class="w-full bg-[#0a0f0d] border-b border-white/10 px-2 py-1 text-sm text-white focus:border-[#6f942e] outline-none transition-colors" placeholder="Item..."${_scopeId}><button class="text-slate-700 hover:text-red-500 transition-colors p-1"${_scopeId}><i class="pi pi-trash text-xs"${_scopeId}></i></button></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center gap-2 group" }, [
                    createVNode("i", { class: "pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white" }),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => element.text = $event,
                      class: "w-full bg-[#0a0f0d] border-b border-white/10 px-2 py-1 text-sm text-white focus:border-[#6f942e] outline-none transition-colors",
                      placeholder: "Item..."
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, element.text]
                    ]),
                    createVNode("button", {
                      onClick: ($event) => removeSimpleListItem(field.key, index),
                      class: "text-slate-700 hover:text-red-500 transition-colors p-1"
                    }, [
                      createVNode("i", { class: "pi pi-trash text-xs" })
                    ], 8, ["onClick"])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="w-full py-2 mt-3 border border-dashed border-[#6f942e]/30 rounded-sm text-[10px] font-bold text-[#6f942e] hover:bg-[#6f942e]/10 uppercase tracking-widest transition-all">+ Adicionar Item</button></div>`);
        } else if (field.type === "repeater") {
          _push(`<div class="mt-2">`);
          _push(ssrRenderComponent(unref(draggable), {
            modelValue: __props.frontmatter[field.key],
            "onUpdate:modelValue": ($event) => __props.frontmatter[field.key] = $event,
            "item-key": "_uuid",
            handle: ".drag-handle",
            class: "space-y-3"
          }, {
            item: withCtx(({ element, index }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="bg-black/20 p-4 rounded-sm border border-white/5 relative group"${_scopeId}><div class="flex justify-between items-center mb-3 border-b border-white/5 pb-2"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><i class="pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white"${_scopeId}></i><span class="text-[9px] font-bold text-slate-500 uppercase"${_scopeId}>${ssrInterpolate(field.itemLabel || "Item")} ${ssrInterpolate(index + 1)}</span></div><button class="text-slate-700 hover:text-red-500 transition-colors"${_scopeId}><i class="pi pi-trash text-xs"${_scopeId}></i></button></div><div class="space-y-3"${_scopeId}><!--[-->`);
                ssrRenderList(field.schema, (subField) => {
                  _push2(`<div${_scopeId}><label class="text-[8px] text-slate-500 uppercase font-bold block mb-1"${_scopeId}>${ssrInterpolate(subField.label)}</label>`);
                  if (subField.type === "text") {
                    _push2(`<input${ssrRenderAttr("value", element[subField.key])} class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]"${_scopeId}>`);
                  } else if (subField.type === "textarea") {
                    _push2(`<textarea rows="2" class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e] resize-none"${_scopeId}>${ssrInterpolate(element[subField.key])}</textarea>`);
                  } else if (subField.type === "image") {
                    _push2(`<div class="flex gap-2 items-stretch"${_scopeId}><div class="relative flex-1"${_scopeId}><input${ssrRenderAttr("value", element[subField.key])} class="w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]"${_scopeId}></div>`);
                    _push2(ssrRenderComponent(_component_Button, {
                      icon: "pi pi-search",
                      size: "small",
                      text: "",
                      rounded: "",
                      severity: "secondary",
                      onClick: ($event) => requestImage(element, subField.key)
                    }, null, _parent2, _scopeId));
                    if (element[subField.key]) {
                      _push2(`<div class="w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"${_scopeId}><img${ssrRenderAttr("src", getImageUrl(element[subField.key]))} class="w-full h-full object-cover"${_scopeId}></div>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                });
                _push2(`<!--]--></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "bg-black/20 p-4 rounded-sm border border-white/5 relative group" }, [
                    createVNode("div", { class: "flex justify-between items-center mb-3 border-b border-white/5 pb-2" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("i", { class: "pi pi-bars drag-handle cursor-grab text-slate-600 hover:text-white" }),
                        createVNode("span", { class: "text-[9px] font-bold text-slate-500 uppercase" }, toDisplayString(field.itemLabel || "Item") + " " + toDisplayString(index + 1), 1)
                      ]),
                      createVNode("button", {
                        onClick: ($event) => removeRepeaterItem(field.key, index),
                        class: "text-slate-700 hover:text-red-500 transition-colors"
                      }, [
                        createVNode("i", { class: "pi pi-trash text-xs" })
                      ], 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "space-y-3" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(field.schema, (subField) => {
                        return openBlock(), createBlock("div", {
                          key: subField.key
                        }, [
                          createVNode("label", { class: "text-[8px] text-slate-500 uppercase font-bold block mb-1" }, toDisplayString(subField.label), 1),
                          subField.type === "text" ? withDirectives((openBlock(), createBlock("input", {
                            key: 0,
                            "onUpdate:modelValue": ($event) => element[subField.key] = $event,
                            class: "w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]"
                          }, null, 8, ["onUpdate:modelValue"])), [
                            [vModelText, element[subField.key]]
                          ]) : subField.type === "textarea" ? withDirectives((openBlock(), createBlock("textarea", {
                            key: 1,
                            "onUpdate:modelValue": ($event) => element[subField.key] = $event,
                            rows: "2",
                            class: "w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e] resize-none"
                          }, null, 8, ["onUpdate:modelValue"])), [
                            [vModelText, element[subField.key]]
                          ]) : subField.type === "image" ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: "flex gap-2 items-stretch"
                          }, [
                            createVNode("div", { class: "relative flex-1" }, [
                              withDirectives(createVNode("input", {
                                "onUpdate:modelValue": ($event) => element[subField.key] = $event,
                                class: "w-full bg-transparent border-b border-white/10 text-sm py-1 outline-none focus:border-[#6f942e]"
                              }, null, 8, ["onUpdate:modelValue"]), [
                                [vModelText, element[subField.key]]
                              ])
                            ]),
                            createVNode(_component_Button, {
                              icon: "pi pi-search",
                              size: "small",
                              text: "",
                              rounded: "",
                              severity: "secondary",
                              onClick: ($event) => requestImage(element, subField.key)
                            }, null, 8, ["onClick"]),
                            element[subField.key] ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "w-8 shrink-0 aspect-square bg-black rounded-sm border border-white/20 overflow-hidden relative"
                            }, [
                              createVNode("img", {
                                src: getImageUrl(element[subField.key]),
                                class: "w-full h-full object-cover"
                              }, null, 8, ["src"])
                            ])) : createCommentVNode("", true)
                          ])) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="w-full py-3 mt-4 border-2 border-dashed border-[#6f942e]/20 rounded-sm text-[10px] font-bold text-[#6f942e] hover:bg-[#6f942e]/10 uppercase tracking-widest transition-all">+ Adicionar ${ssrInterpolate(field.itemLabel || "Item")}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/MetaEditor.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const defaultSettings = {
  fontSize: 14,
  fontFamily: "'Fira Code', 'Consolas', monospace",
  lineHeight: 1.5,
  tabSize: 2,
  wordWrap: true,
  theme: "one-dark"
};
const useEditorSettings = () => {
  const siteContext = useCookie("cms_site_context");
  const state = useState("sirius_editor_settings", () => reactive({ ...defaultSettings }));
  const isLoading = useState("sirius_editor_loading", () => false);
  const editorStyles = computed(() => ({
    fontSize: `${state.value.fontSize}px`,
    fontFamily: state.value.fontFamily,
    lineHeight: state.value.lineHeight
  }));
  const loadSettings = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const data = await $fetch("/api/admin/storage", {
        params: {
          site: siteContext.value,
          folder: ".",
          file: "_config.json"
        }
      });
      if (data && data.content) {
        const config = JSON.parse(data.content);
        if (config.editor) {
          Object.assign(state.value, { ...defaultSettings, ...config.editor });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do editor:", error);
    } finally {
      isLoading.value = false;
    }
  };
  const updateSetting = async (key, value) => {
    state.value[key] = value;
    try {
      const currentFile = await $fetch("/api/admin/storage", {
        params: { site: siteContext.value, folder: ".", file: "_config.json" }
      });
      let fullConfig = {};
      if (currentFile && currentFile.content) {
        try {
          fullConfig = JSON.parse(currentFile.content);
        } catch (e) {
        }
      }
      fullConfig.editor = { ...state.value };
      await $fetch("/api/admin/storage", {
        method: "POST",
        body: {
          site: siteContext.value,
          folder: ".",
          file: "_config.json",
          content: JSON.stringify(fullConfig, null, 2)
          // Pretty print
        }
      });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  };
  return {
    settings: state,
    editorStyles,
    loadSettings,
    updateSetting
  };
};
const _sfc_main$6 = {
  __name: "MarkdownEditor",
  __ssrInlineRender: true,
  props: {
    content: { type: String, default: "" },
    currentFolder: { type: String, default: "" },
    currentFile: { type: String, default: "" },
    isRawMode: { type: Boolean, default: false },
    siteContext: { type: String, default: "default" }
  },
  emits: ["update:content", "open-image", "toggle-raw"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const { settings, editorStyles } = useEditorSettings();
    const editorView = shallowRef(null);
    const isDragging = ref(false);
    const isUploading = ref(false);
    const localContent = computed({
      get() {
        return props.content;
      },
      set(newValue) {
        emit("update:content", newValue);
      }
    });
    const stats = computed(() => {
      const text = localContent.value || "";
      return {
        chars: text.length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split("\n").length
      };
    });
    const extensions = computed(() => {
      const isJson = props.currentFile.toLowerCase().endsWith(".json");
      const plugins = [
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          paste: handlePaste,
          drop: handleDrop,
          dragover: () => {
            isDragging.value = true;
          },
          dragleave: () => {
            isDragging.value = false;
          }
        })
      ];
      if (isJson) plugins.push(json$1());
      else plugins.push(markdown());
      if (settings.value.theme === "one-dark") plugins.push(oneDark);
      if (settings.value.tabSize) plugins.push(EditorState.tabSize.of(settings.value.tabSize));
      return plugins;
    });
    const handleReady = (payload) => {
      editorView.value = payload.view;
    };
    const insertFormat = (prefix, suffix = "", placeholder = "texto") => {
      const view = editorView.value;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.sliceDoc(from, to);
      const textToInsert = selectedText || placeholder;
      const insertion = `${prefix}${textToInsert}${suffix}`;
      view.dispatch({
        changes: { from, to, insert: insertion },
        selection: { anchor: from + prefix.length, head: from + prefix.length + textToInsert.length },
        scrollIntoView: true
      });
      view.focus();
    };
    const toggleLinePrefix = (prefix) => {
      const view = editorView.value;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      const lineStart = view.state.doc.lineAt(from);
      const lineEnd = view.state.doc.lineAt(to);
      const changes = [];
      for (let i = lineStart.number; i <= lineEnd.number; i++) {
        const line = view.state.doc.line(i);
        const lineText = line.text;
        if (lineText.startsWith(prefix)) {
          changes.push({ from: line.from, to: line.from + prefix.length, insert: "" });
        } else {
          changes.push({ from: line.from, to: line.from, insert: prefix });
        }
      }
      view.dispatch({ changes, scrollIntoView: true });
      view.focus();
    };
    const insertBlock = (template) => {
      const view = editorView.value;
      if (!view) return;
      const { from } = view.state.selection.main;
      const line = view.state.doc.lineAt(from);
      const prefix = from > line.from ? "\n\n" : "";
      const insertion = prefix + template;
      view.dispatch({
        changes: { from, insert: insertion },
        selection: { anchor: from + insertion.length },
        scrollIntoView: true
      });
      view.focus();
    };
    const insertAtCursor = (text) => {
      const view = editorView.value;
      if (!view) return;
      const transaction = view.state.replaceSelection(text);
      view.dispatch(transaction);
      view.focus();
    };
    __expose({ insertAtCursor });
    const uploadImage = async (file) => {
      if (!file.type.startsWith("image/")) {
        toast.add({ severity: "warn", summary: "Apenas imagens", life: 2e3 });
        return;
      }
      isUploading.value = true;
      isDragging.value = false;
      try {
        const formData = new FormData();
        formData.append("file", file);
        let targetFolder = props.currentFolder;
        if (!targetFolder || targetFolder === ".") targetFolder = "content";
        const response = await $fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
          params: {
            site: props.siteContext,
            folder: props.currentFile.replace(/\/[^\/]*$/, "")
          }
        });
        if (response && response.path) {
          insertAtCursor(`![${file.name}](${response.path})`);
          toast.add({ severity: "success", summary: "Imagem enviada", life: 2e3 });
        }
      } catch (e) {
        console.error(e);
        toast.add({ severity: "error", summary: "Erro no upload" });
      } finally {
        isUploading.value = false;
      }
    };
    function handleDrop(event) {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        uploadImage(files[0]);
      }
      isDragging.value = false;
    }
    function handlePaste(event) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          event.preventDefault();
          uploadImage(item.getAsFile());
          return;
        }
      }
    }
    const actions = computed(() => [
      { icon: "pi pi-bold", title: "Negrito (Ctrl+B)", action: () => insertFormat("**", "**") },
      { icon: "pi pi-italic", title: "Itálico (Ctrl+I)", action: () => insertFormat("*", "*") },
      { separator: true },
      { label: "H1", title: "Título 1", action: () => toggleLinePrefix("# ") },
      { label: "H2", title: "Título 2", action: () => toggleLinePrefix("## ") },
      { label: "H3", title: "Título 3", action: () => toggleLinePrefix("### ") },
      { separator: true },
      { icon: "pi pi-list", title: "Lista com Marcadores", action: () => toggleLinePrefix("- ") },
      { icon: "pi pi-check-square", title: "Lista de Tarefas", action: () => toggleLinePrefix("- [ ] ") },
      { icon: "pi pi-align-right", title: "Citação", action: () => toggleLinePrefix("> ") },
      { separator: true },
      { icon: "pi pi-link", title: "Link", action: () => insertFormat("[", "](url)") },
      { icon: "pi pi-code", title: "Bloco de Código", action: () => insertFormat("```\n", "\n```", "code") },
      { icon: "pi pi-table", title: "Inserir Tabela", action: () => insertBlock("| Col 1 | Col 2 |\n|---|---|\n| A | B |") },
      { icon: "pi pi-minus", title: "Linha Horizontal", action: () => insertBlock("---\n") },
      { separator: true },
      { icon: "pi pi-image", title: "Inserir Imagem", action: () => emit("open-image") },
      { separator: true },
      {
        icon: "pi pi-file-edit",
        title: "Ver Fonte Completo (Raw)",
        action: () => emit("toggle-raw"),
        isActive: props.isRawMode
        // Agora é apenas um booleano reativo!
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full w-full bg-[#0a0f0d] relative group border-r border-white/5" }, _attrs))}><div class="flex items-center gap-1 p-2 bg-[#141b18] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0 select-none z-10"><!--[-->`);
      ssrRenderList(actions.value, (btn, idx) => {
        _push(`<!--[-->`);
        if (btn.separator) {
          _push(`<div class="w-[1px] h-5 bg-white/10 mx-1 shrink-0"></div>`);
        } else {
          _push(`<button${ssrRenderAttr("title", btn.title)} type="button" class="${ssrRenderClass([[
            btn.isActive ? "bg-[#6f942e]/20 text-[#6f942e]" : "hover:bg-white/10 text-slate-400 hover:text-white"
          ], "flex items-center justify-center min-w-[28px] h-[28px] px-2 rounded transition-colors focus:outline-none shrink-0"])}">`);
          if (btn.icon) {
            _push(`<i class="${ssrRenderClass([btn.icon, "text-[14px]"])}"></i>`);
          } else {
            _push(`<!---->`);
          }
          if (btn.label) {
            _push(`<span class="text-[12px] font-bold font-mono">${ssrInterpolate(btn.label)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div><div class="flex-1 relative overflow-hidden bg-[#0a0f0d] min-h-0 group/editor">`);
      if (isDragging.value) {
        _push(`<div class="absolute inset-0 bg-[#6f942e]/10 border-2 border-dashed border-[#6f942e] z-30 flex items-center justify-center pointer-events-none backdrop-blur-sm transition-all duration-200"><div class="bg-[#141b18] px-6 py-3 rounded-full border border-[#6f942e] text-[#6f942e] font-bold shadow-xl flex items-center gap-3"><i class="pi pi-cloud-upload text-xl animate-bounce"></i> SOLTE A IMAGEM AQUI </div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isUploading.value) {
        _push(`<div class="absolute inset-0 bg-black/50 z-40 flex items-center justify-center backdrop-blur-sm transition-all duration-200"><div class="flex flex-col items-center gap-3"><i class="pi pi-spin pi-spinner text-4xl text-[#6f942e]"></i><span class="text-white font-mono text-sm tracking-widest">ENVIANDO IMAGEM...</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="h-full w-full" style="${ssrRenderStyle(unref(editorStyles))}">`);
      _push(ssrRenderComponent(unref(T), {
        modelValue: localContent.value,
        "onUpdate:modelValue": ($event) => localContent.value = $event,
        extensions: extensions.value,
        autofocus: true,
        "indent-with-tab": true,
        placeholder: "Comece a escrever sua história...",
        style: { height: "100%", width: "100%" },
        onReady: handleReady
      }, null, _parent));
      _push(`</div></div><footer class="h-6 bg-[#141b18] border-t border-white/5 flex items-center justify-end px-4 gap-4 text-[10px] text-slate-500 font-mono select-none shrink-0"><div class="flex items-center gap-1"><span class="text-slate-300 font-bold">${ssrInterpolate(stats.value.lines)}</span> <span class="text-slate-600">LINHAS</span></div><div class="flex items-center gap-1"><span class="text-slate-300 font-bold">${ssrInterpolate(stats.value.words)}</span> <span class="text-slate-600">PALAVRAS</span></div><div class="flex items-center gap-1"><span class="text-slate-300 font-bold">${ssrInterpolate(stats.value.chars)}</span> <span class="text-slate-600">CARACTERES</span></div></footer></div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/MarkdownEditor.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h$1(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
function useAsyncData(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (_isAutoKeyNeeded(args[0], args[1])) {
    args.unshift(autoKey);
  }
  let [_key, _handler, options = {}] = args;
  const key = computed(() => toValue(_key));
  if (typeof key.value !== "string") {
    throw new TypeError("[nuxt] [useAsyncData] key must be a string.");
  }
  if (typeof _handler !== "function") {
    throw new TypeError("[nuxt] [useAsyncData] handler must be a function.");
  }
  const nuxtApp = useNuxtApp();
  options.server ??= true;
  options.default ??= getDefault;
  options.getCachedData ??= getDefaultCachedData;
  options.lazy ??= false;
  options.immediate ??= true;
  options.deep ??= asyncDataDefaults.deep;
  options.dedupe ??= "cancel";
  options._functionName || "useAsyncData";
  nuxtApp._asyncData[key.value];
  function createInitialFetch() {
    const initialFetchOptions = { cause: "initial", dedupe: options.dedupe };
    if (!nuxtApp._asyncData[key.value]?._init) {
      initialFetchOptions.cachedData = options.getCachedData(key.value, nuxtApp, { cause: "initial" });
      nuxtApp._asyncData[key.value] = createAsyncData(nuxtApp, key.value, _handler, options, initialFetchOptions.cachedData);
    }
    return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
  }
  const initialFetch = createInitialFetch();
  const asyncData = nuxtApp._asyncData[key.value];
  asyncData._deps++;
  const fetchOnServer = options.server !== false && nuxtApp.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxtApp.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncReturn = {
    data: writableComputedRef(() => nuxtApp._asyncData[key.value]?.data),
    pending: writableComputedRef(() => nuxtApp._asyncData[key.value]?.pending),
    status: writableComputedRef(() => nuxtApp._asyncData[key.value]?.status),
    error: writableComputedRef(() => nuxtApp._asyncData[key.value]?.error),
    refresh: (...args2) => {
      if (!nuxtApp._asyncData[key.value]?._init) {
        const initialFetch2 = createInitialFetch();
        return initialFetch2();
      }
      return nuxtApp._asyncData[key.value].execute(...args2);
    },
    execute: (...args2) => asyncReturn.refresh(...args2),
    clear: () => {
      const entry = nuxtApp._asyncData[key.value];
      if (entry?._abortController) {
        try {
          entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
        } finally {
          entry._abortController = void 0;
        }
      }
      clearNuxtDataByKey(nuxtApp, key.value);
    }
  };
  const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
  Object.assign(asyncDataPromise, asyncReturn);
  return asyncDataPromise;
}
function writableComputedRef(getter) {
  return computed({
    get() {
      return getter()?.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) {
        ref2.value = value;
      }
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") {
    return false;
  }
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) {
    return false;
  }
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") {
    return false;
  }
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = void 0;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
    nuxtApp._asyncData[key].error.value = void 0;
    nuxtApp._asyncData[key].status.value = "idle";
  }
  if (key in nuxtApp._asyncDataPromises) {
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function createAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  nuxtApp.payload._errors[key] ??= void 0;
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData !== void 0;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) {
      await asyncData.execute({ cause: "refresh:hook" });
    }
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: computed(() => asyncData.status.value === "pending"),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (...args) => {
      const [_opts, newValue = void 0] = args;
      const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
      if (nuxtApp._asyncDataPromises[key]) {
        if ((opts.dedupe ?? options.dedupe) === "defer") {
          return nuxtApp._asyncDataPromises[key];
        }
      }
      {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: opts.cause ?? "refresh:manual" });
        if (cachedData !== void 0) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = void 0;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      if (asyncData._abortController) {
        asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
      }
      asyncData._abortController = new AbortController();
      asyncData.status.value = "pending";
      const cleanupController = new AbortController();
      const promise = new Promise(
        (resolve, reject) => {
          try {
            const timeout = opts.timeout ?? options.timeout;
            const mergedSignal = mergeAbortSignals([asyncData._abortController?.signal, opts?.signal], cleanupController.signal, timeout);
            if (mergedSignal.aborted) {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
              return;
            }
            mergedSignal.addEventListener("abort", () => {
              const reason = mergedSignal.reason;
              reject(reason instanceof Error ? reason : new DOMException(String(reason ?? "Aborted"), "AbortError"));
            }, { once: true, signal: cleanupController.signal });
            return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
          } catch (err) {
            reject(err);
          }
        }
      ).then(async (_result) => {
        let result = _result;
        if (options.transform) {
          result = await options.transform(_result);
        }
        if (options.pick) {
          result = pick(result, options.pick);
        }
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = void 0;
        asyncData.status.value = "success";
      }).catch((error) => {
        if (nuxtApp._asyncDataPromises[key] && nuxtApp._asyncDataPromises[key] !== promise) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (asyncData._abortController?.signal.aborted) {
          return nuxtApp._asyncDataPromises[key];
        }
        if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
          asyncData.status.value = "idle";
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        cleanupController.abort();
        delete nuxtApp._asyncDataPromises[key];
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      unsubRefreshAsyncData();
      if (nuxtApp._asyncData[key]?._init) {
        nuxtApp._asyncData[key]._init = false;
      }
      if (!hasCustomGetCachedData) {
        nextTick(() => {
          if (!nuxtApp._asyncData[key]?._init) {
            clearNuxtDataByKey(nuxtApp, key);
            asyncData.execute = () => Promise.resolve();
          }
        });
      }
    }
  };
  return asyncData;
}
const getDefault = () => void 0;
const getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) {
    return nuxtApp.payload.data[key];
  }
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") {
    return nuxtApp.static.data[key];
  }
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
  const list = signals.filter((s) => !!s);
  if (typeof timeout === "number" && timeout >= 0) {
    const timeoutSignal = AbortSignal.timeout?.(timeout);
    if (timeoutSignal) {
      list.push(timeoutSignal);
    }
  }
  if (AbortSignal.any) {
    return AbortSignal.any(list);
  }
  const controller = new AbortController();
  for (const sig of list) {
    if (sig.aborted) {
      const reason = sig.reason ?? new DOMException("Aborted", "AbortError");
      try {
        controller.abort(reason);
      } catch {
        controller.abort();
      }
      return controller.signal;
    }
  }
  const onAbort = () => {
    const abortedSignal = list.find((s) => s.aborted);
    const reason = abortedSignal?.reason ?? new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
  };
  for (const sig of list) {
    sig.addEventListener?.("abort", onAbort, { once: true, signal: cleanupSignal });
  }
  return controller.signal;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _request = computed(() => toValue(request));
  const key = computed(() => toValue(opts.key) || "$f" + hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]));
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch: watchSources,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    getCachedData,
    deep,
    dedupe,
    timeout,
    watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
  };
  const asyncData = useAsyncData(watchSources === false ? key.value : key, (_, { signal }) => {
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal, ..._fetchOptions });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  const segments = [
    toValue(opts.method)?.toUpperCase() || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) {
      segments.push(hash(value));
    } else if (value instanceof ArrayBuffer) {
      segments.push(hash(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    } else if (value instanceof FormData) {
      const obj = {};
      for (const entry of value.entries()) {
        const [key, val] = entry;
        obj[key] = val instanceof File ? val.name : val;
      }
      segments.push(hash(obj));
    } else if (isPlainObject(value)) {
      segments.push(hash(reactive(value)));
    } else {
      try {
        segments.push(hash(value));
      } catch {
        console.warn("[useFetch] Failed to hash body", value);
      }
    }
  }
  return segments;
}
const _sfc_main$5 = {
  __name: "ImageExplorer",
  __ssrInlineRender: true,
  props: {
    initialFolder: { type: String, default: "content" }
  },
  emits: ["select", "close"],
  async setup(__props, { emit: __emit }) {
    let __temp, __restore;
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const siteContext = useCookie("cms_site_context");
    const viewMode = useCookie("cms_media_view_mode", { default: () => "grid" });
    const folder = ref(props.initialFolder);
    const loadingAction = ref(false);
    const showRename = ref(false);
    const renameValue = ref("");
    const itemToRename = ref(null);
    const showMove = ref(false);
    const itemToMove = ref(null);
    const showZoom = ref(false);
    const zoomedFileIndex = ref(0);
    const isDragging = ref(false);
    const isUploading = ref(false);
    const hiddenFileInput = ref(null);
    const { data: files, refresh, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/storage",
      {
        query: { folder },
        // No Nuxt 3+, passar a ref diretamente torna a query reativa!
        transform: (input) => input.files || []
      },
      "$JS0GzTIRc6"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const filteredFiles = computed(() => {
      if (!files.value || !Array.isArray(files.value)) return [];
      const validExtensions = [".avif", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp"];
      return files.value.filter((f) => {
        if (f.isDirectory) return true;
        if (f.name === "_index.md" || f.name === "index.md" || f.name === ".DS_Store") return false;
        const lowerName = f.name.toLowerCase();
        return validExtensions.some((ext) => lowerName.endsWith(ext));
      });
    });
    const imageFiles = computed(() => {
      return filteredFiles.value.filter((f) => !f.isDirectory);
    });
    const subDirectories = computed(() => {
      return files.value ? files.value.filter((f) => f.isDirectory && f.name !== itemToMove.value?.name) : [];
    });
    const currentZoomedFile = computed(() => {
      if (!imageFiles.value.length) return null;
      return imageFiles.value[zoomedFileIndex.value];
    });
    computed(() => {
      const cleanPath = folder.value.replace(/^\/|\/$/g, "");
      if (!cleanPath) return [];
      const parts = cleanPath.split("/");
      let currentAccumulator = "";
      return parts.map((part) => {
        currentAccumulator = currentAccumulator ? `${currentAccumulator}/${part}` : part;
        return { name: part, path: currentAccumulator };
      });
    });
    const getPublicUrl = (fileName) => {
      const cleanFolder = folder.value.replace(/^content\/?/, "");
      return `/assets/${cleanFolder}/${fileName}`.replace(/\/+/g, "/");
    };
    const selectImage = (name) => {
      const cleanName = folder.value === props.initialFolder ? name : getPublicUrl(name);
      emit("select", cleanName);
      toast.add({ severity: "success", summary: "Imagem Selecionada", life: 1e3 });
    };
    const openZoom = (file) => {
      const index = imageFiles.value.findIndex((f) => f.name === file.name);
      if (index !== -1) {
        zoomedFileIndex.value = index;
        showZoom.value = true;
      }
    };
    const nextImage = () => {
      if (zoomedFileIndex.value < imageFiles.value.length - 1) zoomedFileIndex.value++;
      else zoomedFileIndex.value = 0;
    };
    const prevImage = () => {
      if (zoomedFileIndex.value > 0) zoomedFileIndex.value--;
      else zoomedFileIndex.value = imageFiles.value.length - 1;
    };
    const confirmCreateFolder = async () => {
      const name = prompt("Nome da nova pasta:");
      if (!name) return;
      const safeName = name.trim().replace(/\s+/g, "-").toLowerCase();
      try {
        await $fetch("/api/admin/mkdir", {
          method: "POST",
          body: { site: siteContext.value, folder: folder.value, name: safeName }
        });
        refresh();
        toast.add({ severity: "success", summary: "Pasta criada", life: 2e3 });
      } catch (err) {
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar pasta." });
      }
    };
    const triggerManualUpload = () => {
      hiddenFileInput.value?.click();
    };
    const deleteItem = async (fileName, isDir) => {
      if (!confirm(`Tem certeza que deseja apagar ${fileName}?`)) return;
      try {
        await $fetch("/api/admin/storage", {
          method: "DELETE",
          body: { site: siteContext.value, folder: folder.value, file: fileName }
        });
        refresh();
        toast.add({ severity: "warn", summary: "Item excluído", life: 2e3 });
      } catch (e) {
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao excluir item." });
      }
    };
    const openRenameModal = (file) => {
      itemToRename.value = file;
      renameValue.value = file.name;
      showRename.value = true;
    };
    const handleRename = async () => {
      if (!renameValue.value || renameValue.value === itemToRename.value.name) return;
      loadingAction.value = true;
      try {
        await $fetch("/api/admin/rename", {
          method: "POST",
          body: { oldname: `${folder.value}/${itemToRename.value.name}`, newname: `${folder.value}/${renameValue.value}` }
        });
        showRename.value = false;
        toast.add({ severity: "success", summary: "Renomeado!", life: 2e3 });
        refresh();
      } catch (error) {
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao renomear." });
      } finally {
        loadingAction.value = false;
      }
    };
    const handleMove = async (destinationSubFolder) => {
      const fileName = itemToMove.value.name;
      const oldPathFull = `${folder.value}/${fileName}`;
      let newPathFull = "";
      if (destinationSubFolder === "..") {
        const parts = folder.value.split("/");
        parts.pop();
        const parentPath = parts.join("/");
        newPathFull = parentPath ? `${parentPath}/${fileName}` : fileName;
      } else {
        newPathFull = `${folder.value}/${destinationSubFolder}/${fileName}`;
      }
      try {
        await $fetch("/api/admin/rename", {
          method: "POST",
          body: { oldname: oldPathFull, newname: newPathFull }
        });
        showMove.value = false;
        toast.add({ severity: "success", summary: "Movido!", life: 2e3 });
        refresh();
      } catch (error) {
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao mover." });
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Toast = script$8;
      const _component_Button = script$5;
      const _component_Dialog = script$2;
      const _component_InputText = script$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "image-explorer-component flex flex-col gap-0 bg-[#0a0c0b] text-slate-200 h-full w-full" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Toast, {
        baseZIndex: 1e4,
        position: "top-right",
        life: 2e3
      }, null, _parent));
      _push(`<header class="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/5 bg-[#141b18]"><div class="flex items-center gap-3 overflow-hidden flex-1 mr-4"></div><div class="flex items-center gap-3 shrink-0"><div class="flex items-center bg-black/30 rounded border border-white/5 p-0.5">`);
      _push(ssrRenderComponent(_component_Button, {
        icon: "pi pi-th-large",
        text: "",
        rounded: "",
        size: "small",
        class: ["!w-7 !h-7", unref(viewMode) === "grid" ? "text-[#6f942e] bg-white/5" : "text-slate-500 hover:text-white"],
        onClick: ($event) => viewMode.value = "grid"
      }, null, _parent));
      _push(ssrRenderComponent(_component_Button, {
        icon: "pi pi-list",
        text: "",
        rounded: "",
        size: "small",
        class: ["!w-7 !h-7", unref(viewMode) === "list" ? "text-[#6f942e] bg-white/5" : "text-slate-500 hover:text-white"],
        onClick: ($event) => viewMode.value = "list"
      }, null, _parent));
      _push(`</div><div class="w-px h-6 bg-white/10 mx-1"></div>`);
      _push(ssrRenderComponent(_component_Button, {
        icon: "pi pi-folder-plus",
        text: "",
        rounded: "",
        class: "text-slate-400 hover:text-white !w-8 !h-8",
        onClick: confirmCreateFolder
      }, null, _parent));
      _push(`<div class="relative overflow-hidden group">`);
      _push(ssrRenderComponent(_component_Button, {
        label: "UPLOAD",
        icon: "pi pi-cloud-upload",
        size: "small",
        onClick: triggerManualUpload,
        class: "p-button-sm custom-upload-btn bg-white/5 text-[#6f942e] border-white/10 font-black tracking-widest hover:bg-[#6f942e]/20 hover:border-[#6f942e]/50 transition-colors"
      }, null, _parent));
      _push(`<input type="file" accept="image/*" multiple class="hidden"></div><div class="w-px h-6 bg-white/10 mx-1"></div>`);
      _push(ssrRenderComponent(_component_Button, {
        icon: "pi pi-times",
        text: "",
        rounded: "",
        size: "small",
        onClick: ($event) => _ctx.$emit("close"),
        class: "text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-colors !w-8 !h-8"
      }, null, _parent));
      _push(`</div></header><section class="flex-1 overflow-y-auto custom-scrollbar p-4 content-start relative">`);
      if (unref(pending)) {
        _push(`<div class="absolute inset-0 z-40 bg-[#0a0c0b]/80 flex flex-col items-center justify-center"><i class="pi pi-spin pi-spinner text-3xl text-[#6f942e] mb-2"></i><span class="text-[10px] uppercase tracking-widest text-slate-500">Carregando...</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isDragging.value) {
        _push(`<div class="absolute inset-0 z-50 bg-[#6f942e]/10 border-2 border-dashed border-[#6f942e] flex items-center justify-center backdrop-blur-sm m-2 rounded-xl pointer-events-none"><div class="bg-[#141b18] px-6 py-3 rounded-full border border-[#6f942e] text-[#6f942e] font-bold shadow-xl flex items-center gap-3 animate-bounce"><i class="pi pi-cloud-upload text-xl"></i> SOLTE ARQUIVOS AQUI </div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isUploading.value) {
        _push(`<div class="absolute inset-0 z-50 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm"><i class="pi pi-spin pi-spinner text-5xl text-[#6f942e] mb-4"></i><span class="text-white font-mono text-sm tracking-widest animate-pulse">ENVIANDO...</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(pending) && unref(viewMode) === "grid") {
        _push(`<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"><!--[-->`);
        ssrRenderList(filteredFiles.value, (file) => {
          _push(`<div class="bg-[#1a1d1c] p-2 rounded-xl border border-white/5 hover:border-[#6f942e] transition-all group relative overflow-hidden h-40 cursor-pointer"><div class="w-full h-full overflow-hidden rounded-lg bg-[#0a0c0b] flex items-center justify-center relative">`);
          if (file.isDirectory) {
            _push(`<div class="flex flex-col items-center justify-center w-full h-full hover:bg-white/5 transition-colors"><i class="pi pi-folder text-5xl text-amber-600 mb-2"></i><span class="text-[10px] text-amber-600/70 font-bold uppercase tracking-widest truncate w-full text-center px-2">${ssrInterpolate(file.name)}</span></div>`);
          } else {
            _push(`<img${ssrRenderAttr("src", getPublicUrl(file.name))} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">`);
          }
          _push(`</div><div class="absolute inset-0 bg-[#0f1110]/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300 gap-2">`);
          if (!file.isDirectory) {
            _push(`<div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_Button, {
              icon: "pi pi-eye",
              severity: "secondary",
              rounded: "",
              size: "small",
              class: "!w-8 !h-8 !p-0",
              onClick: ($event) => openZoom(file)
            }, null, _parent));
            _push(ssrRenderComponent(_component_Button, {
              icon: "pi pi-check",
              severity: "success",
              rounded: "",
              size: "small",
              class: "!w-8 !h-8 !p-0",
              onClick: ($event) => selectImage(file.name)
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex gap-2 mt-1">`);
          _push(ssrRenderComponent(_component_Button, {
            icon: "pi pi-pencil",
            severity: "warning",
            text: "",
            rounded: "",
            size: "small",
            class: "!w-7 !h-7 !p-0",
            onClick: ($event) => openRenameModal(file)
          }, null, _parent));
          _push(ssrRenderComponent(_component_Button, {
            icon: "pi pi-trash",
            severity: "danger",
            text: "",
            rounded: "",
            size: "small",
            class: "!w-7 !h-7 !p-0",
            onClick: ($event) => deleteItem(file.name, file.isDirectory)
          }, null, _parent));
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (!unref(pending)) {
        _push(`<div class="flex flex-col gap-2"><!--[-->`);
        ssrRenderList(filteredFiles.value, (file) => {
          _push(`<div class="flex items-center justify-between p-2 bg-[#1a1d1c] rounded-xl border border-white/5 hover:border-[#6f942e] hover:bg-white/5 transition-all group cursor-pointer"><div class="flex items-center gap-4 flex-1 min-w-0"><div class="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex items-center justify-center">`);
          if (file.isDirectory) {
            _push(`<i class="pi pi-folder text-xl text-amber-500"></i>`);
          } else {
            _push(`<img${ssrRenderAttr("src", getPublicUrl(file.name))} class="w-full h-full object-cover" loading="lazy">`);
          }
          _push(`</div><div class="flex flex-col truncate"><span class="text-sm font-bold text-slate-200 truncate group-hover:text-[#6f942e] transition-colors">${ssrInterpolate(file.name)}</span></div></div><div class="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">`);
          if (!file.isDirectory) {
            _push(`<!--[-->`);
            _push(ssrRenderComponent(_component_Button, {
              icon: "pi pi-eye",
              severity: "secondary",
              text: "",
              rounded: "",
              class: "!w-8 !h-8",
              onClick: ($event) => openZoom(file)
            }, null, _parent));
            _push(ssrRenderComponent(_component_Button, {
              icon: "pi pi-check",
              severity: "success",
              text: "",
              rounded: "",
              class: "!w-8 !h-8",
              onClick: ($event) => selectImage(file.name)
            }, null, _parent));
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(ssrRenderComponent(_component_Button, {
            icon: "pi pi-trash",
            severity: "danger",
            text: "",
            rounded: "",
            class: "!w-8 !h-8",
            onClick: ($event) => deleteItem(file.name, file.isDirectory)
          }, null, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(pending) && filteredFiles.value && filteredFiles.value.length === 0) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none"><i class="pi pi-folder-open text-6xl mb-4 text-slate-600"></i><p class="text-sm uppercase tracking-widest text-slate-500 font-bold">Pasta Vazia</p><p class="text-[10px] text-slate-600 mt-2">Arraste imagens para cá</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showZoom.value,
        "onUpdate:visible": ($event) => showZoom.value = $event,
        modal: "",
        dismissableMask: true,
        showHeader: false,
        style: { width: "100vw", height: "100vh", margin: 0 },
        class: "bg-transparent",
        contentStyle: { padding: 0 }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (currentZoomedFile.value) {
              _push2(`<div class="relative flex flex-col items-center justify-center bg-[#020302]/95 backdrop-blur-md w-full h-full p-4 overflow-hidden select-none"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Button, {
                icon: "pi pi-times",
                text: "",
                rounded: "",
                class: "!absolute top-4 right-4 text-white/60 hover:text-white z-50 !w-12 !h-12 !text-xl",
                onClick: ($event) => showZoom.value = false
              }, null, _parent2, _scopeId));
              _push2(`<div class="flex items-center justify-between w-full gap-4 h-full relative max-w-7xl mx-auto"${_scopeId}><div class="h-full flex items-center px-4 cursor-pointer"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Button, {
                icon: "pi pi-chevron-left",
                text: "",
                rounded: "",
                class: "text-white/40 !w-16 !h-16 !text-4xl"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="relative flex-1 flex flex-col items-center justify-center h-full w-full"${_scopeId}><img${ssrRenderAttr("src", getPublicUrl(currentZoomedFile.value.name))} class="max-h-[80vh] max-w-full object-contain shadow-2xl rounded-sm"${_scopeId}><div class="absolute bottom-6 flex gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Button, {
                label: "Inserir",
                icon: "pi pi-check",
                class: "bg-[#6f942e] border-none text-black font-bold",
                onClick: ($event) => {
                  selectImage(currentZoomedFile.value.name);
                  showZoom.value = false;
                }
              }, null, _parent2, _scopeId));
              _push2(`</div></div><div class="h-full flex items-center px-4 cursor-pointer"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Button, {
                icon: "pi pi-chevron-right",
                text: "",
                rounded: "",
                class: "text-white/40 !w-16 !h-16 !text-4xl"
              }, null, _parent2, _scopeId));
              _push2(`</div></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              currentZoomedFile.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "relative flex flex-col items-center justify-center bg-[#020302]/95 backdrop-blur-md w-full h-full p-4 overflow-hidden select-none"
              }, [
                createVNode(_component_Button, {
                  icon: "pi pi-times",
                  text: "",
                  rounded: "",
                  class: "!absolute top-4 right-4 text-white/60 hover:text-white z-50 !w-12 !h-12 !text-xl",
                  onClick: ($event) => showZoom.value = false
                }, null, 8, ["onClick"]),
                createVNode("div", { class: "flex items-center justify-between w-full gap-4 h-full relative max-w-7xl mx-auto" }, [
                  createVNode("div", {
                    class: "h-full flex items-center px-4 cursor-pointer",
                    onClick: prevImage
                  }, [
                    createVNode(_component_Button, {
                      icon: "pi pi-chevron-left",
                      text: "",
                      rounded: "",
                      class: "text-white/40 !w-16 !h-16 !text-4xl"
                    })
                  ]),
                  createVNode("div", { class: "relative flex-1 flex flex-col items-center justify-center h-full w-full" }, [
                    createVNode("img", {
                      src: getPublicUrl(currentZoomedFile.value.name),
                      class: "max-h-[80vh] max-w-full object-contain shadow-2xl rounded-sm"
                    }, null, 8, ["src"]),
                    createVNode("div", { class: "absolute bottom-6 flex gap-2" }, [
                      createVNode(_component_Button, {
                        label: "Inserir",
                        icon: "pi pi-check",
                        class: "bg-[#6f942e] border-none text-black font-bold",
                        onClick: ($event) => {
                          selectImage(currentZoomedFile.value.name);
                          showZoom.value = false;
                        }
                      }, null, 8, ["onClick"])
                    ])
                  ]),
                  createVNode("div", {
                    class: "h-full flex items-center px-4 cursor-pointer",
                    onClick: nextImage
                  }, [
                    createVNode(_component_Button, {
                      icon: "pi pi-chevron-right",
                      text: "",
                      rounded: "",
                      class: "text-white/40 !w-16 !h-16 !text-4xl"
                    })
                  ])
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showRename.value,
        "onUpdate:visible": ($event) => showRename.value = $event,
        modal: "",
        header: "Renomear",
        style: { width: "350px" },
        class: "bg-[#141b18]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-4 pt-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: renameValue.value,
              "onUpdate:modelValue": ($event) => renameValue.value = $event,
              class: "w-full bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]",
              autofocus: "",
              onKeyup: handleRename
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, {
              label: "Salvar",
              onClick: handleRename,
              loading: loadingAction.value,
              class: "bg-[#6f942e] border-none text-black font-bold w-full"
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-4 pt-2" }, [
                createVNode(_component_InputText, {
                  modelValue: renameValue.value,
                  "onUpdate:modelValue": ($event) => renameValue.value = $event,
                  class: "w-full bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e]",
                  autofocus: "",
                  onKeyup: withKeys(handleRename, ["enter"])
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_Button, {
                  label: "Salvar",
                  onClick: handleRename,
                  loading: loadingAction.value,
                  class: "bg-[#6f942e] border-none text-black font-bold w-full"
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showMove.value,
        "onUpdate:visible": ($event) => showMove.value = $event,
        modal: "",
        header: "Mover Para",
        style: { width: "350px" },
        class: "bg-[#141b18]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pt-2"${_scopeId}>`);
            if (folder.value !== "content") {
              _push2(`<div class="p-3 bg-white/5 hover:bg-[#6f942e]/20 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors"${_scopeId}><i class="pi pi-level-up text-[#6f942e]"${_scopeId}></i><span class="text-sm font-bold text-slate-300"${_scopeId}>.. (Pasta Anterior)</span></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(subDirectories.value, (dir) => {
              _push2(`<div class="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors"${_scopeId}><i class="pi pi-folder text-amber-600"${_scopeId}></i><span class="text-sm text-slate-300"${_scopeId}>${ssrInterpolate(dir.name)}</span></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar pt-2" }, [
                folder.value !== "content" ? (openBlock(), createBlock("div", {
                  key: 0,
                  onClick: ($event) => handleMove(".."),
                  class: "p-3 bg-white/5 hover:bg-[#6f942e]/20 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors"
                }, [
                  createVNode("i", { class: "pi pi-level-up text-[#6f942e]" }),
                  createVNode("span", { class: "text-sm font-bold text-slate-300" }, ".. (Pasta Anterior)")
                ], 8, ["onClick"])) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(subDirectories.value, (dir) => {
                  return openBlock(), createBlock("div", {
                    key: dir.name,
                    onClick: ($event) => handleMove(dir.name),
                    class: "p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded cursor-pointer flex items-center gap-3 transition-colors"
                  }, [
                    createVNode("i", { class: "pi pi-folder text-amber-600" }),
                    createVNode("span", { class: "text-sm text-slate-300" }, toDisplayString(dir.name), 1)
                  ], 8, ["onClick"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/ImageExplorer.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const ImageExplorer = Object.assign(_sfc_main$5, { __name: "ImageExplorer" });
const _sfc_main$4 = {
  __name: "CreateFile",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean, default: false },
    siteContext: { type: String, required: true },
    currentFolder: { type: String, default: "content" }
  },
  emits: ["update:visible", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const loading = ref(false);
    const schemasLoading = ref(false);
    const form = ref({ name: "", type: "" });
    const availableSchemas = ref([]);
    const fetchSchemas = async () => {
      schemasLoading.value = true;
      availableSchemas.value = [];
      let searchPath = props.currentFolder;
      let found = false;
      while (searchPath !== void 0 && searchPath !== null) {
        try {
          const targetFolder = `${searchPath}/_schemas`.replace(/\/+/g, "/");
          const data = await $fetch("/api/admin/storage", {
            params: { site: props.siteContext, folder: targetFolder }
          });
          const validFiles = (data.files || []).filter((f) => !f.isDirectory && f.name.endsWith(".json"));
          if (validFiles.length > 0) {
            availableSchemas.value = validFiles.map((f) => ({
              label: f.name.replace(".json", "").toUpperCase(),
              key: `/${searchPath}/_schemas/${f.name}`.replace(/\/+/g, "/")
            }));
            found = true;
            break;
          }
        } catch (e) {
        }
        if (searchPath === "content" || searchPath === "") break;
        if (!searchPath.includes("/")) break;
        searchPath = searchPath.substring(0, searchPath.lastIndexOf("/"));
      }
      if (!found || availableSchemas.value.length === 0) {
        availableSchemas.value = [{
          label: "DEFAULT",
          key: "/content/_schemas/default.json"
        }];
      }
      if (availableSchemas.value.length > 0) {
        form.value.type = availableSchemas.value[0].key;
      }
      schemasLoading.value = false;
    };
    watch(() => props.visible, (val) => {
      if (val) {
        form.value.name = "";
        fetchSchemas();
      }
    });
    const handleCreate = async () => {
      if (loading.value || !form.value.name) return;
      loading.value = true;
      try {
        let folderName = form.value.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\.md$/, "").replace(/\s+/g, "-");
        const targetFolderPath = `${props.currentFolder}/${folderName}`.replace(/\/+/g, "/");
        await $fetch("/api/admin/storage/mkdir", {
          method: "POST",
          body: {
            site: props.siteContext,
            folder: props.currentFolder,
            name: folderName
          }
        });
        const frontmatter = {
          schema: form.value.type,
          title: form.value.name,
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        };
        const content = `---
${jsYaml.dump(frontmatter)}---

# ${form.value.name}`;
        await $fetch("/api/admin/storage", {
          method: "POST",
          body: {
            site: props.siteContext,
            folder: targetFolderPath,
            file: "_index.md",
            content
          }
        });
        toast.add({ severity: "success", summary: "Página Criada", life: 2e3 });
        emit("update:visible", false);
        const finalFilePath = `${targetFolderPath}/_index.md`;
        emit("success", finalFilePath);
      } catch (e) {
        console.error(e);
        toast.add({ severity: "error", summary: "Erro", detail: e.data?.error || "Falha ao criar." });
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Dialog = script$2;
      const _component_InputText = script$1;
      const _component_Button = script$5;
      _push(ssrRenderComponent(_component_Dialog, mergeProps({
        visible: __props.visible,
        "onUpdate:visible": ($event) => _ctx.$emit("update:visible", $event),
        modal: "",
        header: "NOVA PÁGINA",
        style: { width: "400px" },
        class: "bg-[#141b18]",
        appendTo: "body"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-6 pt-4"${_scopeId}><div class="flex flex-col gap-2"${_scopeId}><label class="text-[10px] uppercase font-black text-[#6f942e]"${_scopeId}>Título</label>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: form.value.name,
              "onUpdate:modelValue": ($event) => form.value.name = $event,
              class: "bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors",
              placeholder: "ex: Minha Página",
              autofocus: "",
              onKeydown: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex flex-col gap-2"${_scopeId}><label class="text-[10px] uppercase font-black text-[#6f942e]"${_scopeId}>Modelo (Schema)</label>`);
            if (schemasLoading.value) {
              _push2(`<div class="flex items-center gap-2 text-zinc-500 text-xs p-2"${_scopeId}><i class="pi pi-spin pi-spinner text-[#6f942e]"${_scopeId}></i></div>`);
            } else {
              _push2(`<div class="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20"${_scopeId}><!--[-->`);
              ssrRenderList(availableSchemas.value, (s) => {
                _push2(`<div class="${ssrRenderClass([
                  "p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between",
                  form.value.type === s.key ? "border-[#6f942e] bg-[#6f942e]/10 text-white" : "border-transparent hover:bg-white/5 text-zinc-500"
                ])}"${_scopeId}><span${_scopeId}>${ssrInterpolate(s.label)}</span>`);
                if (form.value.type === s.key) {
                  _push2(`<i class="pi pi-check-circle text-[#6f942e]"${_scopeId}></i>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--><div class="px-2 py-1 text-[9px] text-zinc-600 break-all"${_scopeId}> Path: ${ssrInterpolate(form.value.type)}</div></div>`);
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "CRIAR",
              class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12",
              loading: loading.value,
              onClick: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-6 pt-4" }, [
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] uppercase font-black text-[#6f942e]" }, "Título"),
                  createVNode(_component_InputText, {
                    modelValue: form.value.name,
                    "onUpdate:modelValue": ($event) => form.value.name = $event,
                    class: "bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors",
                    placeholder: "ex: Minha Página",
                    autofocus: "",
                    onKeydown: withKeys(withModifiers(handleCreate, ["prevent"]), ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                ]),
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] uppercase font-black text-[#6f942e]" }, "Modelo (Schema)"),
                  schemasLoading.value ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex items-center gap-2 text-zinc-500 text-xs p-2"
                  }, [
                    createVNode("i", { class: "pi pi-spin pi-spinner text-[#6f942e]" })
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(availableSchemas.value, (s) => {
                      return openBlock(), createBlock("div", {
                        key: s.key,
                        onClick: ($event) => form.value.type = s.key,
                        class: [
                          "p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between",
                          form.value.type === s.key ? "border-[#6f942e] bg-[#6f942e]/10 text-white" : "border-transparent hover:bg-white/5 text-zinc-500"
                        ]
                      }, [
                        createVNode("span", null, toDisplayString(s.label), 1),
                        form.value.type === s.key ? (openBlock(), createBlock("i", {
                          key: 0,
                          class: "pi pi-check-circle text-[#6f942e]"
                        })) : createCommentVNode("", true)
                      ], 10, ["onClick"]);
                    }), 128)),
                    createVNode("div", { class: "px-2 py-1 text-[9px] text-zinc-600 break-all" }, " Path: " + toDisplayString(form.value.type), 1)
                  ]))
                ]),
                createVNode(_component_Button, {
                  label: "CRIAR",
                  class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12",
                  loading: loading.value,
                  onClick: handleCreate
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/modals/CreateFile.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = {
  __name: "CreateFolder",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean, default: false },
    siteContext: { type: String, required: true },
    currentFolder: { type: String, default: "content" }
  },
  emits: ["update:visible", "success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const loading = ref(false);
    const schemasLoading = ref(false);
    const form = ref({ name: "", type: "default" });
    const availableSchemas = ref([]);
    const fetchSchemas = async () => {
      schemasLoading.value = true;
      try {
        const data = await $fetch("/api/admin/storage", {
          params: { site: props.siteContext, folder: "content/_schemas" }
        });
        availableSchemas.value = data.filter((f) => !f.isDirectory && f.name.endsWith(".json")).map((f) => ({
          label: f.name.replace(".json", "").toUpperCase(),
          key: f.name.replace(".json", "")
        }));
        if (availableSchemas.value.length === 0) {
          availableSchemas.value = [{ label: "DEFAULT", key: "default" }];
        }
      } catch (e) {
        availableSchemas.value = [{ label: "DEFAULT", key: "default" }];
      } finally {
        schemasLoading.value = false;
      }
    };
    watch(() => props.visible, (val) => {
      if (val) {
        form.value = { name: "", type: "default" };
        fetchSchemas();
      }
    });
    const handleCreate = async () => {
      if (!form.value.name) return;
      loading.value = true;
      try {
        let folderName = form.value.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
        const targetFolderPath = `${props.currentFolder}/${folderName}`;
        await $fetch("/api/admin/mkdir", {
          method: "POST",
          body: {
            site: props.siteContext,
            folder: props.currentFolder,
            name: folderName
          }
        });
        await $fetch("/api/admin/storage", {
          method: "POST",
          body: {
            site: props.siteContext,
            folder: targetFolderPath,
            file: ".isDirFlag",
            content: ""
          }
        });
        const frontmatter = {
          schema: form.value.type,
          title: form.value.name,
          // Nome bonito (com acentos e espaços)
          date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        };
        const content = `---
${jsYaml.dump(frontmatter)}---

# ${form.value.name}`;
        await $fetch("/api/admin/storage", {
          method: "POST",
          body: {
            site: props.siteContext,
            folder: targetFolderPath,
            file: "_index.md",
            content
          }
        });
        toast.add({ severity: "success", summary: "Seção Criada", detail: "Pasta configurada com sucesso.", life: 2e3 });
        emit("update:visible", false);
        const finalFilePath = `${targetFolderPath}/_index.md`;
        emit("success", finalFilePath);
      } catch (e) {
        console.error(e);
        toast.add({ severity: "error", summary: "Erro", detail: "Falha ao criar nova seção." });
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Dialog = script$2;
      const _component_InputText = script$1;
      const _component_Button = script$5;
      _push(ssrRenderComponent(_component_Dialog, mergeProps({
        visible: __props.visible,
        "onUpdate:visible": ($event) => _ctx.$emit("update:visible", $event),
        modal: "",
        header: "NOVA SEÇÃO (PASTA)",
        style: { width: "400px" },
        class: "bg-[#141b18]",
        appendTo: "body"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-6 pt-4" data-v-f5ce0f31${_scopeId}><div class="flex flex-col gap-2" data-v-f5ce0f31${_scopeId}><label class="text-[10px] uppercase font-black text-[#6f942e]" data-v-f5ce0f31${_scopeId}>Título da Seção</label>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: unref(form).name,
              "onUpdate:modelValue": ($event) => unref(form).name = $event,
              class: "bg-[#0a0f0d] border border-white/10 text-white w-full focus:border-[#6f942e] transition-colors",
              placeholder: "Ex: Galeria de Fotos",
              autofocus: "",
              onKeyup: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`<p class="text-[9px] text-zinc-500 italic" data-v-f5ce0f31${_scopeId}>Uma pasta será criada contendo o arquivo principal.</p></div><div class="flex flex-col gap-2" data-v-f5ce0f31${_scopeId}><label class="text-[10px] uppercase font-black text-[#6f942e]" data-v-f5ce0f31${_scopeId}>Modelo de Página</label>`);
            if (unref(schemasLoading)) {
              _push2(`<div class="flex items-center gap-2 text-zinc-500 text-xs p-2" data-v-f5ce0f31${_scopeId}><i class="pi pi-spin pi-spinner text-[#6f942e]" data-v-f5ce0f31${_scopeId}></i> Carregando modelos... </div>`);
            } else {
              _push2(`<div class="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20" data-v-f5ce0f31${_scopeId}><!--[-->`);
              ssrRenderList(unref(availableSchemas), (s) => {
                _push2(`<div class="${ssrRenderClass([
                  "p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between",
                  unref(form).type === s.key ? "border-[#6f942e] bg-[#6f942e]/10 text-white shadow-[0_0_10px_rgba(111,148,46,0.1)]" : "border-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300"
                ])}" data-v-f5ce0f31${_scopeId}>${ssrInterpolate(s.label)} `);
                if (unref(form).type === s.key) {
                  _push2(`<i class="pi pi-check-circle text-[#6f942e]" data-v-f5ce0f31${_scopeId}></i>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "CRIAR SEÇÃO",
              class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12",
              loading: unref(loading),
              onClick: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-6 pt-4" }, [
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] uppercase font-black text-[#6f942e]" }, "Título da Seção"),
                  createVNode(_component_InputText, {
                    modelValue: unref(form).name,
                    "onUpdate:modelValue": ($event) => unref(form).name = $event,
                    class: "bg-[#0a0f0d] border border-white/10 text-white w-full focus:border-[#6f942e] transition-colors",
                    placeholder: "Ex: Galeria de Fotos",
                    autofocus: "",
                    onKeyup: withKeys(handleCreate, ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode("p", { class: "text-[9px] text-zinc-500 italic" }, "Uma pasta será criada contendo o arquivo principal.")
                ]),
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] uppercase font-black text-[#6f942e]" }, "Modelo de Página"),
                  unref(schemasLoading) ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex items-center gap-2 text-zinc-500 text-xs p-2"
                  }, [
                    createVNode("i", { class: "pi pi-spin pi-spinner text-[#6f942e]" }),
                    createTextVNode(" Carregando modelos... ")
                  ])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded p-1 bg-black/20"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(availableSchemas), (s) => {
                      return openBlock(), createBlock("div", {
                        key: s.key,
                        onClick: ($event) => unref(form).type = s.key,
                        class: [
                          "p-3 mb-1 rounded border cursor-pointer text-[11px] font-bold tracking-wider transition-all flex items-center justify-between",
                          unref(form).type === s.key ? "border-[#6f942e] bg-[#6f942e]/10 text-white shadow-[0_0_10px_rgba(111,148,46,0.1)]" : "border-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300"
                        ]
                      }, [
                        createTextVNode(toDisplayString(s.label) + " ", 1),
                        unref(form).type === s.key ? (openBlock(), createBlock("i", {
                          key: 0,
                          class: "pi pi-check-circle text-[#6f942e]"
                        })) : createCommentVNode("", true)
                      ], 10, ["onClick"]);
                    }), 128))
                  ]))
                ]),
                createVNode(_component_Button, {
                  label: "CRIAR SEÇÃO",
                  class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12",
                  loading: unref(loading),
                  onClick: handleCreate
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/modals/CreateFolder.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const CreateFolderModal = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-f5ce0f31"]]);
const _sfc_main$2 = {
  __name: "CreateCollection",
  __ssrInlineRender: true,
  props: {
    visible: { type: Boolean, default: false },
    siteContext: { type: String, required: true },
    currentFolder: { type: String, default: "content" }
  },
  emits: ["update:visible", "success", "refresh"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const toast = useToast();
    const loading = ref(false);
    const collectionName = ref("");
    watch(
      () => props.visible,
      (val) => {
        if (val) collectionName.value = "";
      }
    );
    const handleCreate = async () => {
      if (loading.value || !collectionName.value) return;
      loading.value = true;
      try {
        const res = await $fetch("/api/admin/create-collection", {
          method: "POST",
          body: {
            site: props.siteContext,
            // <-- A CHAVE DE SEGURANÇA ADICIONADA!
            folder: props.currentFolder,
            name: collectionName.value
          }
        });
        toast.add({
          severity: "success",
          summary: "Coleção Criada",
          detail: "Estrutura e schemas gerados.",
          life: 2e3
        });
        emit("update:visible", false);
        emit("refresh");
      } catch (e) {
        console.error(e);
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: e.data?.error || "Falha ao criar coleção."
        });
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Dialog = script$2;
      const _component_InputText = script$1;
      const _component_Button = script$5;
      _push(ssrRenderComponent(_component_Dialog, mergeProps({
        visible: __props.visible,
        "onUpdate:visible": ($event) => _ctx.$emit("update:visible", $event),
        modal: "",
        header: "NOVA COLEÇÃO",
        style: { width: "400px" },
        class: "bg-[#141b18]",
        appendTo: "body"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-6 pt-4"${_scopeId}><div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200"${_scopeId}><i class="pi pi-info-circle mr-1"${_scopeId}></i> Uma coleção gera uma pasta dedicada com schemas próprios, ideal para Blogs, Portfólios ou Produtos. </div><div class="flex flex-col gap-2"${_scopeId}><label class="text-[10px] uppercase font-black text-[#6f942e]"${_scopeId}>Nome da Coleção</label>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: collectionName.value,
              "onUpdate:modelValue": ($event) => collectionName.value = $event,
              class: "bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors",
              placeholder: "ex: Blog, Notícias, Produtos",
              autofocus: "",
              onKeydown: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "CRIAR ESTRUTURA",
              icon: "pi pi-database",
              class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12 transition-all active:scale-[0.98]",
              loading: loading.value,
              onClick: handleCreate
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-6 pt-4" }, [
                createVNode("div", { class: "bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200" }, [
                  createVNode("i", { class: "pi pi-info-circle mr-1" }),
                  createTextVNode(" Uma coleção gera uma pasta dedicada com schemas próprios, ideal para Blogs, Portfólios ou Produtos. ")
                ]),
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] uppercase font-black text-[#6f942e]" }, "Nome da Coleção"),
                  createVNode(_component_InputText, {
                    modelValue: collectionName.value,
                    "onUpdate:modelValue": ($event) => collectionName.value = $event,
                    class: "bg-[#0a0f0d] border border-white/10 text-white focus:border-[#6f942e] transition-colors",
                    placeholder: "ex: Blog, Notícias, Produtos",
                    autofocus: "",
                    onKeydown: withKeys(withModifiers(handleCreate, ["prevent"]), ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "onKeydown"])
                ]),
                createVNode(_component_Button, {
                  label: "CRIAR ESTRUTURA",
                  icon: "pi pi-database",
                  class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12 transition-all active:scale-[0.98]",
                  loading: loading.value,
                  onClick: handleCreate
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/modals/CreateCollection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "BackupManager",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const toast = useToast();
    const confirm2 = useConfirm();
    useCookie("cms_site_context");
    const { data: backups, refresh, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/backup",
      {
        lazy: true,
        server: false
      },
      "$x1z7wsF_ZJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const showCreateDialog = ref(false);
    const newBackupName = ref("");
    const createLoading = ref(false);
    const handleCreateBackup = async () => {
      if (!newBackupName.value) return;
      createLoading.value = true;
      try {
        await $fetch("/api/admin/backup/create", {
          method: "POST",
          body: { name: newBackupName.value }
        });
        toast.add({ severity: "success", summary: "Sucesso", detail: "Backup criado com sucesso.", life: 3e3 });
        showCreateDialog.value = false;
        newBackupName.value = "";
        refresh();
      } catch (e) {
        toast.add({ severity: "error", summary: "Erro", detail: e.data?.error || "Falha ao criar backup." });
      } finally {
        createLoading.value = false;
      }
    };
    const restoreLoading = ref(false);
    const showRestoreProgress = ref(false);
    const restoreBackupName = ref("");
    const confirmRestore = (backup) => {
      confirm2.require({
        group: "restore",
        message: `ATENÇÃO: Isso substituirá TODO o site pela versão "${backup.name}". Continuar?`,
        header: "Confirmar Restauração",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Sim",
        rejectLabel: "Não",
        accept: () => handleRestore(backup)
      });
    };
    const handleRestore = async (backup) => {
      if (restoreLoading.value) return;
      restoreBackupName.value = backup.name;
      restoreLoading.value = true;
      showRestoreProgress.value = true;
      try {
        await $fetch("/api/admin/backup/restore", {
          method: "POST",
          body: { filename: backup.filename }
        });
        toast.add({ severity: "success", summary: "Restaurado", detail: "Reiniciando sistema...", life: 2e3 });
        setTimeout(() => (void 0).location.reload(), 1500);
      } catch (e) {
        showRestoreProgress.value = false;
        toast.add({ severity: "error", summary: "Erro Crítico", detail: e.data?.error || "Falha ao restaurar backup." });
        restoreLoading.value = false;
      }
    };
    const deleteLoading = ref(false);
    const confirmDelete = (backup) => {
      confirm2.require({
        group: "delete",
        message: `Tem certeza que deseja excluir o backup "${backup.name}"?`,
        header: "Excluir Backup",
        icon: "pi pi-trash",
        acceptClass: "p-button-danger",
        acceptLabel: "EXCLUIR",
        rejectLabel: "Cancelar",
        accept: () => handleDelete(backup)
      });
    };
    const handleDelete = async (backup) => {
      deleteLoading.value = true;
      try {
        await $fetch("/api/admin/backup/delete", {
          method: "POST",
          body: { filename: backup.filename }
        });
        toast.add({ severity: "success", summary: "Excluído", detail: "Backup removido permanentemente.", life: 2e3 });
        refresh();
      } catch (e) {
        toast.add({ severity: "error", summary: "Erro", detail: e.data?.error || "Falha ao excluir arquivo." });
      } finally {
        deleteLoading.value = false;
      }
    };
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleString("pt-BR");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ConfirmDialog = script$7;
      const _component_Button = script$5;
      const _component_Dialog = script$2;
      const _component_ProgressBar = script$9;
      const _component_DataTable = script$4;
      const _component_Column = script$6;
      const _component_InputText = script$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col gap-4 text-slate-200" }, _attrs))} data-v-a55fd524>`);
      _push(ssrRenderComponent(_component_ConfirmDialog, { group: "delete" }, null, _parent));
      _push(ssrRenderComponent(_component_ConfirmDialog, { group: "restore" }, {
        message: withCtx((slotProps, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-4 items-center p-2" data-v-a55fd524${_scopeId}><i class="${ssrRenderClass([slotProps.message.icon, "text-4xl text-yellow-500"])}" data-v-a55fd524${_scopeId}></i><p class="text-slate-200 leading-relaxed text-sm" data-v-a55fd524${_scopeId}>${ssrInterpolate(slotProps.message.message)}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-4 items-center p-2" }, [
                createVNode("i", {
                  class: [slotProps.message.icon, "text-4xl text-yellow-500"]
                }, null, 2),
                createVNode("p", { class: "text-slate-200 leading-relaxed text-sm" }, toDisplayString(slotProps.message.message), 1)
              ])
            ];
          }
        }),
        footer: withCtx((slotProps, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Button, {
              label: "Cancelar",
              text: "",
              class: "text-zinc-400 hover:text-white",
              onClick: slotProps.reject
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Button, {
              label: "SIM, RESTAURAR",
              severity: "warning",
              loading: restoreLoading.value,
              onClick: slotProps.accept
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Button, {
                label: "Cancelar",
                text: "",
                class: "text-zinc-400 hover:text-white",
                onClick: slotProps.reject
              }, null, 8, ["onClick"]),
              createVNode(_component_Button, {
                label: "SIM, RESTAURAR",
                severity: "warning",
                loading: restoreLoading.value,
                onClick: slotProps.accept
              }, null, 8, ["loading", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showRestoreProgress.value,
        "onUpdate:visible": ($event) => showRestoreProgress.value = $event,
        modal: "",
        closable: false,
        style: { width: "400px" },
        class: "bg-[#141b18]",
        appendTo: "body",
        showHeader: false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col items-center gap-6 py-6 text-center" data-v-a55fd524${_scopeId}><div class="relative" data-v-a55fd524${_scopeId}><i class="pi pi-spin pi-cog text-6xl text-[#6f942e] opacity-20 absolute top-0 left-0" data-v-a55fd524${_scopeId}></i><i class="pi pi-spin pi-spinner text-6xl text-[#6f942e]" data-v-a55fd524${_scopeId}></i></div><div class="flex flex-col gap-2" data-v-a55fd524${_scopeId}><span class="font-black text-xl text-white tracking-wide" data-v-a55fd524${_scopeId}>RESTAURANDO...</span><span class="text-zinc-400 text-sm" data-v-a55fd524${_scopeId}>Backup: <span class="text-[#6f942e] font-mono" data-v-a55fd524${_scopeId}>${ssrInterpolate(restoreBackupName.value)}</span></span></div><div class="w-full px-6" data-v-a55fd524${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ProgressBar, {
              mode: "indeterminate",
              style: { "height": "6px" },
              class: "custom-progress"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-xs text-yellow-500/90 flex items-center gap-2" data-v-a55fd524${_scopeId}><i class="pi pi-info-circle" data-v-a55fd524${_scopeId}></i><span data-v-a55fd524${_scopeId}>O sistema será reiniciado automaticamente ao finalizar.</span></div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col items-center gap-6 py-6 text-center" }, [
                createVNode("div", { class: "relative" }, [
                  createVNode("i", { class: "pi pi-spin pi-cog text-6xl text-[#6f942e] opacity-20 absolute top-0 left-0" }),
                  createVNode("i", { class: "pi pi-spin pi-spinner text-6xl text-[#6f942e]" })
                ]),
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("span", { class: "font-black text-xl text-white tracking-wide" }, "RESTAURANDO..."),
                  createVNode("span", { class: "text-zinc-400 text-sm" }, [
                    createTextVNode("Backup: "),
                    createVNode("span", { class: "text-[#6f942e] font-mono" }, toDisplayString(restoreBackupName.value), 1)
                  ])
                ]),
                createVNode("div", { class: "w-full px-6" }, [
                  createVNode(_component_ProgressBar, {
                    mode: "indeterminate",
                    style: { "height": "6px" },
                    class: "custom-progress"
                  })
                ]),
                createVNode("div", { class: "bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-xs text-yellow-500/90 flex items-center gap-2" }, [
                  createVNode("i", { class: "pi pi-info-circle" }),
                  createVNode("span", null, "O sistema será reiniciado automaticamente ao finalizar.")
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="bg-[#0a0f0d] border border-white/10 rounded-lg overflow-hidden" data-v-a55fd524>`);
      _push(ssrRenderComponent(_component_DataTable, {
        value: unref(backups),
        loading: unref(pending),
        class: "p-datatable-sm",
        stripedRows: "",
        scrollable: "",
        scrollHeight: "400px"
      }, {
        empty: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-8 text-center text-zinc-500 text-sm" data-v-a55fd524${_scopeId}><i class="pi pi-inbox text-2xl mb-2 block" data-v-a55fd524${_scopeId}></i> Nenhum backup encontrado. </div>`);
          } else {
            return [
              createVNode("div", { class: "p-8 text-center text-zinc-500 text-sm" }, [
                createVNode("i", { class: "pi pi-inbox text-2xl mb-2 block" }),
                createTextVNode(" Nenhum backup encontrado. ")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Column, {
              field: "name",
              header: "Nome / Descrição",
              style: { "min-width": "200px" }
            }, {
              body: withCtx((slotProps, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex flex-col" data-v-a55fd524${_scopeId2}><span class="font-bold text-white text-xs" data-v-a55fd524${_scopeId2}>${ssrInterpolate(slotProps.data.name)}</span><span class="font-mono text-[10px] text-zinc-500" data-v-a55fd524${_scopeId2}>${ssrInterpolate(slotProps.data.filename)}</span></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex flex-col" }, [
                      createVNode("span", { class: "font-bold text-white text-xs" }, toDisplayString(slotProps.data.name), 1),
                      createVNode("span", { class: "font-mono text-[10px] text-zinc-500" }, toDisplayString(slotProps.data.filename), 1)
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              field: "created",
              header: "Data",
              style: { "width": "140px" }
            }, {
              body: withCtx((slotProps, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span class="text-xs text-zinc-300" data-v-a55fd524${_scopeId2}>${ssrInterpolate(formatDate(slotProps.data.created))}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-xs text-zinc-300" }, toDisplayString(formatDate(slotProps.data.created)), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              field: "size",
              header: "Tam.",
              style: { "width": "80px" }
            }, {
              body: withCtx((slotProps, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<span class="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-mono" data-v-a55fd524${_scopeId2}>${ssrInterpolate(slotProps.data.size)}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-mono" }, toDisplayString(slotProps.data.size), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_Column, {
              header: "",
              style: { "width": "140px" },
              alignFrozen: "right",
              frozen: ""
            }, {
              body: withCtx((slotProps, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<div class="flex justify-end gap-2" data-v-a55fd524${_scopeId2}>`);
                  _push3(ssrRenderComponent(_component_Button, {
                    icon: "pi pi-refresh",
                    size: "small",
                    severity: "warning",
                    outlined: "",
                    tooltip: "Restaurar",
                    tooltipOptions: "{ position: 'top' }",
                    onClick: ($event) => confirmRestore(slotProps.data),
                    class: "!h-7 !w-7"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_Button, {
                    icon: "pi pi-trash",
                    size: "small",
                    severity: "danger",
                    outlined: "",
                    tooltip: "Excluir",
                    tooltipOptions: "{ position: 'top' }",
                    loading: deleteLoading.value,
                    onClick: ($event) => confirmDelete(slotProps.data),
                    class: "!h-7 !w-7"
                  }, null, _parent3, _scopeId2));
                  _push3(`</div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex justify-end gap-2" }, [
                      createVNode(_component_Button, {
                        icon: "pi pi-refresh",
                        size: "small",
                        severity: "warning",
                        outlined: "",
                        tooltip: "Restaurar",
                        tooltipOptions: "{ position: 'top' }",
                        onClick: ($event) => confirmRestore(slotProps.data),
                        class: "!h-7 !w-7"
                      }, null, 8, ["onClick"]),
                      createVNode(_component_Button, {
                        icon: "pi pi-trash",
                        size: "small",
                        severity: "danger",
                        outlined: "",
                        tooltip: "Excluir",
                        tooltipOptions: "{ position: 'top' }",
                        loading: deleteLoading.value,
                        onClick: ($event) => confirmDelete(slotProps.data),
                        class: "!h-7 !w-7"
                      }, null, 8, ["loading", "onClick"])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_Column, {
                field: "name",
                header: "Nome / Descrição",
                style: { "min-width": "200px" }
              }, {
                body: withCtx((slotProps) => [
                  createVNode("div", { class: "flex flex-col" }, [
                    createVNode("span", { class: "font-bold text-white text-xs" }, toDisplayString(slotProps.data.name), 1),
                    createVNode("span", { class: "font-mono text-[10px] text-zinc-500" }, toDisplayString(slotProps.data.filename), 1)
                  ])
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                field: "created",
                header: "Data",
                style: { "width": "140px" }
              }, {
                body: withCtx((slotProps) => [
                  createVNode("span", { class: "text-xs text-zinc-300" }, toDisplayString(formatDate(slotProps.data.created)), 1)
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                field: "size",
                header: "Tam.",
                style: { "width": "80px" }
              }, {
                body: withCtx((slotProps) => [
                  createVNode("span", { class: "text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-mono" }, toDisplayString(slotProps.data.size), 1)
                ]),
                _: 1
              }),
              createVNode(_component_Column, {
                header: "",
                style: { "width": "140px" },
                alignFrozen: "right",
                frozen: ""
              }, {
                body: withCtx((slotProps) => [
                  createVNode("div", { class: "flex justify-end gap-2" }, [
                    createVNode(_component_Button, {
                      icon: "pi pi-refresh",
                      size: "small",
                      severity: "warning",
                      outlined: "",
                      tooltip: "Restaurar",
                      tooltipOptions: "{ position: 'top' }",
                      onClick: ($event) => confirmRestore(slotProps.data),
                      class: "!h-7 !w-7"
                    }, null, 8, ["onClick"]),
                    createVNode(_component_Button, {
                      icon: "pi pi-trash",
                      size: "small",
                      severity: "danger",
                      outlined: "",
                      tooltip: "Excluir",
                      tooltipOptions: "{ position: 'top' }",
                      loading: deleteLoading.value,
                      onClick: ($event) => confirmDelete(slotProps.data),
                      class: "!h-7 !w-7"
                    }, null, 8, ["loading", "onClick"])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex justify-end pt-2" data-v-a55fd524>`);
      _push(ssrRenderComponent(_component_Button, {
        class: "bg-[#6f942e] border-none text-black font-black w-full hover:bg-[#5a7a25] h-12 transition-all active:scale-[0.98]",
        onClick: ($event) => showCreateDialog.value = true
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Icon), {
              icon: "mdi:plus-circle-outline",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
            _push2(`<span data-v-a55fd524${_scopeId}>CRIAR PONTO DE RESTAURAÇÃO</span>`);
          } else {
            return [
              createVNode(unref(Icon), {
                icon: "mdi:plus-circle-outline",
                class: "w-4 h-4"
              }),
              createVNode("span", null, "CRIAR PONTO DE RESTAURAÇÃO")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showCreateDialog.value,
        "onUpdate:visible": ($event) => showCreateDialog.value = $event,
        modal: "",
        header: "Novo Backup",
        style: { width: "350px" },
        class: "bg-[#141b18]",
        appendTo: "body"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col gap-4 pt-4" data-v-a55fd524${_scopeId}><div class="flex flex-col gap-2" data-v-a55fd524${_scopeId}><label class="text-[10px] font-bold text-[#6f942e] uppercase" data-v-a55fd524${_scopeId}>Nome</label>`);
            _push2(ssrRenderComponent(_component_InputText, {
              modelValue: newBackupName.value,
              "onUpdate:modelValue": ($event) => newBackupName.value = $event,
              placeholder: "Ex: Antes de alterar...",
              class: "bg-[#0a0f0d] border border-white/10 text-white w-full text-sm",
              autofocus: ""
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_Button, {
              label: "SALVAR BACKUP",
              icon: "pi pi-save",
              class: "bg-[#6f942e] border-none text-black font-bold w-full",
              loading: createLoading.value,
              onClick: handleCreateBackup
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col gap-4 pt-4" }, [
                createVNode("div", { class: "flex flex-col gap-2" }, [
                  createVNode("label", { class: "text-[10px] font-bold text-[#6f942e] uppercase" }, "Nome"),
                  createVNode(_component_InputText, {
                    modelValue: newBackupName.value,
                    "onUpdate:modelValue": ($event) => newBackupName.value = $event,
                    placeholder: "Ex: Antes de alterar...",
                    class: "bg-[#0a0f0d] border border-white/10 text-white w-full text-sm",
                    autofocus: ""
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode(_component_Button, {
                  label: "SALVAR BACKUP",
                  icon: "pi pi-save",
                  class: "bg-[#6f942e] border-none text-black font-bold w-full",
                  loading: createLoading.value,
                  onClick: handleCreateBackup
                }, null, 8, ["loading"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/BackupManager.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const BackupManager = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-a55fd524"]]), { __name: "BackupManager" });
const _sfc_main = {
  __name: "editor",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const siteContext = useCookie("cms_site_context");
    const toast = useToast();
    const route = useRoute();
    const router = useRouter();
    const currentPath = computed(() => (route.query.path || "content").toString());
    const sidebarFolder = ref("content");
    const mainFolder = ref("content");
    const currentFile = ref("");
    const sidebarHighlightFile = ref("");
    const isFrontmatterCollapsed = ref(false);
    const lastPreviewPath = ref("");
    const sidebarFiles = ref([]);
    const mainFiles = ref([]);
    const fileData = ref({ frontmatter: {}, content: "" });
    const isCollectionFolder = ref(false);
    const currentFolderType = ref("folder");
    const fmSchema = ref("default");
    const debugLogs = ref([]);
    const collectionPanelVisible = ref(false);
    const editArea = ref(true);
    const showFileManager = ref(true);
    const showCreateModal = ref(false);
    const showFolderCreateModal = ref(false);
    const showCollectionCreateModal = ref(false);
    const showBackupModal = ref(false);
    const showImageModal = ref(false);
    const creationTargetFolder = ref("content");
    const fileManagerWidth = ref(320);
    const frontmatterWidth = ref(350);
    const isRawMode = ref(false);
    const isPreviewMode = ref(false);
    const previewUrl = ref("");
    const previewIframe = ref(null);
    const userMenu = ref();
    const settingsMenu = ref();
    const handleLogout = async () => {
      try {
        await $fetch("/api/auth/logout", { method: "POST" });
        toast.add({
          severity: "info",
          summary: "Até logo",
          detail: "Sessão encerrada com sucesso.",
          life: 2e3
        });
        (void 0).location.href = "/login";
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        router.push("/");
      }
    };
    const userMenuItems = ref([
      {
        label: "Sair",
        icon: "pi pi-power-off",
        command: handleLogout
        // <--- Agora chama a função dedicada
      }
    ]);
    const settingsItems = ref([
      {
        label: "Backups",
        icon: "pi pi-history",
        command: () => showBackupModal.value = true
      }
    ]);
    const { data: configFileData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/storage",
      {
        query: { folder: ".", file: "_config.json", site: siteContext },
        key: `site-config-${siteContext.value}`
      },
      "$mO0JGFHUoy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const userSiteUrl = computed(() => {
      try {
        const c = JSON.parse(configFileData.value?.content || "{}");
        return c.url ? c.url.endsWith("/") ? c.url.slice(0, -1) : c.url : "";
      } catch (e) {
        return "";
      }
    });
    const currentPreviewDisplayUrl = computed(() => {
      let path = lastPreviewPath.value;
      if (!path) {
        path = currentFile.value.replace("content", "").replace("/_index.md", "").replace(".md", "");
        if (!path) path = "/";
      }
      const baseUrl = userSiteUrl.value.replace(/\/$/, "");
      const cleanPath = path.startsWith("/") ? path : "/" + path;
      return `${baseUrl}${cleanPath}`;
    });
    watch(isRawMode, async (active) => {
      if (active) {
        const fmString = jsYaml.dump(fileData.value.frontmatter, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          sortKeys: true
        }).trim();
        const separator = fmString && fmString !== "{}" ? `---
${fmString}
---

` : "";
        fileData.value.content = `${separator}${fileData.value.content}`;
      } else {
        const parsed = parseFile(fileData.value.content, currentFile.value);
        fileData.value.frontmatter = parsed.frontmatter;
        fileData.value.content = parsed.content;
        if (parsed.isRaw) {
          fmSchema.value = "none";
        } else {
          fmSchema.value = await resolveSmartSchema(
            currentFile.value,
            parsed.frontmatter?.schema
          );
        }
      }
    });
    watch(currentFile, () => {
      isRawMode.value = false;
    });
    const resolveSmartSchema = async (filepath, currentSchema) => {
      if (currentSchema) return currentSchema;
      let foldersToSearch = [];
      let tempPath = filepath.substring(0, filepath.lastIndexOf("/"));
      while (tempPath) {
        foldersToSearch.push(`${tempPath}/_schemas`);
        if (tempPath === "content" || tempPath === "") break;
        if (!tempPath.includes("/")) break;
        tempPath = tempPath.substring(0, tempPath.lastIndexOf("/"));
      }
      foldersToSearch = [...new Set(foldersToSearch)];
      for (const folder of foldersToSearch) {
        try {
          const cleanFolder = folder.replace(/\/+/g, "/");
          const data = await $fetch("/api/admin/storage", {
            params: { site: siteContext.value, folder: cleanFolder }
          });
          const validFiles = (data.files || []).filter(
            (f) => !f.isDirectory && f.name.endsWith(".json")
          );
          if (validFiles.length > 0) {
            const defaultSchema = validFiles.find((f) => f.name === "default.json");
            if (defaultSchema) {
              const foundPath = `${cleanFolder}/default.json`.replace(/\/+/g, "/");
              if (fileData.value && fileData.value.frontmatter) {
                fileData.value.frontmatter.schema = foundPath;
              }
              return foundPath;
            }
            break;
          }
        } catch (e) {
        }
      }
      return "default";
    };
    const syncStateFromUrl = async () => {
      const path = currentPath.value;
      if (!path) return;
      const isFile = /\.(md|json|yml|yaml|toml)$/i.test(path);
      if (isFile) {
        const itemFolder = path.substring(0, path.lastIndexOf("/"));
        const parentOfItem = itemFolder.substring(0, itemFolder.lastIndexOf("/"));
        const isDirectCollection = await checkIfCollection(itemFolder);
        const isChildOfCollection = await checkIfCollection(parentOfItem);
        const isStructural = await checkIfStructural(itemFolder);
        if (isDirectCollection || isChildOfCollection) {
          let collectionRoot = isDirectCollection ? itemFolder : parentOfItem;
          let sidebarTarget = isDirectCollection ? parentOfItem || "content" : parentOfItem.substring(0, parentOfItem.lastIndexOf("/")) || "content";
          mainFolder.value = itemFolder;
          sidebarFolder.value = sidebarTarget;
          sidebarHighlightFile.value = collectionRoot;
        } else if (isStructural) {
          mainFolder.value = itemFolder;
          sidebarFolder.value = itemFolder;
          sidebarHighlightFile.value = path;
        } else {
          mainFolder.value = itemFolder;
          sidebarFolder.value = parentOfItem || "content";
          sidebarHighlightFile.value = itemFolder;
        }
        currentFile.value = path;
        await fetchSidebarContent(sidebarFolder.value);
        await getFileContent(path);
        currentFolderType.value = "page";
        collectionPanelVisible.value = false;
        editArea.value = true;
      } else {
        mainFolder.value = path;
        await fetchMainContent(path);
        if (isCollectionFolder.value) {
          const parentOfCollection = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) : "content";
          sidebarFolder.value = parentOfCollection || "content";
          sidebarHighlightFile.value = path;
          currentFolderType.value = "collection";
          collectionPanelVisible.value = true;
          editArea.value = false;
        } else {
          sidebarFolder.value = path;
          sidebarHighlightFile.value = "";
          currentFolderType.value = "folder";
          collectionPanelVisible.value = false;
          editArea.value = true;
        }
        const candidates = [
          "_index.md",
          "_index.json",
          "_index.yml",
          "_index.toml"
        ];
        let foundIndex = null;
        for (const ext of candidates) {
          const match = mainFiles.value.find((f) => f.name.toLowerCase() === ext);
          if (match) {
            foundIndex = match;
            break;
          }
        }
        if (foundIndex) {
          const fullIndexPath = `${path}/${foundIndex.name}`.replace(/\/+/g, "/");
          currentFile.value = fullIndexPath;
          sidebarHighlightFile.value = fullIndexPath;
          await getFileContent(fullIndexPath);
          console.log(`📂 Pasta aberta. Index carregado: ${foundIndex.name}`);
        } else {
          currentFile.value = "";
          fileData.value = { frontmatter: {}, content: "" };
        }
        await fetchSidebarContent(sidebarFolder.value);
      }
    };
    const checkIfCollection = async (folderPath) => {
      if (!folderPath || folderPath === "content") return false;
      try {
        const response = await $fetch("/api/admin/storage", {
          params: { site: siteContext.value, folder: folderPath }
        });
        if (response.type === "collection") return true;
        if (response.files && Array.isArray(response.files)) {
          return response.files.some(
            (f) => f.name === ".collection" || f.name === ".collection.json"
          );
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    const checkIfStructural = async (folderPath) => {
      if (!folderPath || folderPath === "content") return true;
      try {
        const response = await $fetch("/api/admin/storage", {
          params: { site: siteContext.value, folder: folderPath }
        });
        if (response.files && Array.isArray(response.files)) {
          return response.files.some((f) => f.name === ".isDirFlag");
        }
        return false;
      } catch (e) {
        return false;
      }
    };
    const fetchMainContent = async (folder) => {
      try {
        const response = await $fetch("/api/admin/storage", {
          params: { site: siteContext.value, folder }
        });
        if (response && response.files) {
          mainFiles.value = response.files;
          const hasCollectionFile = response.files.some(
            (f) => f.name === ".collection"
          );
          isCollectionFolder.value = response.type === "collection" || hasCollectionFile;
        } else {
          mainFiles.value = [];
          isCollectionFolder.value = false;
        }
      } catch (error) {
        mainFiles.value = [];
        isCollectionFolder.value = false;
      }
    };
    const fetchSidebarContent = async (folder) => {
      try {
        if (folder === mainFolder.value && mainFiles.value.length > 0 && !isCollectionFolder.value) {
          sidebarFiles.value = mainFiles.value;
          return;
        }
        const response = await $fetch("/api/admin/storage", {
          params: { site: siteContext.value, folder }
        });
        if (response && response.files) {
          sidebarFiles.value = response.files;
        } else {
          sidebarFiles.value = [];
        }
      } catch (error) {
        sidebarFiles.value = [];
      }
    };
    const getFileContent = async (filepath) => {
      try {
        const folder = filepath.substring(0, filepath.lastIndexOf("/"));
        const filename = filepath.split("/").pop();
        const data = await $fetch("/api/admin/storage", {
          params: { site: siteContext.value, folder, file: filename }
        });
        if (data?.content) {
          fileData.value = parseFile(data.content, filepath);
          if (fileData.value.isRaw) {
            fmSchema.value = "none";
          } else {
            fmSchema.value = await resolveSmartSchema(
              filepath,
              fileData.value.frontmatter?.schema
            );
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    const parseFile = (fullText, filename = "") => {
      if (!fullText) return { frontmatter: {}, content: "" };
      const normalized = fullText.replace(/\r\n/g, "\n");
      const lower = filename.toLowerCase();
      const isRaw = lower.endsWith(".json") || lower.endsWith(".yml") || lower.endsWith(".yaml") || lower.endsWith(".toml");
      if (isRaw) return { frontmatter: {}, content: normalized, isRaw: true };
      const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        try {
          return {
            frontmatter: jsYaml.load(match[1]) || {},
            content: match[2].trimStart()
          };
        } catch (e) {
          return { frontmatter: {}, content: normalized };
        }
      }
      return { frontmatter: {}, content: normalized };
    };
    watch(
      () => route.query.path,
      async (newPath, oldPath) => {
        if (newPath !== oldPath) await syncStateFromUrl();
      },
      { immediate: true }
    );
    const folderBreadcrumbs = computed(() => {
      const rawPath = currentFile.value || currentPath.value;
      if (!rawPath) return [];
      const parts = rawPath.split("/").filter(Boolean);
      return parts.map((part, index) => {
        let label = part.replace(/-/g, " ");
        const isLastItem = index === parts.length - 1;
        if (part === "content") {
          label = "Home";
        }
        if (part.toLowerCase().startsWith("_index")) {
          const parentPart = parts[index - 1];
          let parentName = "Site";
          if (parentPart && parentPart !== "content") {
            parentName = parentPart.replace(/-/g, " ");
            parentName = parentName.charAt(0).toUpperCase() + parentName.slice(1);
          }
          label = ``;
        }
        const accumulator = parts.slice(0, index + 1).join("/");
        return {
          label,
          path: accumulator,
          disabled: isLastItem
          // O último item (onde estamos) não é clicável
        };
      });
    });
    const handleNavigate = {
      navigate: (payload) => {
        let targetPath = "";
        if (typeof payload === "object" && payload.absolute) {
          targetPath = payload.path;
        } else {
          targetPath = `${sidebarFolder.value}/${payload}`;
        }
        targetPath = targetPath.replace(/\/+/g, "/").replace(/\/$/, "");
        router.push({ query: { ...route.query, path: targetPath } });
      },
      selectFile: (path) => {
        let fullPath = "";
        if (path.startsWith("content")) {
          fullPath = path;
        } else {
          fullPath = `${sidebarFolder.value}/${path}`;
        }
        fullPath = fullPath.replace(/\/+/g, "/");
        router.push({ query: { ...route.query, path: fullPath } });
      },
      goBack: () => {
        const parts = sidebarFolder.value.split("/");
        if (parts.length > 0 && sidebarFolder.value !== "" && sidebarFolder.value !== "content") {
          parts.pop();
          const newPath = parts.join("/") || "content";
          router.push({ query: { ...route.query, path: newPath } });
        }
      },
      loadFile: (item) => {
        const targetPath = item.isDirectory ? `${item.path}/_index.md` : item.path;
        router.push({ query: { ...route.query, path: targetPath } });
      },
      refresh: async () => {
        await syncStateFromUrl();
      },
      refresh_: async () => {
        await fetchSidebarContent(sidebarFolder.value);
        if (!currentFile.value || collectionPanelVisible.value) {
          await fetchMainContent(mainFolder.value);
        }
        toast.add({ severity: "secondary", summary: "Atualizado", life: 1e3 });
      }
    };
    const createActions = {
      openFile: (overrideFolder = null) => {
        creationTargetFolder.value = typeof overrideFolder === "string" ? overrideFolder : sidebarFolder.value;
        showCreateModal.value = true;
      },
      openFolder: () => {
        creationTargetFolder.value = sidebarFolder.value;
        showFolderCreateModal.value = true;
      },
      openCollection: () => {
        showCollectionCreateModal.value = true;
      },
      onFileCreated: (filename) => {
        handleNavigate.refresh();
        if (filename) handleNavigate.selectFile(filename);
      },
      onFolderCreated: () => {
        handleNavigate.refresh();
      },
      onCollectionCreated: (folderPath) => {
        handleNavigate.navigate({ path: folderPath, absolute: true });
      }
    };
    const imageTarget = ref(null);
    ref(false);
    const imageActions = {
      open: (target) => {
        if (!target) imageTarget.value = { mode: "markdown" };
        else if (target.mode === "push")
          imageTarget.value = { mode: "push", list: target.list };
        else imageTarget.value = { mode: "set", obj: target.obj, key: target.key };
        showImageModal.value = true;
      },
      handleSelect: (finalPath) => {
        const t = imageTarget.value;
        if (!t) return;
        if (t.mode === "markdown") {
          if (fileData.value) fileData.value.content += `
![](${finalPath})`;
        } else if (t.mode === "set") t.obj[t.key] = finalPath;
        else if (t.mode === "push") t.list.push(finalPath);
        showImageModal.value = false;
      }
    };
    const editorCtxFolder = computed(() => {
      if (!currentFile.value) return mainFolder.value;
      return currentFile.value.substring(0, currentFile.value.lastIndexOf("/"));
    });
    computed(() => {
      if (!currentFile.value) return false;
      const lower = currentFile.value.toLowerCase();
      return lower.endsWith(".json") || lower.endsWith(".yml") || lower.endsWith(".yaml") || lower.endsWith(".toml");
    });
    const showMetaSidebar = computed(() => {
      if (!currentFile.value) {
        return !collectionPanelVisible.value;
      }
      return currentFile.value.toLowerCase().endsWith(".md");
    });
    const { data: schemaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/schema",
      {
        query: {
          site: siteContext,
          folder: ".",
          schema: computed(() => fmSchema.value)
        },
        watch: [fmSchema]
      },
      "$Zx9fhz-Jjc"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const fields = computed(() => schemaData.value?.fields || []);
    const isResizingSidebar = ref(false);
    const isResizingFrontmatter = ref(false);
    const sendPreviewUpdate = () => {
      if (!previewIframe.value || !previewIframe.value.contentWindow) return;
      previewIframe.value.contentWindow.postMessage(
        {
          type: "SIRIUS_PREVIEW_UPDATE",
          data: {
            title: fileData.value.frontmatter.title,
            description: fileData.value.frontmatter.description,
            body: fileData.value.content,
            frontmatter: fileData.value.frontmatter
          }
        },
        "*"
      );
    };
    let debounceTimer = null;
    watch(
      fileData,
      () => {
        if (!isPreviewMode.value) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(sendPreviewUpdate, 200);
      },
      { deep: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Menu = script;
      const _component_Dialog = script$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen w-screen bg-[#0a0f0d] text-slate-300 flex flex-col overflow-hidden font-sans" }, _attrs))} data-v-671c678b><header class="h-14 bg-[#141b18] border-b border-white/5 shrink-0 flex items-center justify-between px-4 z-20 select-none shadow-sm relative overflow-hidden gap-4" data-v-671c678b><div class="flex items-center shrink-0 z-20 group cursor-default" data-v-671c678b><div class="flex items-center relative" data-v-671c678b><div class="absolute -inset-2 bg-[#6f942e]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" data-v-671c678b></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-[#6f942e] drop-shadow-[0_0_6px_rgba(111,148,46,0.6)] animate-pulse-slow relative z-10" data-v-671c678b><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" data-v-671c678b></path></svg><div class="flex items-baseline gap-1.5 ml-2 relative z-10" data-v-671c678b><span class="font-black text-slate-100 text-sm uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400" data-v-671c678b>SIRIUS</span><span class="font-bold text-[10px] text-[#6f942e] uppercase tracking-[0.2em]" data-v-671c678b>STUDIO</span></div></div>`);
      if (unref(siteContext)) {
        _push(`<span class="text-white/10 mx-1 text-xl font-thin relative z-10" data-v-671c678b>/</span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(siteContext)) {
        _push(`<div class="flex items-center gap-2 _bg-white/5 _border _border-white/10 px-3 py-1 rounded-full shadow-inner relative z-10 group-hover:border-[#6f942e]/30 transition-colors" data-v-671c678b><div class="w-1.5 h-1.5 rounded-full bg-[#6f942e] animate-pulse" data-v-671c678b></div><span class="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-slate-300 transition-colors" data-v-671c678b>${ssrInterpolate(unref(siteContext))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-full max-w-lg pointer-events-none z-10" data-v-671c678b>`);
      if (isPreviewMode.value) {
        _push(`<div class="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 w-full group pointer-events-auto shadow-inner transition-all animate-in zoom-in-95 duration-200" data-v-671c678b><i class="pi pi-lock text-[10px] text-green-500" data-v-671c678b></i><span class="text-[11px] font-mono text-slate-400 truncate flex-1 text-center select-all" data-v-671c678b>${ssrInterpolate(currentPreviewDisplayUrl.value)}</span><i class="pi pi-refresh text-[10px] text-slate-500 cursor-pointer hover:text-white transition-transform hover:rotate-180 duration-500" data-v-671c678b></i></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center justify-end gap-3 shrink-0 z-20" data-v-671c678b>`);
      if (isPreviewMode.value) {
        _push(`<div class="flex items-center gap-1.5 animate-in fade-in duration-200" data-v-671c678b><button class="flex items-center gap-1.5 px-2.5 py-1 bg-[#6f942e] hover:bg-[#5a7a23] text-black font-bold text-[9px] uppercase tracking-wider rounded-sm transition-all shadow-[0_0_10px_rgba(111,148,46,0.2)]" title="Editar a página atual" data-v-671c678b><i class="pi pi-file-edit text-[10px]" data-v-671c678b></i><span class="hidden sm:inline" data-v-671c678b>Editar Página</span></button><button class="flex items-center justify-center w-6 h-6 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-sm transition-colors" title="Fechar Preview (Esc)" data-v-671c678b><i class="pi pi-times text-[10px]" data-v-671c678b></i></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex" data-v-671c678b><button class="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500 mr-2" data-v-671c678b><i class="pi pi-cog text-lg" data-v-671c678b></i></button><button class="flex items-center gap-2 w-8 h-8 justify-center rounded-full hover:bg-white/5 transition-all active:scale-90 border border-transparent hover:border-white/10" data-v-671c678b><i class="pi pi-user text-slate-400 text-lg" data-v-671c678b></i></button></div>`);
      _push(ssrRenderComponent(_component_Menu, {
        ref_key: "userMenu",
        ref: userMenu,
        model: userMenuItems.value,
        popup: true,
        class: "bg-[#1a2320] border-white/10"
      }, null, _parent));
      _push(`</div></header><div class="flex-1 flex flex-col overflow-hidden relative" data-v-671c678b><div class="flex-1 flex flex-row overflow-hidden" style="${ssrRenderStyle(!isPreviewMode.value ? null : { display: "none" })}" data-v-671c678b><aside class="w-12 h-full bg-[#141b19] border-r border-white/5 flex flex-col items-center py-3 shrink-0 z-30 gap-4" data-v-671c678b><button class="${ssrRenderClass([showFileManager.value ? "text-[#6f942e]" : "text-zinc-500", "w-8 h-8 rounded-md flex items-center justify-center transition-all"])}" data-v-671c678b><i class="pi pi-folder text-lg" data-v-671c678b></i></button>`);
      _push(ssrRenderComponent(_component_Menu, {
        ref_key: "settingsMenu",
        ref: settingsMenu,
        model: settingsItems.value,
        popup: true
      }, null, _parent));
      _push(`</aside><div class="h-full bg-[#111614] shrink-0 z-10" style="${ssrRenderStyle([
        { width: fileManagerWidth.value + "px" },
        showFileManager.value ? null : { display: "none" }
      ])}" data-v-671c678b>`);
      _push(ssrRenderComponent(FileManager, {
        files: sidebarFiles.value,
        "current-folder": sidebarFolder.value,
        "current-file": sidebarHighlightFile.value,
        "site-context": unref(siteContext),
        "is-collection-folder": false,
        onNavigate: handleNavigate.navigate,
        onSelect: handleNavigate.selectFile,
        onBack: handleNavigate.goBack,
        onCreateFile: createActions.openFile,
        onCreateFolder: createActions.openFolder,
        onCreateCollection: createActions.openCollection,
        onRefresh: handleNavigate.refresh
      }, null, _parent));
      _push(`</div><div class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] bg-transparent z-20 shrink-0 -ml-[2px]" style="${ssrRenderStyle(showFileManager.value ? null : { display: "none" })}" data-v-671c678b></div>`);
      if (isResizingSidebar.value) {
        _push(`<div class="fixed inset-0 z-50 cursor-col-resize bg-transparent" data-v-671c678b></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="flex-1 flex flex-col min-w-0 bg-[#0a0f0d] relative overflow-hidden" data-v-671c678b><div class="flex items-center justify-between w-full gap-4 p-2" data-v-671c678b>`);
      if (!isPreviewMode.value) {
        _push(`<nav class="flex-1 flex items-center gap-1.5 text-[14px] font-mono px-3 py-1 bg-black/20 border border-white/5 rounded-md truncate pointer-events-auto shadow-inner transition-all overflow-hidden" data-v-671c678b><!--[-->`);
        ssrRenderList(folderBreadcrumbs.value, (crumb, index) => {
          _push(`<!--[-->`);
          if (index > 0) {
            _push(`<span class="text-slate-600" data-v-671c678b>/</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button${ssrIncludeBooleanAttr(crumb.disabled) ? " disabled" : ""} class="${ssrRenderClass([
            "transition-colors max-w-[200px] truncate shrink-0",
            crumb.disabled ? "text-[#6f942e] font-bold cursor-default" : "text-slate-500 hover:text-white cursor-pointer hover:underline"
          ])}" data-v-671c678b>${ssrInterpolate(crumb.label)}</button><!--]-->`);
        });
        _push(`<!--]--></nav>`);
      } else {
        _push(`<!---->`);
      }
      if (!collectionPanelVisible.value) {
        _push(`<div class="flex items-center bg-black/40 border border-white/10 rounded-md overflow-hidden shrink-0 h-[28px] shadow-lg backdrop-blur-sm" data-v-671c678b>`);
        if (currentFile.value) {
          _push(`<button class="flex items-center gap-2 px-3 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-wider transition-all border-r border-white/5" data-v-671c678b><i class="pi pi-save text-[10px]" data-v-671c678b></i><span data-v-671c678b>Salvar</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="flex items-center gap-2 px-3 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-wider transition-all border-r border-white/5" title="Visualizar no Site" data-v-671c678b><i class="pi pi-eye text-[10px]" data-v-671c678b></i><span data-v-671c678b>Preview</span></button><button class="flex items-center gap-2 px-3 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-wider transition-all" title="Enviar para Produção" data-v-671c678b><i class="pi pi-cloud-upload text-[10px]" data-v-671c678b></i><span data-v-671c678b>Publicar</span></button><button class="flex items-center gap-2 px-3 h-full text-slate-300 hover:text-white hover:bg-white/10 font-black text-[9px] uppercase tracking-wider transition-all" title="Enviar para Produção" data-v-671c678b><i class="pi pi-cloud-upload text-[10px]" data-v-671c678b></i><span data-v-671c678b>Ver site</span></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "workspace-content", {}, () => {
        _push(`<div class="flex-1 flex flex-row overflow-hidden relative w-full h-full" data-v-671c678b><div class="flex-1 flex flex-col bg-[#0a0f0d] min-w-0 h-full relative" data-v-671c678b>`);
        if (collectionPanelVisible.value) {
          _push(ssrRenderComponent(CollectionFiles, {
            files: mainFiles.value,
            "current-folder": mainFolder.value,
            onSelect: handleNavigate.loadFile,
            onCreateItem: ($event) => createActions.openFile(mainFolder.value),
            onRefresh: handleNavigate.refresh
          }, null, _parent));
        } else if (currentFile.value) {
          _push(ssrRenderComponent(_sfc_main$6, {
            ref: "markdownEditorRef",
            class: "w-full h-full",
            content: fileData.value.content,
            "onUpdate:content": ($event) => fileData.value.content = $event,
            "site-context": unref(siteContext),
            "current-folder": mainFolder.value,
            "current-file": currentFile.value,
            onToggleRaw: ($event) => isRawMode.value = !isRawMode.value,
            "is-raw-mode": isRawMode.value,
            onOpenImage: ($event) => imageActions.open()
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (showMetaSidebar.value && !collectionPanelVisible.value) {
          _push(`<div class="flex flex-row h-full shrink-0" data-v-671c678b><div class="w-[4px] h-full cursor-col-resize hover:bg-[#6f942e] bg-black/40 z-20 shrink-0 flex items-center justify-center group relative" data-v-671c678b><div class="w-[1px] h-8 bg-white/20 group-hover:bg-white/80 rounded-full" data-v-671c678b></div></div><div class="flex flex-col bg-[#141b18] border-l border-white/5 h-full transition-all duration-300" style="${ssrRenderStyle({
            width: isFrontmatterCollapsed.value ? "48px" : frontmatterWidth.value + "px"
          })}" data-v-671c678b><div class="flex-1 flex flex-col overflow-hidden h-full w-full" data-v-671c678b>`);
          if (currentFile.value && fields.value.length > 0) {
            _push(ssrRenderComponent(_sfc_main$7, {
              modelValue: fileData.value.frontmatter,
              frontmatter: fileData.value.frontmatter,
              fields: fields.value,
              "site-context": unref(siteContext),
              "current-folder": mainFolder.value,
              "site-url": userSiteUrl.value,
              "is-collapsed": isFrontmatterCollapsed.value,
              onUpdateSchema: ($event) => fileData.value.frontmatter.schema = $event,
              onToggleCollapse: ($event) => isFrontmatterCollapsed.value = !isFrontmatterCollapsed.value,
              onOpenImage: imageActions.open,
              class: "h-full w-full"
            }, null, _parent));
          } else {
            _push(`<div class="p-4 text-xs text-slate-500 text-center flex flex-col items-center justify-center h-full gap-2" data-v-671c678b><i class="pi pi-cog text-2xl opacity-20" data-v-671c678b></i><p style="${ssrRenderStyle(!isFrontmatterCollapsed.value ? null : { display: "none" })}" data-v-671c678b>${ssrInterpolate(currentFile.value ? "Sem campos configurados." : "Selecione um arquivo.")}</p></div>`);
          }
          _push(`</div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isResizingFrontmatter.value) {
          _push(`<div class="fixed inset-0 z-50 cursor-col-resize bg-transparent" data-v-671c678b></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }, _push, _parent);
      _push(`</main></div>`);
      if (isPreviewMode.value) {
        _push(`<div class="flex-1 flex flex-col bg-white relative" data-v-671c678b><iframe${ssrRenderAttr("src", previewUrl.value)} class="w-full h-full border-0" data-v-671c678b></iframe></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showImageModal.value,
        "onUpdate:visible": ($event) => showImageModal.value = $event,
        modal: "",
        header: "Mídia",
        showHeader: true,
        style: { width: "90vw", maxWidth: "1200px" },
        contentStyle: { padding: "0", height: "80vh" },
        class: "bg-[#141b18]",
        dismissableMask: true,
        appendTo: "body"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-full h-full bg-[#141b18] flex flex-col text-white" data-v-671c678b${_scopeId}>`);
            if (!showImageModal.value) {
              _push2(`<div data-v-671c678b${_scopeId}>Carregando...</div>`);
            } else {
              _push2(`<!---->`);
            }
            if (showImageModal.value) {
              _push2(ssrRenderComponent(ImageExplorer, {
                "initial-folder": editorCtxFolder.value || "content",
                onSelect: imageActions.handleSelect,
                onClose: ($event) => showImageModal.value = false
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "w-full h-full bg-[#141b18] flex flex-col text-white" }, [
                !showImageModal.value ? (openBlock(), createBlock("div", { key: 0 }, "Carregando...")) : createCommentVNode("", true),
                showImageModal.value ? (openBlock(), createBlock(ImageExplorer, {
                  key: 1,
                  "initial-folder": editorCtxFolder.value || "content",
                  onSelect: imageActions.handleSelect,
                  onClose: ($event) => showImageModal.value = false
                }, null, 8, ["initial-folder", "onSelect", "onClose"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_sfc_main$4, {
        visible: showCreateModal.value,
        "onUpdate:visible": ($event) => showCreateModal.value = $event,
        "site-context": unref(siteContext),
        "current-folder": creationTargetFolder.value,
        onSuccess: createActions.onFileCreated
      }, null, _parent));
      _push(ssrRenderComponent(CreateFolderModal, {
        visible: showFolderCreateModal.value,
        "onUpdate:visible": ($event) => showFolderCreateModal.value = $event,
        "site-context": unref(siteContext),
        "current-folder": sidebarFolder.value,
        onSuccess: createActions.onFolderCreated
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$2, {
        visible: showCollectionCreateModal.value,
        "onUpdate:visible": ($event) => showCollectionCreateModal.value = $event,
        "site-context": unref(siteContext),
        "current-folder": sidebarFolder.value,
        onRefresh: handleNavigate.refresh,
        onSuccess: createActions.onCollectionCreated
      }, null, _parent));
      _push(ssrRenderComponent(_component_Dialog, {
        visible: showBackupModal.value,
        "onUpdate:visible": ($event) => showBackupModal.value = $event,
        modal: "",
        header: "Backups",
        style: { width: "800px" },
        class: "bg-[#141b18]"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(BackupManager, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(BackupManager)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="fixed bottom-8 right-4 z-[9999] w-172 bg-black/80 border border-white/10 rounded-lg p-2 font-mono text-[10px] pointer-events-none opacity-50 hidden" data-v-671c678b><!--[-->`);
      ssrRenderList(debugLogs.value, (log, i) => {
        _push(`<div class="truncate text-slate-300" data-v-671c678b> &gt; ${ssrInterpolate(log)}</div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/editor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const editor = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-671c678b"]]);

export { editor as default };
//# sourceMappingURL=editor-BiLtMOI3.mjs.map
