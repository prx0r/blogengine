module.exports=[20916,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ReadonlyURLSearchParams",{enumerable:!0,get:function(){return e}});class d extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams")}}class e extends URLSearchParams{append(){throw new d}delete(){throw new d}set(){throw new d}sort(){throw new d}}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},21170,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"RedirectStatusCode",{enumerable:!0,get:function(){return e}});var d,e=((d={})[d.SeeOther=303]="SeeOther",d[d.TemporaryRedirect=307]="TemporaryRedirect",d[d.PermanentRedirect=308]="PermanentRedirect",d);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},28859,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={REDIRECT_ERROR_CODE:function(){return g},isRedirectError:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(21170),g="NEXT_REDIRECT";function h(a){if("object"!=typeof a||null===a||!("digest"in a)||"string"!=typeof a.digest)return!1;let b=a.digest.split(";"),[c,d]=b,e=b.slice(2,-2).join(";"),h=Number(b.at(-2));return c===g&&("replace"===d||"push"===d)&&"string"==typeof e&&!isNaN(h)&&h in f.RedirectStatusCode}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},44868,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={getRedirectError:function(){return i},getRedirectStatusCodeFromError:function(){return n},getRedirectTypeFromError:function(){return m},getURLFromRedirectError:function(){return l},permanentRedirect:function(){return k},redirect:function(){return j}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(21170),g=a.r(28859),h=a.r(20635).actionAsyncStorage;function i(a,b,c=f.RedirectStatusCode.TemporaryRedirect){let d=Object.defineProperty(Error(g.REDIRECT_ERROR_CODE),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return d.digest=`${g.REDIRECT_ERROR_CODE};${b};${a};${c};`,d}function j(a,b){throw i(a,b??=h?.getStore()?.isAction?"push":"replace",f.RedirectStatusCode.TemporaryRedirect)}function k(a,b="replace"){throw i(a,b,f.RedirectStatusCode.PermanentRedirect)}function l(a){return(0,g.isRedirectError)(a)?a.digest.split(";").slice(2,-2).join(";"):null}function m(a){if(!(0,g.isRedirectError)(a))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return a.digest.split(";",2)[1]}function n(a){if(!(0,g.isRedirectError)(a))throw Object.defineProperty(Error("Not a redirect error"),"__NEXT_ERROR_CODE",{value:"E260",enumerable:!1,configurable:!0});return Number(a.digest.split(";").at(-2))}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},89798,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={HTTPAccessErrorStatus:function(){return f},HTTP_ERROR_FALLBACK_ERROR_CODE:function(){return h},getAccessFallbackErrorTypeByStatus:function(){return k},getAccessFallbackHTTPStatus:function(){return j},isHTTPAccessFallbackError:function(){return i}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f={NOT_FOUND:404,FORBIDDEN:403,UNAUTHORIZED:401},g=new Set(Object.values(f)),h="NEXT_HTTP_ERROR_FALLBACK";function i(a){if("object"!=typeof a||null===a||!("digest"in a)||"string"!=typeof a.digest)return!1;let[b,c]=a.digest.split(";");return b===h&&g.has(Number(c))}function j(a){return Number(a.digest.split(";")[1])}function k(a){switch(a){case 401:return"unauthorized";case 403:return"forbidden";case 404:return"not-found";default:return}}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},16155,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"notFound",{enumerable:!0,get:function(){return f}});let d=a.r(89798),e=`${d.HTTP_ERROR_FALLBACK_ERROR_CODE};404`;function f(){let a=Object.defineProperty(Error(e),"__NEXT_ERROR_CODE",{value:"E1041",enumerable:!1,configurable:!0});throw a.digest=e,a}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},34557,(a,b,c)=>{"use strict";function d(){throw Object.defineProperty(Error("`forbidden()` is experimental and only allowed to be enabled when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E488",enumerable:!1,configurable:!0})}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"forbidden",{enumerable:!0,get:function(){return d}}),a.r(89798).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},93845,(a,b,c)=>{"use strict";function d(){throw Object.defineProperty(Error("`unauthorized()` is experimental and only allowed to be used when `experimental.authInterrupts` is enabled."),"__NEXT_ERROR_CODE",{value:"E411",enumerable:!1,configurable:!0})}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"unauthorized",{enumerable:!0,get:function(){return d}}),a.r(89798).HTTP_ERROR_FALLBACK_ERROR_CODE,("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},28340,(a,b,c)=>{"use strict";function d(){let a,b,c=new Promise((c,d)=>{a=c,b=d});return{resolve:a,reject:b,promise:c}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"createPromiseWithResolvers",{enumerable:!0,get:function(){return d}})},31382,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d,e={RenderStage:function(){return i},StagedRenderingController:function(){return j}};for(var f in e)Object.defineProperty(c,f,{enumerable:!0,get:e[f]});let g=a.r(50640),h=a.r(28340);var i=((d={})[d.Before=1]="Before",d[d.EarlyStatic=2]="EarlyStatic",d[d.Static=3]="Static",d[d.EarlyRuntime=4]="EarlyRuntime",d[d.Runtime=5]="Runtime",d[d.Dynamic=6]="Dynamic",d[d.Abandoned=7]="Abandoned",d);class j{constructor(a,b,c){this.abortSignal=a,this.abandonController=b,this.shouldTrackSyncIO=c,this.currentStage=1,this.syncInterruptReason=null,this.staticStageEndTime=1/0,this.runtimeStageEndTime=1/0,this.staticStageListeners=[],this.earlyRuntimeStageListeners=[],this.runtimeStageListeners=[],this.dynamicStageListeners=[],this.staticStagePromise=(0,h.createPromiseWithResolvers)(),this.earlyRuntimeStagePromise=(0,h.createPromiseWithResolvers)(),this.runtimeStagePromise=(0,h.createPromiseWithResolvers)(),this.dynamicStagePromise=(0,h.createPromiseWithResolvers)(),a&&a.addEventListener("abort",()=>{let{reason:b}=a;this.staticStagePromise.promise.catch(k),this.staticStagePromise.reject(b),this.earlyRuntimeStagePromise.promise.catch(k),this.earlyRuntimeStagePromise.reject(b),this.runtimeStagePromise.promise.catch(k),this.runtimeStagePromise.reject(b),this.dynamicStagePromise.promise.catch(k),this.dynamicStagePromise.reject(b)},{once:!0}),b&&b.signal.addEventListener("abort",()=>{this.abandonRender()},{once:!0})}onStage(a,b){if(this.currentStage>=a)b();else if(3===a)this.staticStageListeners.push(b);else if(4===a)this.earlyRuntimeStageListeners.push(b);else if(5===a)this.runtimeStageListeners.push(b);else if(6===a)this.dynamicStageListeners.push(b);else throw Object.defineProperty(new g.InvariantError(`Invalid render stage: ${a}`),"__NEXT_ERROR_CODE",{value:"E881",enumerable:!1,configurable:!0})}shouldTrackSyncInterrupt(){if(!this.shouldTrackSyncIO)return!1;switch(this.currentStage){case 1:case 5:case 6:case 7:default:return!1;case 2:case 3:case 4:return!0}}syncInterruptCurrentStageWithReason(a){if(1!==this.currentStage&&7!==this.currentStage){if(this.abandonController)return void this.abandonController.abort();if(this.abortSignal){this.syncInterruptReason=a,this.currentStage=7;return}switch(this.currentStage){case 2:case 3:case 4:this.syncInterruptReason=a,this.advanceStage(6);return;case 5:return}}}getSyncInterruptReason(){return this.syncInterruptReason}getStaticStageEndTime(){return this.staticStageEndTime}getRuntimeStageEndTime(){return this.runtimeStageEndTime}abandonRender(){let{currentStage:a}=this;switch(a){case 2:this.resolveStaticStage();case 3:this.resolveEarlyRuntimeStage();case 4:this.resolveRuntimeStage();case 5:this.currentStage=7;return}}advanceStage(a){if(a<=this.currentStage)return;let b=this.currentStage;if(this.currentStage=a,b<3&&a>=3&&this.resolveStaticStage(),b<4&&a>=4&&this.resolveEarlyRuntimeStage(),b<5&&a>=5&&(this.staticStageEndTime=performance.now()+performance.timeOrigin,this.resolveRuntimeStage()),b<6&&a>=6){this.runtimeStageEndTime=performance.now()+performance.timeOrigin,this.resolveDynamicStage();return}}resolveStaticStage(){let a=this.staticStageListeners;for(let b=0;b<a.length;b++)a[b]();a.length=0,this.staticStagePromise.resolve()}resolveEarlyRuntimeStage(){let a=this.earlyRuntimeStageListeners;for(let b=0;b<a.length;b++)a[b]();a.length=0,this.earlyRuntimeStagePromise.resolve()}resolveRuntimeStage(){let a=this.runtimeStageListeners;for(let b=0;b<a.length;b++)a[b]();a.length=0,this.runtimeStagePromise.resolve()}resolveDynamicStage(){let a=this.dynamicStageListeners;for(let b=0;b<a.length;b++)a[b]();a.length=0,this.dynamicStagePromise.resolve()}getStagePromise(a){switch(a){case 3:return this.staticStagePromise.promise;case 4:return this.earlyRuntimeStagePromise.promise;case 5:return this.runtimeStagePromise.promise;case 6:return this.dynamicStagePromise.promise;default:throw Object.defineProperty(new g.InvariantError(`Invalid render stage: ${a}`),"__NEXT_ERROR_CODE",{value:"E881",enumerable:!1,configurable:!0})}}waitForStage(a){return this.getStagePromise(a)}delayUntilStage(a,b,c){var d,e,f;let g,h=(d=this.getStagePromise(a),e=b,f=c,g=new Promise((a,b)=>{d.then(a.bind(null,f),b)}),void 0!==e&&(g.displayName=e),g);return this.abortSignal&&h.catch(k),h}}function k(){}},13091,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={delayUntilRuntimeStage:function(){return o},getRuntimeStage:function(){return n},isHangingPromiseRejectionError:function(){return g},makeDevtoolsIOAwarePromise:function(){return m},makeHangingPromise:function(){return k}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(31382);function g(a){return"object"==typeof a&&null!==a&&"digest"in a&&a.digest===h}let h="HANGING_PROMISE_REJECTION";class i extends Error{constructor(a,b){super(`During prerendering, ${b} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${b} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${a}".`),this.route=a,this.expression=b,this.digest=h}}let j=new WeakMap;function k(a,b,c){if(a.aborted)return Promise.reject(new i(b,c));{let d=new Promise((d,e)=>{let f=e.bind(null,new i(b,c)),g=j.get(a);if(g)g.push(f);else{let b=[f];j.set(a,b),a.addEventListener("abort",()=>{for(let a=0;a<b.length;a++)b[a]()},{once:!0})}});return d.catch(l),d}}function l(){}function m(a,b,c){return b.stagedRendering?b.stagedRendering.delayUntilStage(c,void 0,a):new Promise(b=>{setTimeout(()=>{b(a)},0)})}function n(a){return a.currentStage===f.RenderStage.EarlyStatic||a.currentStage===f.RenderStage.EarlyRuntime?f.RenderStage.EarlyRuntime:f.RenderStage.Runtime}function o(a,b){let{stagedRendering:c}=a;return c?c.waitForStage(n(c)).then(()=>b):b}},73808,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isPostpone",{enumerable:!0,get:function(){return e}});let d=Symbol.for("react.postpone");function e(a){return"object"==typeof a&&null!==a&&a.$$typeof===d}},49640,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={BailoutToCSRError:function(){return g},isBailoutToCSRError:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f="BAILOUT_TO_CLIENT_SIDE_RENDERING";class g extends Error{constructor(a){super(`Bail out to client-side rendering: ${a}`),this.reason=a,this.digest=f}}function h(a){return"object"==typeof a&&null!==a&&"digest"in a&&a.digest===f}},1567,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isNextRouterError",{enumerable:!0,get:function(){return f}});let d=a.r(89798),e=a.r(28859);function f(a){return(0,e.isRedirectError)(a)||(0,d.isHTTPAccessFallbackError)(a)}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},96556,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={DynamicServerError:function(){return g},isDynamicServerError:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f="DYNAMIC_SERVER_USAGE";class g extends Error{constructor(a){super(`Dynamic server usage: ${a}`),this.description=a,this.digest=f}}function h(a){return"object"==typeof a&&null!==a&&"digest"in a&&"string"==typeof a.digest&&a.digest===f}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},60312,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={StaticGenBailoutError:function(){return g},isStaticGenBailoutError:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f="NEXT_STATIC_GEN_BAILOUT";class g extends Error{constructor(...a){super(...a),this.code=f}}function h(a){return"object"==typeof a&&null!==a&&"code"in a&&a.code===f}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},17491,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={METADATA_BOUNDARY_NAME:function(){return f},OUTLET_BOUNDARY_NAME:function(){return h},ROOT_LAYOUT_BOUNDARY_NAME:function(){return i},VIEWPORT_BOUNDARY_NAME:function(){return g}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f="__next_metadata_boundary__",g="__next_viewport_boundary__",h="__next_outlet_boundary__",i="__next_root_layout_boundary__"},61933,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={atLeastOneTask:function(){return h},scheduleImmediate:function(){return g},scheduleOnNextTick:function(){return f},waitAtLeastOneReactRenderTask:function(){return i}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a=>{Promise.resolve().then(()=>{process.nextTick(a)})},g=a=>{setImmediate(a)};function h(){return new Promise(a=>g(a))}function i(){return new Promise(a=>setImmediate(a))}},99195,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"INSTANT_VALIDATION_BOUNDARY_NAME",{enumerable:!0,get:function(){return d}});let d="__next_instant_validation_boundary__"},60384,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d,e,f,g={DynamicHoleKind:function(){return $},Postpone:function(){return D},PreludeState:function(){return af},abortAndThrowOnSynchronousRequestDataAccess:function(){return C},abortOnSynchronousPlatformIOAccess:function(){return B},accessedDynamicData:function(){return L},annotateDynamicAccess:function(){return Q},consumeDynamicAccess:function(){return M},createDynamicTrackingState:function(){return u},createDynamicValidationState:function(){return v},createHangingInputAbortSignal:function(){return P},createInstantValidationState:function(){return _},createRenderInBrowserAbortSignal:function(){return O},formatDynamicAPIAccesses:function(){return N},getFirstDynamicReason:function(){return w},getNavigationDisallowedDynamicReasons:function(){return aj},getStaticShellDisallowedDynamicReasons:function(){return ai},isDynamicPostpone:function(){return G},isPrerenderInterruptedError:function(){return K},logDisallowedDynamicError:function(){return ag},markCurrentScopeAsDynamic:function(){return x},postponeWithTracking:function(){return E},throwIfDisallowedDynamic:function(){return ah},throwToInterruptStaticGeneration:function(){return y},trackAllowedDynamicAccess:function(){return Z},trackDynamicDataInDynamicRender:function(){return z},trackDynamicHoleInNavigation:function(){return aa},trackDynamicHoleInRuntimeShell:function(){return ac},trackDynamicHoleInStaticShell:function(){return ad},trackThrownErrorInNavigation:function(){return ab},useDynamicRouteParams:function(){return R},useDynamicSearchParams:function(){return S}};for(var h in g)Object.defineProperty(c,h,{enumerable:!0,get:g[h]});let i=(d=a.r(717))&&d.__esModule?d:{default:d},j=a.r(96556),k=a.r(60312),l=a.r(32319),m=a.r(56704),n=a.r(13091),o=a.r(17491),p=a.r(61933),q=a.r(49640),r=a.r(50640),s=a.r(99195),t="function"==typeof i.default.unstable_postpone;function u(a){return{isDebugDynamicAccesses:a,dynamicAccesses:[],syncDynamicErrorWithStack:null}}function v(){return{hasSuspenseAboveBody:!1,hasDynamicMetadata:!1,dynamicMetadata:null,hasDynamicViewport:!1,hasAllowedDynamic:!1,dynamicErrors:[]}}function w(a){var b;return null==(b=a.dynamicAccesses[0])?void 0:b.expression}function x(a,b,c){if(b)switch(b.type){case"cache":case"unstable-cache":case"private-cache":return}if(!a.forceDynamic&&!a.forceStatic){if(a.dynamicShouldError)throw Object.defineProperty(new k.StaticGenBailoutError(`Route ${a.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${c}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`),"__NEXT_ERROR_CODE",{value:"E553",enumerable:!1,configurable:!0});if(b)switch(b.type){case"prerender-ppr":return E(a.route,c,b.dynamicTracking);case"prerender-legacy":b.revalidate=0;let d=Object.defineProperty(new j.DynamicServerError(`Route ${a.route} couldn't be rendered statically because it used ${c}. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`),"__NEXT_ERROR_CODE",{value:"E550",enumerable:!1,configurable:!0});throw a.dynamicUsageDescription=c,a.dynamicUsageStack=d.stack,d}}}function y(a,b,c){let d=Object.defineProperty(new j.DynamicServerError(`Route ${b.route} couldn't be rendered statically because it used \`${a}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`),"__NEXT_ERROR_CODE",{value:"E558",enumerable:!1,configurable:!0});throw c.revalidate=0,b.dynamicUsageDescription=a,b.dynamicUsageStack=d.stack,d}function z(a){switch(a.type){case"cache":case"unstable-cache":case"private-cache":return}}function A(a,b,c){let d=J(`Route ${a} needs to bail out of prerendering at this point because it used ${b}.`);c.controller.abort(d);let e=c.dynamicTracking;e&&e.dynamicAccesses.push({stack:e.isDebugDynamicAccesses?Error().stack:void 0,expression:b})}function B(a,b,c,d){let e=d.dynamicTracking;A(a,b,d),e&&null===e.syncDynamicErrorWithStack&&(e.syncDynamicErrorWithStack=c)}function C(a,b,c,d){if(!1===d.controller.signal.aborted){A(a,b,d);let e=d.dynamicTracking;e&&null===e.syncDynamicErrorWithStack&&(e.syncDynamicErrorWithStack=c)}throw J(`Route ${a} needs to bail out of prerendering at this point because it used ${b}.`)}function D({reason:a,route:b}){let c=l.workUnitAsyncStorage.getStore();E(b,a,c&&"prerender-ppr"===c.type?c.dynamicTracking:null)}function E(a,b,c){(function(){if(!t)throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"),"__NEXT_ERROR_CODE",{value:"E224",enumerable:!1,configurable:!0})})(),c&&c.dynamicAccesses.push({stack:c.isDebugDynamicAccesses?Error().stack:void 0,expression:b}),i.default.unstable_postpone(F(a,b))}function F(a,b){return`Route ${a} needs to bail out of prerendering at this point because it used ${b}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`}function G(a){return"object"==typeof a&&null!==a&&"string"==typeof a.message&&H(a.message)}function H(a){return a.includes("needs to bail out of prerendering at this point because it used")&&a.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error")}if(!1===H(F("%%%","^^^")))throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"),"__NEXT_ERROR_CODE",{value:"E296",enumerable:!1,configurable:!0});let I="NEXT_PRERENDER_INTERRUPTED";function J(a){let b=Object.defineProperty(Error(a),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});return b.digest=I,b}function K(a){return"object"==typeof a&&null!==a&&a.digest===I&&"name"in a&&"message"in a&&a instanceof Error}function L(a){return a.length>0}function M(a,b){return a.dynamicAccesses.push(...b.dynamicAccesses),a.dynamicAccesses}function N(a){return a.filter(a=>"string"==typeof a.stack&&a.stack.length>0).map(({expression:a,stack:b})=>(b=b.split("\n").slice(4).filter(a=>!(a.includes("node_modules/next/")||a.includes(" (<anonymous>)")||a.includes(" (node:"))).join("\n"),`Dynamic API Usage Debug - ${a}:
${b}`))}function O(){let a=new AbortController;return a.abort(Object.defineProperty(new q.BailoutToCSRError("Render in Browser"),"__NEXT_ERROR_CODE",{value:"E721",enumerable:!1,configurable:!0})),a.signal}function P(a){switch(a.type){case"prerender":case"prerender-runtime":let b=new AbortController;if(a.cacheSignal)a.cacheSignal.inputReady().then(()=>{b.abort()});else if("prerender-runtime"===a.type&&a.stagedRendering){let{stagedRendering:c}=a;c.waitForStage((0,n.getRuntimeStage)(c)).then(()=>(0,p.scheduleOnNextTick)(()=>b.abort()))}else(0,p.scheduleOnNextTick)(()=>b.abort());return b.signal;case"prerender-client":case"validation-client":case"prerender-ppr":case"prerender-legacy":case"request":case"cache":case"private-cache":case"unstable-cache":case"generate-static-params":return}}function Q(a,b){let c=b.dynamicTracking;c&&c.dynamicAccesses.push({stack:c.isDebugDynamicAccesses?Error().stack:void 0,expression:a})}function R(a){let b=m.workAsyncStorage.getStore(),c=l.workUnitAsyncStorage.getStore();if(b&&c)switch(c.type){case"prerender-client":case"prerender":{let d=c.fallbackRouteParams;d&&d.size>0&&i.default.use((0,n.makeHangingPromise)(c.renderSignal,b.route,a));break}case"prerender-ppr":{let d=c.fallbackRouteParams;if(d&&d.size>0)return E(b.route,a,c.dynamicTracking);break}case"validation-client":case"prerender-legacy":case"request":case"unstable-cache":break;case"prerender-runtime":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called during a runtime prerender. Next.js should be preventing ${a} from being included in server components statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E771",enumerable:!1,configurable:!0});case"cache":case"private-cache":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called inside a cache scope. Next.js should be preventing ${a} from being included in server components statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E745",enumerable:!1,configurable:!0});case"generate-static-params":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called in \`generateStaticParams\`. Next.js should be preventing ${a} from being included in server component files statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E1130",enumerable:!1,configurable:!0})}}function S(a){let b=m.workAsyncStorage.getStore(),c=l.workUnitAsyncStorage.getStore();if(b)switch(!c&&(0,l.throwForMissingRequestStore)(a),c.type){case"validation-client":case"request":return;case"prerender-client":i.default.use((0,n.makeHangingPromise)(c.renderSignal,b.route,a));break;case"prerender-legacy":case"prerender-ppr":if(b.forceStatic)return;throw Object.defineProperty(new q.BailoutToCSRError(a),"__NEXT_ERROR_CODE",{value:"E394",enumerable:!1,configurable:!0});case"prerender":case"prerender-runtime":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called from a Server Component. Next.js should be preventing ${a} from being included in server components statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E795",enumerable:!1,configurable:!0});case"cache":case"unstable-cache":case"private-cache":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called inside a cache scope. Next.js should be preventing ${a} from being included in server components statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E745",enumerable:!1,configurable:!0});case"generate-static-params":throw Object.defineProperty(new r.InvariantError(`\`${a}\` was called in \`generateStaticParams\`. Next.js should be preventing ${a} from being included in server component files statically, but did not in this case.`),"__NEXT_ERROR_CODE",{value:"E1130",enumerable:!1,configurable:!0})}}let T=/\n\s+at Suspense \(<anonymous>\)/,U=RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at ${o.ROOT_LAYOUT_BOUNDARY_NAME} \\([^\\n]*\\)`),V=RegExp(`\\n\\s+at ${o.METADATA_BOUNDARY_NAME}[\\n\\s]`),W=RegExp(`\\n\\s+at ${o.VIEWPORT_BOUNDARY_NAME}[\\n\\s]`),X=RegExp(`\\n\\s+at ${o.OUTLET_BOUNDARY_NAME}[\\n\\s]`),Y=RegExp(`\\n\\s+at ${s.INSTANT_VALIDATION_BOUNDARY_NAME}[\\n\\s]`);function Z(a,b,c,d){if(!X.test(b)){if(V.test(b)){c.hasDynamicMetadata=!0;return}if(W.test(b)){c.hasDynamicViewport=!0;return}if(U.test(b)){c.hasAllowedDynamic=!0,c.hasSuspenseAboveBody=!0;return}else if(T.test(b)){c.hasAllowedDynamic=!0;return}else{if(d.syncDynamicErrorWithStack)return void c.dynamicErrors.push(d.syncDynamicErrorWithStack);let e=ae(Object.defineProperty(Error(`Route "${a.route}": Uncached data was accessed outside of <Suspense>. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`),"__NEXT_ERROR_CODE",{value:"E1079",enumerable:!1,configurable:!0}),b,null);return void c.dynamicErrors.push(e)}}}var $=((e={})[e.Runtime=1]="Runtime",e[e.Dynamic=2]="Dynamic",e);function _(a){return{hasDynamicMetadata:!1,hasAllowedClientDynamicAboveBoundary:!1,dynamicMetadata:null,hasDynamicViewport:!1,hasAllowedDynamic:!1,dynamicErrors:[],validationPreventingErrors:[],thrownErrorsOutsideBoundary:[],createInstantStack:a}}function aa(a,b,c,d,e,f){if(X.test(b))return;if(V.test(b)){let d=ae(Object.defineProperty(Error(`Route "${a.route}": ${1===e?"Runtime data such as `cookies()`, `headers()`, `params`, or `searchParams` was accessed inside `generateMetadata` or you have file-based metadata such as icons that depend on dynamic params segments.":"Uncached data or `connection()` was accessed inside `generateMetadata`."} Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`),"__NEXT_ERROR_CODE",{value:"E1076",enumerable:!1,configurable:!0}),b,c.createInstantStack);c.dynamicMetadata=d;return}if(W.test(b)){let d=ae(Object.defineProperty(Error(`Route "${a.route}": ${1===e?"Runtime data such as `cookies()`, `headers()`, `params`, or `searchParams` was accessed inside `generateViewport`.":"Uncached data or `connection()` was accessed inside `generateViewport`."} This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`),"__NEXT_ERROR_CODE",{value:"E1086",enumerable:!1,configurable:!0}),b,c.createInstantStack);c.dynamicErrors.push(d);return}let g=Y.exec(b);if(g){let a=T.exec(b);if(a&&a.index<g.index){c.hasAllowedDynamic=!0;return}}else if(f.expectedIds.size===f.renderedIds.size){c.hasAllowedClientDynamicAboveBoundary=!0,c.hasAllowedDynamic=!0;return}else{let d=ae(Object.defineProperty(Error(`Route "${a.route}": Could not validate \`unstable_instant\` because a Client Component in a parent segment prevented the page from rendering.`),"__NEXT_ERROR_CODE",{value:"E1082",enumerable:!1,configurable:!0}),b,c.createInstantStack);c.validationPreventingErrors.push(d);return}if(d.syncDynamicErrorWithStack){let a=d.syncDynamicErrorWithStack;null!==c.createInstantStack&&void 0===a.cause&&(a.cause=c.createInstantStack()),c.dynamicErrors.push(a);return}let h=ae(Object.defineProperty(Error(`Route "${a.route}": ${1===e?"Runtime data such as `cookies()`, `headers()`, `params`, or `searchParams` was accessed outside of `<Suspense>`.":"Uncached data or `connection()` was accessed outside of `<Suspense>`."} This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`),"__NEXT_ERROR_CODE",{value:"E1078",enumerable:!1,configurable:!0}),b,c.createInstantStack);c.dynamicErrors.push(h)}function ab(a,b,c,d){let e=Y.exec(d);if(e){let f=T.exec(d);if(f&&f.index<e.index)return;let g=ae(Object.defineProperty(Error(`Route "${a.route}": Could not validate \`unstable_instant\` because an error prevented the target segment from rendering.`,{cause:c}),"__NEXT_ERROR_CODE",{value:"E1112",enumerable:!1,configurable:!0}),d,null);b.validationPreventingErrors.push(g)}else{let a=ae(Object.defineProperty(Error("An error occurred while attempting to validate instant UI. This error may be preventing the validation from completing.",{cause:c}),"__NEXT_ERROR_CODE",{value:"E1118",enumerable:!1,configurable:!0}),d,null);b.thrownErrorsOutsideBoundary.push(a)}}function ac(a,b,c,d){if(X.test(b))return;if(V.test(b)){c.dynamicMetadata=ae(Object.defineProperty(Error(`Route "${a.route}": Uncached data or \`connection()\` was accessed inside \`generateMetadata\`. Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`),"__NEXT_ERROR_CODE",{value:"E1080",enumerable:!1,configurable:!0}),b,null);return}if(W.test(b)){let d=ae(Object.defineProperty(Error(`Route "${a.route}": Uncached data or \`connection()\` was accessed inside \`generateViewport\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`),"__NEXT_ERROR_CODE",{value:"E1077",enumerable:!1,configurable:!0}),b,null);c.dynamicErrors.push(d);return}if(U.test(b)){c.hasAllowedDynamic=!0,c.hasSuspenseAboveBody=!0;return}if(T.test(b)){c.hasAllowedDynamic=!0;return}else if(d.syncDynamicErrorWithStack)return void c.dynamicErrors.push(d.syncDynamicErrorWithStack);let e=ae(Object.defineProperty(Error(`Route "${a.route}": Uncached data or \`connection()\` was accessed outside of \`<Suspense>\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`),"__NEXT_ERROR_CODE",{value:"E1084",enumerable:!1,configurable:!0}),b,null);c.dynamicErrors.push(e)}function ad(a,b,c,d){if(!X.test(b)){if(V.test(b)){c.dynamicMetadata=ae(Object.defineProperty(Error(`Route "${a.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateMetadata\` or you have file-based metadata such as icons that depend on dynamic params segments. Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`),"__NEXT_ERROR_CODE",{value:"E1085",enumerable:!1,configurable:!0}),b,null);return}if(W.test(b)){let d=ae(Object.defineProperty(Error(`Route "${a.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateViewport\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`),"__NEXT_ERROR_CODE",{value:"E1081",enumerable:!1,configurable:!0}),b,null);c.dynamicErrors.push(d);return}if(U.test(b)){c.hasAllowedDynamic=!0,c.hasSuspenseAboveBody=!0;return}else if(T.test(b)){c.hasAllowedDynamic=!0;return}else{if(d.syncDynamicErrorWithStack)return void c.dynamicErrors.push(d.syncDynamicErrorWithStack);let e=ae(Object.defineProperty(Error(`Route "${a.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed outside of \`<Suspense>\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`),"__NEXT_ERROR_CODE",{value:"E1083",enumerable:!1,configurable:!0}),b,null);return void c.dynamicErrors.push(e)}}}function ae(a,b,c){return null!==c&&(a.cause=c()),a.stack=a.name+": "+a.message+b,a}var af=((f={})[f.Full=0]="Full",f[f.Empty=1]="Empty",f[f.Errored=2]="Errored",f);function ag(a,b){console.error(b),console.error(`To get a more detailed stack trace and pinpoint the issue, try one of the following:
  - Start the app in development mode by running \`next dev\`, then open "${a.route}" in your browser to investigate the error.
  - Rerun the production build with \`next build --debug-prerender\` to generate better stack traces.`)}function ah(a,b,c,d){if(d.syncDynamicErrorWithStack)throw ag(a,d.syncDynamicErrorWithStack),new k.StaticGenBailoutError;if(0!==b){if(c.hasSuspenseAboveBody)return;let d=c.dynamicErrors;if(d.length>0){for(let b=0;b<d.length;b++)ag(a,d[b]);throw new k.StaticGenBailoutError}if(c.hasDynamicViewport)throw console.error(`Route "${a.route}" has a \`generateViewport\` that depends on Request data (\`cookies()\`, etc...) or uncached external data (\`fetch(...)\`, etc...) without explicitly allowing fully dynamic rendering. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`),new k.StaticGenBailoutError;if(1===b)throw console.error(`Route "${a.route}" did not produce a static shell and Next.js was unable to determine a reason. This is a bug in Next.js.`),new k.StaticGenBailoutError}else if(!1===c.hasAllowedDynamic&&c.hasDynamicMetadata)throw console.error(`Route "${a.route}" has a \`generateMetadata\` that depends on Request data (\`cookies()\`, etc...) or uncached external data (\`fetch(...)\`, etc...) when the rest of the route does not. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`),new k.StaticGenBailoutError}function ai(a,b,c,d){if(d||c.hasSuspenseAboveBody)return[];if(0!==b){let d=c.dynamicErrors;if(d.length>0)return d;if(1===b)return[Object.defineProperty(new r.InvariantError(`Route "${a.route}" did not produce a static shell and Next.js was unable to determine a reason.`),"__NEXT_ERROR_CODE",{value:"E936",enumerable:!1,configurable:!0})]}else if(!1===c.hasAllowedDynamic&&0===c.dynamicErrors.length&&c.dynamicMetadata)return[c.dynamicMetadata];return[]}function aj(a,b,c,d,e){if(d){let{missingSampleErrors:a}=d;if(a.length>0)return a}let{validationPreventingErrors:f}=c;if(f.length>0)return f;if(e.renderedIds.size<e.expectedIds.size){let{thrownErrorsOutsideBoundary:b,createInstantStack:d}=c;if(0===b.length){let b=`Route "${a.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering for an unknown reason.`,c=null!==d?d():Error();return c.name="Error",c.message=b,[c]}if(1===b.length){let c=`Route "${a.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering, likely due to the following error.`,e=null!==d?d():Error();return e.name="Error",e.message=c,[e,b[0]]}{let c=`Route "${a.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering, likely due to one of the following errors.`,e=null!==d?d():Error();return e.name="Error",e.message=c,[e,...b]}}if(0!==b){let d=c.dynamicErrors;if(d.length>0)return d;if(1===b)return c.hasAllowedClientDynamicAboveBoundary?[]:[Object.defineProperty(new r.InvariantError(`Route "${a.route}" failed to render during instant validation and Next.js was unable to determine a reason.`),"__NEXT_ERROR_CODE",{value:"E1055",enumerable:!1,configurable:!0})]}else{let a=c.dynamicErrors;if(a.length>0)return a;if(!1===c.hasAllowedDynamic&&c.dynamicMetadata)return[c.dynamicMetadata]}return[]}},94783,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"unstable_rethrow",{enumerable:!0,get:function(){return function a(b){if((0,g.isNextRouterError)(b)||(0,f.isBailoutToCSRError)(b)||(0,i.isDynamicServerError)(b)||(0,h.isDynamicPostpone)(b)||(0,e.isPostpone)(b)||(0,d.isHangingPromiseRejectionError)(b)||(0,h.isPrerenderInterruptedError)(b))throw b;b instanceof Error&&"cause"in b&&a(b.cause)}}});let d=a.r(13091),e=a.r(73808),f=a.r(49640),g=a.r(1567),h=a.r(60384),i=a.r(96556);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},60968,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"unstable_rethrow",{enumerable:!0,get:function(){return d}});let d=a.r(94783).unstable_rethrow;("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},73727,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={ReadonlyURLSearchParams:function(){return f.ReadonlyURLSearchParams},RedirectType:function(){return m},forbidden:function(){return i.forbidden},notFound:function(){return h.notFound},permanentRedirect:function(){return g.permanentRedirect},redirect:function(){return g.redirect},unauthorized:function(){return j.unauthorized},unstable_isUnrecognizedActionError:function(){return l},unstable_rethrow:function(){return k.unstable_rethrow}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(20916),g=a.r(44868),h=a.r(16155),i=a.r(34557),j=a.r(93845),k=a.r(60968);function l(){throw Object.defineProperty(Error("`unstable_isUnrecognizedActionError` can only be used on the client."),"__NEXT_ERROR_CODE",{value:"E776",enumerable:!1,configurable:!0})}let m={push:"push",replace:"replace"};("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},790,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js <module evaluation>"))},84707,(a,b,c)=>{let{createClientModuleProxy:d}=a.r(11857);a.n(d("[project]/node_modules/next/dist/client/app-dir/link.js"))},97647,a=>{"use strict";a.i(790);var b=a.i(84707);a.n(b)},95936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return i},useLinkStatus:function(){return h.useLinkStatus}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(64240),g=a.r(7997),h=f._(a.r(97647));function i(a){let b=a.legacyBehavior,c="string"==typeof a.children||"number"==typeof a.children||"string"==typeof a.children?.type,d=a.children?.type?.$$typeof===Symbol.for("react.client.reference");return!b||c||d||(a.children?.type?.$$typeof===Symbol.for("react.lazy")?console.error("Using a Lazy Component as a direct child of `<Link legacyBehavior>` from a Server Component is not supported. If you need legacyBehavior, wrap your Lazy Component in a Client Component that renders the Link's `<a>` tag."):console.error("Using a Server Component as a direct child of `<Link legacyBehavior>` is not supported. If you need legacyBehavior, wrap your Server Component in a Client Component that renders the Link's `<a>` tag.")),(0,g.jsx)(h.default,{...a})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},40395,a=>{"use strict";var b=a.i(7997),c=a.i(73727),d=a.i(95936);let e=[{slug:"day-1",title:"Day 1",content:`A child has no conceptual filter, thus they are making contact with reality directly, interacting with it via their senses not through concepts.
