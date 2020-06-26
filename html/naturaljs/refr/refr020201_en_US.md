Overview
===

Natural-ARCHITECTURE supports AOP (Aspect-Oriented Programming) for Controller objects.

AOP declarations can be defined in the N.context.attr ("architecture").cont.pointcuts object and the N.context.attr ("architecture").cont.advisors property in [Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s). and you can execute common logic by specifying the target Controller object as a pointcut and before / after / around / error adviceType.

 * Natural-JS's AOP allows you to commonize or templateify repeated logic of UI development, greatly improving development productivity.
<p class="alert">If you use a function of the Controller object as a new operator, occurs an error. In this case, exclude the function from the pointcut.</p>