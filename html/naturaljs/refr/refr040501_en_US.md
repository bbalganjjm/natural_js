Overview
===

Tab(N.tab) is a UI component that creates a tab page view by specifying an element consisting of div>ul>li tags as the context option.

 * When you create a page specified by the url option as a popup, caller(N.popup instance that called itself) and opener(The parent page's Controller object that called itself, You pass it as an option when creating a popup.) properties are added to the Controller object of the created popup. You can control the parent page using opener, or you can close itself or send data to the parent Controller using caller.
 * You can get the Controller object of the each tab pages by calling the cont method on an instance of N.tab. See the [Methods] tab for more information about the cont method.