The same way to understand a bouncy ball they play with it, throw it at a wall and put it in their mouth. Thats how we understand what a thing is
the child has no clue what a bouncy ball is but it will remember how to play with it and how to interact, over time this solidifies into a concept of
what a vouncy ball is, what it can do. you dont bounce the ball anymore because you dont see the point. you have gone from exploring the world of your
senses to a solidifed world of concepts in order to make sense of it and to organise activity. even when you bounce the ball you are thinking about
something else.

this is a natural progression and culturally would be frowned upon if adults walked around doing nothing but bounce balls and eat sweets. Culture is an
operating system that allows a person to exist as a recognised character within that OS based on available types or archetypes, e.g. finance bro.
These act as attractors that we can become in order to share in the benefits of being that character, e.g. i am finance bro so i have x image, i am
likely to act in this way and i can use this to mask parts of myself culture may not look upon well. within each culture there are status symbols,
in west it may be materialistic possessions, a family. in pai it might be the amount of piercings you have or how many retreats you have been on.
The message here is that our sense of self is moulded by culture as it shows us what the socially acceptable characters are and what is off limits.
e.g. me being queer but into football, i push down the queer part because in culture there are no queer footballers. My sense of who i am is formed
by cultural archtypes and my relationship to them and how i interpret my own self in relation to them. This means if i dont algin with a culture i
will feel shame and likely suffer without fully understanding why.

