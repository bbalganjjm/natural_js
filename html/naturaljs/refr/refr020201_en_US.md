Overview
===

Natural-ARCHITECTURE supports AOP (Aspect-Oriented Programming) for Controller objects.

AOP declarations can be defined in the N.context.attr ("architecture").cont.pointcuts object and the N.context.attr ("architecture").cont.advisors property in [Config(N.config)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s). and you can execute common logic by specifying the target Controller object as a pointcut and before / after / around / error adviceType.

<p class="alert">Natural-JS's AOP allows you to commonize and template the iterative logic of UI development, resulting in dramatic development productivity improvements.</p>
<p class="alert">If you use a method of the Controller object by instantiating the object with the new operator, an error occurs. In this case, exclude the function from the pointcut.</p>