The fire simile:
fire = becoming, the taking of potentiality and igniting it so it becomes an existing thing. e.g. a seed for lust exists, come into contact with an
attractive object, that becomes desireable, you become fixated, this waters the seed and it becomes a plant with the function of fulfilling that desire

fuel / firewood  = whatever i see as me / mine. the potentialities that are able to become / come into existance. anything the mind can cling to
and attach identity to and proliferate the chain of becoming through feeling perception thoughts actions

extinguishing = not death. no longer supplying the fuel that gives rise to endless becoming. its not denying desire its seeing how desire exists
as a secondary function based on the existing potentials. if there was no potential to feel lust then you would not become a lustful self.

rebirth = the endless becoming of the self in different states, fulfilling endless desires. e.g. being reborn as a lustful self. Rebirth is endless
while the fuel has not been extinguished. once you remove the firewood the fire cannot come into existance. in the same way, once you remove craving
you are not reborn again. this means the mind is still and it is not birthed into a state of becoming. its not talking about life to life rebirth.
Its saying right now if you are hungry you do not become a hungry person and demand food, instead hunger arises and food is eaten, there is no
identity creation or weaving a narrative involved, no justifying, reinforcing beliefs and the whole structure of 'me' and the world.

karma = when becoming takes place, i am now a lustful self, i take action as that self and have sex. now what we have done is gone from this primary
notion of craving, felt the desire to relieve it, found a suitable object, become someone who can get that object, acted as that person who got the
object. now we have created that as a pathway as a working solution to deal with the craving. now next time we get it, the mind will follow this route
again. this is karma. now this pathway becomes conditioned / unconscious / default / autopilot. This increases the probability of the same craving
and mix of initial sensations and conditions leading to the same outcome / action. This solidifies into behaviour and a felt sense of self. This
pathway continues to operate outside of conscious awareness. This mechanism leads to suffering or happiness dependin on the routes you have programmed.
It constitutes your initial reaction when contacting unpleasant or pleasant sensations and the inclination to certain types of behaviours. Thus, your
initial reaction to events, sensations is conditioned / being processed by existing habitual pathways. Perhaps i sense a discomfort neautral boredom
and i get the thought i should have a cigarette. I have unconsciously not registered my mind is doing this i just get the resulting urge to smoke
the cigarette and i do. this reinforces the pattern even deeper. this is how your actions affect your future state. the goal is to actively become
aware of this process and weaken the pathways. you do this by staying with the unpleasant sensation beore it turn into the urge. you then stop feeding
the cyclical mechanism that doesnt resolve anything and recondition the pathway toward a solution where the unpleasant sensation is allowed to arise
and pass away, without action being taken that propogates it. by smoking every time u feel bad, you want a cigarette every time u feel bad. that bad
feeling is never actually processed because u are escaping it each time it wants to come up and be processed.I am saying , when neautral/unpleasant
emotion arises, leave the raw feeling and mediate with nicotine + ritual, strengthening the core pathway of avoiding negative sensation.
Thus a conditioned discomfort is being met by conditioned relief, the relief reinforces the need for itself. its a trap. its a cycle. its samsara.

samsara = not a metaphysical realm. it is the cyclic existance that perpetuates itself with no start or end. Unconscious relieving of a wound that by
doing so actually keeps it open. Like having an itchy scab, then picking it so it never heals. Or being thirsty and then drinking saltwater, it
relieves you for a second until you taste the salt and become even more thirsty. identity gets caught in these traps and stays conditioned by them.
meaning i am now a smoker, i smoke cigarettes when i need a break. not realising this isnt about the cigarettes its about habitaul response to
sensations and reality. seeing through the loops we are caught in = exiting samsara. you stay with the initial raw dicomfort instead of fueling the
determined mechanism. me smoking a cigarette increases the likelihood i will have one tomorrow in response to the same stimuli and vice versa.

Ignorance = mistaking I want a cigarette for a conditioned habitual response, i have no say in and already decided based on my previous total actions
or karma or all the habitual patterns i have enacted historically. The ending of ignorance is seeing how this arises. In doing so the spell or the
urge attached to 'i want' 'i am' is weakened because you see the previous links that work to result in that becoming. you notice the intiial raw
discomfort become the urge to avoid it to the desire for a cigarette to the felt urgency to adhere to the thought + the resistance to the initial
discomfort and the promise of relieving all that. You watch the magic show from backstage and this time are not fooled by the trick. The thought i
want a cigarette has some space and in this space you remain aware and feel the burn of the initial discomfort. this understanding is the antidote.
craving is not a command. relief is not freedom. choosing relief is choosing to perpetuate the cycle. choosing non-relief is choosing to end the cycle.
choosing relief is to scratch the scab and open the wound. choosing non-relief is being driven crazy by the itch but not touching it and letting it
heal. this second path allows the wound to heal and disappear.

Nibbana = the wound fully healing. now it is not itchy at all because the scab healed and fell off. you realise how much time you wasted scratching
the scab, prepetuating the healing process, actually causing you more pain and relief cycles instead of just confronting it head on and feeling it
fully. its like would you rather lift a 2kg weight 1 million times or a 20 kg weight once. the 2kg weight requires no effort but you are stuck doing
it every day for the rest of your life. the 20kg weight you will need to train for. but once you have done it once, the job is done.

The self is a conditioned control-pattern generated by body, feeling, perception, memory, desire, attention and action. When that pattern is misread
as the owner. grasping/becoming/craving starts defending and extending it. birthing this whole process of apprehending things as me and mine,
proliferating this process out in a world and strengthening its solidity with attachments it also defends. This process gets trapped in conditioned
loops where it avoids unpleasant things and soothe to get relief. this is samsara. you do not see it because you are inside the loop. you see pain
and then see relief. then repeat. its like a mouse being alone in a cage seeing cheese, eating it and then being electrocuted. but yet the mouse
carries on doing this because it wants the cheese.

The second you turn away from the discomfort, the craving becomes a thought, i want a cigarette. the mind resorts to its pathways. the only way you
undo this is by reconditioning the reaction to the raw sensation. one must ask what is the feeling here I dont want to feel. feel the burn instead
of feed the fire.Only then is it possible to see an unpleasant feeling arise and pass away without immediately grabbing it and trying to relieve it.
instead of picking the scab because its itchy you feel the itch and know that by not itching the scab will heal the wound and there will be no
further scab or itch.

the process: feeling - craving - grasping - becoming - action - habit - future craving in response to that feeling
the remedy: feeling - knowing / understanidng / staying in contact with the feeling - not feeding the craving - thus cutting off the chain
the result: feeling

the mind thinks freedom is relief
real freedom is not needing the relief object / activity to be ok

Feeling the burn of non-relief is the only freedom you have and the only path to stop training craving as the master and toiling in samsara

You stop mistaking the mirage for water. You stop endless striving towards an illusory promised reward. you see how the image of the mirage is created
and therefore fully understand that there is no water there. By seeing and understanding this you stop hankering after it. You become disenchanted
by the previous object of craving because you see that there is no true relief given by it, infact it is the very cause of you wanting relief.

You are at the destination already, stop leaving it.
Craving is an inclination, it brings up existance again and again.

When one makes the destruction of craving ones aim, there is nothing more to be done.`},{slug:"day-2",title:"Day 2",content:`while reading nanananda i realised that i was reading terms like sankhara and was not familiar with exactly what it meant, so i think deepdiving each of these concepts is useful in understanding what is really being said

sankhara = that which prepares, determines, constructs conditions or gives footing to experience / identity
it is the mechanism at play when someone is reactive, it pulls consciousness into an existing pattern of activity and produces a predicteable outome, its when you trigger someone and they automatically get defensive
it is the preverbal weighting of experience that structures the world and self in order that it is likely to interpret experience in a certain way
the conditioned preparation by whcih contact and feeling are interpreted through old formations / emotional patterns. This gives rise to signs or outward appearances that are then recognized or locked onto and made into a familiar world and a familiar self existing within that world
sankhara is the activity that defines the sensitivity to tone, expectations of rejection, prepared social masks, intentions, all seemingly combininig into a formation that takes on a solidified structure and becomes a pathway experience manifests, creating a shortcut for the organism to interpret
sankhara in the fire simile refers to the drynes of the wood, the presence of oxygen, arrangement of the firewood and the readiness of it all to ignite into fire and the activity of preparing it all and igniting (upon contact)
youa re never receiving raw reality, you are receiving contact preconditioned by perception, feeling , signs birthing a world and self
the sankhara modulates the probability of reacting in a certain way

Signs:

A sign is what perception seizes onto so that experience becomes meaningful, nameable, desireable, threatening, personal
after contact, the mind catches a sign which is the formation of that appearance meaning a certain thing as shaped by sankhara, it depends on perception yet we miss the chain of its creation and just see the sign
They are like attractors of perception, historically recogniseable ways of interpreting experience that we can interpret to mean certain things about ourselves, conditioned by sankhara. e.g. if i see someone respond to me with hostility i might interpret this as honesty and seeing me clearly and react positiviely vs someone responding cordially to me i may interpret this as they arent seeing me clearly yet and the sign becomes them not being a very perceptive person.
or further, if someone sees me as being special i may then see them as perceptive because this aligns with my self view of feeling special yet misunderstood
air vibration - parsing into words, phrases - contextual meaning applied (who is saying them, where are we - perception (arising of interpretation of raw sensation - a solidifcation of perception recognizing a sign (signs are the grooves of perception like archetypes applied to people) - reacting to that sign (we react to our image not the person + our emotional valence / sanlhara / emotional weighting in that moment) - unpleasant feeling - desire not to feel it -grasping at narrative that reframes it -identifying with that story - acting as that person in the moment - birth (acting and speaking as that role - kamma - solidifying the chain making it more likely to happen again - reinforcing the perception of the world, other and me in it - thus your world is reborn continually perfectly in time with me and other

Dhamma:
Dhamma teaches the organism to see how it is curently programmed how this programming produces the organisms world and its position inside it until the need to keep running it weakens. The funcional organism continues but the appropriation as I and mine stops.
It reveals and interrupts the control level at which experience is being organised into self world becoming. In seeing the generative model and then unplugging the power, stream entry is akin to cutting the power, yet the generative model continues processing until it has used up what was in its cache
Dhamma reduces the need to build selfhood around uncertainty, working at the level where contact with reality converts into action taken.
Nibbana is the stilling of the whole process of i am this, in this world needing that
Ignorance = not seeing the mutual arising of phenomena and the presence of them, i.e. for the red to be there consciousness must be there because without consciousness there could be no red and without something to be conscious of there is no consciousness
The self is born as a strategy for managing feelings and managing unpleasant/pleasant vedana
The world inhabited is conditioned by what ind of being is being generate

Meditation shortuct:
observe your thinking right now, what will my next thought be?
The body appears, there is weight in the head, rising and falling of the belly, seeing blinking, air coming in at the nostrils
keep returning to this world`},{slug:"day-3",title:"Day 3",content:`The first thing that comes to my mind is smth i recently read in Ajahn Sumedho, who also comes from the Thai forest tradition (and i was previously exposed to a practice by Janusz Welin which was supposed to do basically the same thing).

One of the things that meditative practice is supposed to accomplish, according to the ajahn, is making one operate more from awareness instead of the personality. The personality is seen as conditioned and as arising in awareness; awareness itself -- as impersonal and wide. He also uses the terms "subject" for the self and "absolute subjectivity" for awareness, and i was really enthusiastic when i read that, because it seems to me that subjectivity is one essential features of experience -- that one cannot have experience without subjectivity -- and a lot of language in pragmatic circles seemed to be a denial of subjectivity.

So, awareness would be the absolute subjectivity / self from which one can operate when the small self is seen as arising and passing away and one is thus freed from personality view. This makes perfect sense to me, as i become acquainted with awareness more and more. I haven t accomplished a definitive "shift" yet -- i still operate most of the time from my "default self" -- but i understand how awareness is there as long as i am awake, and how that can be a self from which to operate.

I think the next shift is to see awareness itself as 'empty'

One view toward the emptiness of awareness is just being a scientist and thinking of awareness as "merely" the electrical dance of neuronal patterns firing.

Then of course the manifestation of awareness is seen merely as this world being experienced.

So awareness isn't anything but the entire universe, really.

First step: Awareness is everything "this is all fabricated (by me)"

Second step: Awareness isn't anything.

This makes enough space in awareness for the entire universe to come about.

I find it hard to see what he meant toward the end about how "he turned what is not-self into a self".

Basically this has to do with control. One of the definitions for something to be self in the suttas is that it is under your control. So first you are exerting effort and control, trying to turn the jumble of (not-self) aggregates into samadhi, a pleasing abiding (self). You see just how much samatha you can develop and control, how solid and stable. Then, with insight you view the aggreates as not-self, not totally under your control, for the purposes of developing dispassion toward them, to release clinging.`},{slug:"day-4",title:"Day 4",content:`dependent arising is a process that only happens now.

e.g. ill have a cigarette today and start properly meditating tomorrow, is the same as i feel the urge to have a cigarette so im going to have one
the only difference is the story we generate to justify it

what happens every time is:

Delightful thought appears, a cigarette great idea!

The urge to fulfill the activity arises, ooh i want to do it now

This feels like a burning or friction in the body / mind, because now we have this moment and we have the desire for it to be different

This creates a tension, you sat there wanting a cigarette but not having one

This friction is actually elongated by the fixation of attention on the cigarette, the resistance to wanting a cigarette perpetuates the original
desire and adds to the pain felt in the moment. Any management techniques applied also keep the desired activity at the centre, its the same process
with more steps.

So now there are 2 options. 1 - you resolve this internal conflict and pain and stress you are feeling by smoking a cigarette,

when you smoke this cigarette its a huge relief, not only because of the cigarette but you have now resolved the internal conflict!

What a relief! You notice how good it feels and then maybe carry on with what you were doing before, mood elevated, cigarettes are good for me.

the next time u get the delightful thought to smoke a cigarette. That thought itself is birthed from the previous delight, the experience of the
dropping of internal conflict even for a second. It feels like the ritual itself has become a semi-autonomous entity. Its as if this entity sends
you the delightful thought, you then carry the action out and strengthen the power of the entity, next time you do the action even quicker.

So whats the problem here? The problem is that now you can't stop even if you tried. You are at the whim of the entity. Imagine if you were in a
situation where your mother would be killed if you smoked a cigarette. The entity appears with the delightful thought, but now you see it as
a destructive thought, yet you still can't escape it. The odds of you smoking a cigarette are not 0. Now the mind is clever, it could not just smoke
a cigarette and kill your mother, thats ridiculous. What happens is the pull of that entity, conditions the next thought ever so slightly,
slowly this takes form as my mother is pretty old, is she happy? Am i really never going to smoke ever again, what about my happiness, wouldn't she
want whats best for me, i'm suffering here. Basically the moral of the story is that the resolution of the conflict itself is what causes the conflict
to appear tomorrow. If smoking the cigarette didnt help you feel good, you wouldnt do it. Therefore, because it feels good you want to do it.
Yet you dont see that because it feels good, it creates the bad feeling that it then becomes necessary to neutralise. imagine you are neutral mostly.
then you smoke a cigarette you become good briefly, then you are plunged into bad because it wears off. so now you have gone from neutral, peace,
to good briefly, mostly bad. Now being mostly bad, you cant wait to feel good, so feeling bad you get the thought of a cigarette, now you have the
opportunity to feel good, you remember how it feels, you fixate on the experience, the coolness of the smoke. Now the moment feels tense, you feel bad
there is an option to make you feel good, yet you know that you are just giong to feel bad again after its done, yet reamining in the bad feels impossible.

So whats the solution?

The solution is to see that this process is now happening by itself and you are caught in it unwillingly.

The second is seeing that you dont actually want the thing that is being delighted in, I dont want a cigarette, I want the relief and the ritual.

As a result, how can i get that same thing, that same relief in a slightly less harmful way?

E.g. instead of smoking a cigarette, i sit outside with a coffee. This removes the fixation of the cigarette and gives evidence I just actually
wanted a break, maybe some dopamine.

Then gradually continue this, coffee becomes just sitting outside, sitting outside becomes taking a few deep breaths, which then becomes staying with
the actual urge itself, seeing how it arises based on the promise of previous relief and how that is felt as more desireable or urgent based on how
bad you are feeling now. Thus, the main solution is to feel good now. If you always felt happy why would you demand a cigarette, you wouldnt, you may
still like one but your happiness isnt dependent on having it.

This gradually weakens the momentum of the looped process / entity until there is no more delightful thought for a cigarette, partly because it is now
not delightful because you are already delighted with right now and because you have seen through the illusion that it was the cigarette doing this
by replacing it with substituetes, until the mind doesn't know what it wants, it just wants NOT THIS or something to be different. This movement
of wanting something to be different is becoming. Its the present moment transforming into a different view. This is usually habitual and feels forced
e.g. the cigarette. Whats actually going on here is that the same experience is being created because it offers relief, it creates a world and sense of self
a storyline, identity. Thus, you never really quit cigarettes you just stop being the person that wants one.

The final truth is that you need to end the process of being reborn as a smoker, then you will never smoke again.

Buddhism takes this one step further and says once you end the process of being reborn as a 'me' you will never feel this stress again, because it is
the end of wanting this moment to be different than it currently is. There is no more delightful thought that drives activity that pushes and pulls
to create certain experiences again and again, the whole structure has lost momentum.

love the idea of giving the chain form, its like we break it down into its different parts using nanananda, then we create a form that we can use to from a relationship with it, then we skillfully negotiate what is actually wanted. we swap cigarette with coffee, gradually we come to see that this is just a habitual movement occuring by itself to no-one, seeing this, the movement is allowed to stop, yet this only stops with the stopping of the self, becaue that IS what causes the movement

need becoming to make this moment ok. dammn thats deep, thats the very self structure isnt it, even if im becoming bad or good, its this craving that fuels rebirth, its an addiction to becoming, because if im not a good or bad self then who am i, what is the world? how to make sense of current reality

yes and even in like reactions to conflict. if something is not my fault, i default to taking blame because this action is what the archetype of the nice person would do, its the same becoming of the role, the whole thing is just becoming of actions that reinforce archetypes that help manage reality. i need to see myself as a good person thus i act in a certain way, me being a good person gives me an anchor and can help me judge if another person is or not, yet im not a good person im fueling my image of myself as a good person by taking actions in accordance with it thus i then becoming better at playing a good person, continually trying to become one but never do, because there is no such thing as a good and bad person

Becoming = the movement by which experience organizes itself into "I am this kind of one, in this kind of world, needing this kind of outcome."

Becoming is the performative crystallization of craving into identity.

Or more plainly:

Becoming is what happens when the mind tries to solve discomfort by becoming someone in relation to it.

what else is along this chain? its like theres a link connecting nanananda, lacan, bourdrillard, terrence mckenna that gives different levels of the same thing. the vortex spins, how and why this happens relationally realting to emotions and social needs, then how these are influenced by cultural expectations and programming. how else could we add to this. its like culture is its own uncosncious with its own traumas, archetypes, a mind of its own right which places individuals into context and contains certain attractors for what status means, which characters may be played which then affects the development of the people within them because each person is being affected by these held norms and it affections action like a matric through this same process of becoming, its like a macro charged thoughtform that each person is feeding through their image of what it is. people in england do this, i am a person in england, i do this

A sign becomes charged.
The charge creates desire.
Desire seeks recognition/relief.
A role is born.
The role creates a world.
Action feeds the world and strenghtens the role.
The world feels real.
The self is continually reborn inside it, usually in a similar way because we have found one that meets our needs

this stuff is blowing my mind. at the core of it is the mental process of dependent origination and craving, its just this same thing across scale, scaled up to mind its like self organising cells that group together to form actions taht defend against certain situations, which gets charged and reinforced by actions that solidify taht identity, then u look for proof this identity is real by performing it in the world, finding people who validate it, associating in environments where the perfromance is accepted and recognised by culture

Yes. You've got it.

At the core is dependent arising as a self-organising process:

feeling → craving → grasping → becoming → birth of a self/world

And then this scales.

Nibbāna is not biologically reducible to a brain-state.

But a biologically grounded description could be:

the deconditioning of compulsive self-modeling around affective regulation.

Or more plainly:

the organism still responds to conditions, but affective pressure no longer crystallizes into "me and my becoming."

Here is the full chain:

Perception/interface:
A world appears already structured by biology, culture, memory, and past action.

Contact:
Something is encountered.

Feeling:
It is marked pleasant/unpleasant/neutral.

Craving:
The organism wants more, less, or different.

Intention/kamma:
A direction of action forms.

Action:
Body, speech, or mind moves.

Result:
Relief, pain, reward, shame, recognition, etc.

Update:
The interface is modified.

Future perception:
The sign appears with more or less charge.

Becoming:
A self is more or less likely to be born around it.

Final formulation

Kamma is the feedback law of becoming.`},{slug:"day-5",title:"Day 5",content:"(No entry for Day 5)"},{slug:"day-6",title:"Day 6",content:`i live in service of the genius that flows through me

the only thing permanenent is knowledge and art and this lives on through mimetic relation to it, it persists as a
stream of momentum through psychic relation to it, think of surrealist artists, crowley, they created a psychic world that people can access
get inspiration from and continue the work that he started, expanding it

thus, one should live in devotion to the genius, ignoring outside influences on the auric field

no one cares if nanavira was a good person, he created a framework that will exist forever and produce positive impact post-death

cigarettes are not bad, whats bad is the shame attached to it, i smoke thus i am defective

tobacco is a sacred plant that when used ceremonially allows for the communion with certain aspects, thats why arahants smoke, shamans

plants like tobacco and cannabis and others are spirits to cultivate relationships with and provide insight yet shouldnt be relied upon

i am not gay, i am just attracted to men

i am not bisexual, i am just attracted to the deeper aspects of a person, their intelligence, their way of being

we all have a story, emotional charges, but no one really cares because its all conditioned, its how you take that and transmute it into art

Make the lower self transparent to the higher self.

This is the only thing we are doing across all systems, we are clearing the vessel, making contact with higher intelligence and allowing that
to operate in us consciously, embodying and bringing down the soul / true self / daimon in material form

The Great Work is the disciplined transformation of consciousness until your imagination, will, body, speech, ethics, and life-direction
become aligned with the deepest spiritual intelligence available to you.

Different maps. Same basic arc:

raw human → purified vessel → conscious contact → integration → service/expression.

also levin speaks on tukdam, tibetan buddhism potentially defines the post death process, how would it fit into our metaphysics...
yes also im connecting these ideas to buddhist impermanence, this gives the foundation because it means we have the ability to take any
temporary form we want, in doing so its = channeling or evoking that element, which is why magick works because you train in evoking
= acting will on the universe = creation and direction of consciousness through the alteration of your own, the great work is merging
with the hga to allow for the merging of the higher and the lower into balance, the human is the connective principle from the material
to the immaterial, like plotinus said

The Plotinus piece

Yes — this is deeply Plotinian.

The human being stands between levels:

The One / Nous / higher intelligible order
↓
Soul / daimon / inner form
↓
psyche / imagination / ritual symbol
↓
body / speech / action / world

Magick is the art of making that descent conscious.

Buddhism then adds the anti-inflation correction:

Do not reify the soul-pattern into an eternal ego.
Do not mistake image for truth.
Do not cling to magical identity.
Test everything by whether it reduces ignorance, craving, fear, fragmentation, and suffering.

That makes the whole system much cleaner.

All forms are empty, therefore form can be consciously assumed; but because forms are empty, none should be clung to. The Great Work is to assume
the highest form available, dissolve the false self into it, and let enlightened/daimonic intelligence act through the human bridge.

the body is an instrument of discernment. It receives the whole, but discerns only what the body has the capacity to see.

He does not reduce alchemy to literal gold-making

McKenna says the idea that alchemy was mainly about turning lead into gold is a major misunderstanding. He calls the literal gold-makers "puffers," meaning charlatans, con artists, or lower-level operators.

He even jokes that modern science has technically achieved pseudo-alchemy: nuclear physics can transmute elements, but this completely misses the symbolic goal. Science achieved the crude outer fantasy while missing the inner transformation.

For him, alchemical gold = authentic being. The point is not wealth. The point is becoming real.

10. The philosopher's stone: matter behaving like imagination

McKenna's explanation of the philosopher's stone is wild and important.

The stone is not just a magic rock. It is an impossible object that crosses all categories. It behaves like matter and imagination at once. It could become food, vehicle, companion, information-display, water-source — whatever is needed.

That sounds absurd because modern ontology demands that things stay in their category. But that is exactly the point. The philosopher's stone is the coincidentia oppositorum: the union of opposites. It is matter redeemed into imagination and imagination exteriorized into matter.

So the philosopher's stone means:

spirit concentrated in matter,
soul exteriorized,
body interiorized into imagination,
mind and world no longer split.

human beings act on the world, change the world, and in doing so transform themselves.

The human world is thought at different layers of objectification.

A car is perfect.

A car is not just "metal and wheels." It is:

physics objectified,
engineering objectified,
capitalist production objectified,
fossil-fuel society objectified,
desire for speed/freedom/status objectified,
road systems and legal codes objectified,
aesthetic taste objectified,
class structure objectified,
environmental contradiction objectified.

So a car is thought that has passed through mind, labour, institutions, machines, capital, law, and desire, then returned as an object that shapes future minds.

That's the loop.

Thought → design → labour → object → infrastructure → habit → perception → desire → new thought.

This is why Hegel is so insane. He is not saying "my private mind imagines a car into existence." He is saying the world humans inhabit is already saturated with mind because it has been produced by historically accumulated human activity.

And Ilyenkov/Marx materialise it even harder:

culture is alienated/objectified human activity.

So when you walk through a city, you are walking through crystallised human thought. Roads, shops, police, schools, brands, ads, temples, phones, clothing, currency — these are not neutral objects. They are social intelligence frozen into forms.

Then Marx adds the dark turn:

we forget we made them.

The products of human activity turn back on us as if they are natural, inevitable, external powers. Money, capital, property, "the job market," "the economy," "normal life" — these are human creations that now appear as gods or laws of nature.

That is fetishism.

And Baudrillard goes further:

eventually the objectified thought becomes signs, brands, simulations, lifestyles, and images — and we live inside the code.

And Lacan adds:

the subject itself is formed by those signifiers. You do not just use the symbolic world. It speaks you into being.

So the full chain is:

Hegel: culture is Spirit/thought objectified.
Ilyenkov: thought must be read in practice, tools, science, institutions.
Marx: objectified human activity becomes alien and rules us.
Debord: social life becomes image/spectacle.
Baudrillard: signs detach and generate hyperreality.
Lacan: the subject is structured by the symbolic order it inherits.

Your sentence is basically right:

the human world is thought at various layers of abstraction and process.

I'd sharpen it into:

The human world is sedimented thought: collective activity frozen into objects, institutions, signs, and habits, which then train new subjects to perceive, desire, and act in certain ways.

Everything within the Wider Reality is contained within the same point. So if you are at one place, you are at all places at the same time. Because there is no Space. That is why I say we each occupy all of consciousness already. The only difference is in your objective perception of your surroundings in terms of where, along your consciousness continuum, you are focusing your attention. And that comes right back to what I was saying on the outset: these areas are NOT places, they are focuses of attention.

When we look at ourselves in terms of energy, what we are is essentially a human energetic transducer that converts raw subjective energy into objective becoming of all manner of description. When we project within subjective reality, each of us typically places ourselves in the position or anticipation of facing objects. But when you enter Primary Focus 4, you cast off all notions of "things" and begin merging with the underlying subjective energy. That same energy, down the line, as it were, will ultimately split off here and there (again all in a manner of speaking) and create a "thing". That thing could be a soccer ball, a human being, a house, a plant, a giraffe, or whatever.

F1 encompasses EVERYTHING that we regard as physical: the world, the galaxy and the entire universe. If you want to know who created the universe, I have been reliably informed that it was us! The purpose of the physical universe is to experience objective reality. At some point we got together, from a Focus 4 perspective, and decided to create a common pool of subjective energy that would manifest itself objectively in the form that we recognise as the physical universe, the purpose of which is to provide an excellent means of gathering experience; we are here to experience and being physical in an objective sense is a wonderful way of doing so. The physical world can be thought of as condensed subjective energy manifesting in an objective manner and in creating it, we set up a series of rules surrounding this energy. The result is of course the material principles of the universe and what we understand as Physics. One of the most useful aspects of the physical world is that being physical shields us from the worst effects of subjective expression: with regards to the Wider Reality, if you think about something, you will release subjective energy; do this enough and the desired effect will manifest. This causes problems for those who are in a poor state of mind. The lower levels of F3 are awash with people who are stuck in their own self created hell-holes due to an ever increasing spiral of negative energy. For example, someone who creates a terrifying situation for themselves then results in them becoming even more terrified, resulting in ever more terrifying situations and on it goes.`}];async function f({params:a}){let{slug:g}=await a,h=e.find(a=>a.slug===g);h||(0,c.notFound)();let i=h.content.split("\n\n").filter(Boolean);return(0,b.jsxs)("div",{className:"flex flex-col flex-1 mx-auto w-full max-w-[640px] px-8 py-8",children:[(0,b.jsx)("nav",{className:"mb-8 text-sm",children:(0,b.jsx)(d.default,{href:"/",className:"text-zinc-500 hover:text-zinc-300 transition-colors",children:"← Feed"})}),(0,b.jsx)("h1",{className:"text-2xl font-bold mb-6",children:h.title}),(0,b.jsx)("div",{className:"prose text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap",children:i.map((a,c)=>(0,b.jsx)("p",{children:a},c))})]})}a.s(["default",0,f,"generateStaticParams",0,function(){return e.map(a=>({slug:a.slug}))}],40395)},65671,a=>{a.n(a.i(40395))}];

//# sourceMappingURL=_0dcl61b._.js.map