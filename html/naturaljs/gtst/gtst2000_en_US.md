Getting Started with Sample project
===

<ul class="contents links" style="margin-left: -267px;width: 237px;"></ul>

[eclipse]: https://www.eclipse.org
[eclipse-download]: https://www.eclipse.org/downloads/eclipse-packages/
[jdk]: http://www.oracle.com/technetwork/java/javase/downloads/index.html

[img-0]: ./images/gtst/gtst2000/0.png
[img-1]: ./images/gtst/gtst2000/1.png
[img-2]: ./images/gtst/gtst2000/2.png
[img-3]: ./images/gtst/gtst2000/3.png
[img-4]: ./images/gtst/gtst2000/4.png
[img-5]: ./images/gtst/gtst2000/5.png
[img-6]: ./images/gtst/gtst2000/6.png
[img-7]: ./images/gtst/gtst2000/7.png
[img-8]: ./images/gtst/gtst2000/8.png
[img-9]: ./images/gtst/gtst2000/9.png

## Sample project configuration

The basic technologies of the sample project are composed as follows.

* **Front-End**
     * language : HTML, CSS, Javascript
     * Framework : Natural-JS
* **Back-End**
     * language : JAVA
     * Framework : Spring Boot
     * DB : HSQLDB

## Installation

### 1. Install Eclipse
[Download][eclipse-download] Eclipse IDE for Java EE Developers from the [Eclipse][eclipse] site, unzip it and run the eclipse.exe file.
>[Java SE Development Kit][jdk] must be installed to run Eclipse.

When Eclipse is finished running, install the `Spring Tools` plugin to support `Spring Boot` development as follows.

Click 'Help`> `Eclipse Marketplace` menu and search for` sts` in the Find input field.
The `Spring Tools` plugin is displayed as shown in the following figure. Click the `install` button here to proceed with the installation.

![Install Spring Tools][img-0]

When installation is complete, restart Eclipse.

### 2. Download the sample project
When Eclipse is finished running, run it in the following order in Eclipse.

First, select the URL below and copy(Ctrl + C) it. Just copy it.
```md
https://github.com/bbalganjjm/natural_js.git
```

2.1. Right-click on the left `Package Explorer` or select `Import` from the `File` menu.

![Select Import menu][img-1]

2.2. In the `Import` dialog box, select `Git> Projets from Git` and click the `Next` button.

![Selete Projets from Git][img-2]

2.3. Select Clone URI and click 'Next' button.

![img-3][]

2.4. This is the screen for entering the connection information of  Source Git Repository of Natural-JS. The values ​​will be automatically entered according to the URL you copied earlier. If not entered, Enter
```md
https://github.com/bbalganjjm/natural_js.git
```
directly.
Enter the Github login information in `User` and` Password` among the input fields. If you are saving authentication information, select `Store in Secure Store` and click the `Finish` button.

![img-4][]

2.5. In the list of branches of Natural-JS Source Git Repository, check only the natural-js-spring-boot branch and click the `Finish` button.

![img-5][]

2.6. Specify the target directory to save the source code in the `Directory` input field and click the `Finish` button.

![img-6][]

2.7. Select the `import as general project` radio button in the `Wizard for project import` section, click the `Finish` button and download the source code and wait for the project to be created.

![img-7][]

2.8. When the project is created, right-click on the created project name and select the `Configure` > `Convert to Maven Project` menu to make it a Maven Project.

![img-8][]

Wait for the conversion to Maven project to complete.

2.9. When the conversion to the Maven project is completed, right-click the project name and select the `Run As` > `Spring Boot App` menu to start the program.

![img-9][]

2.10 When the program finishes running, open a web browser and enter the following address.
```md
http://localhost/index.html
```
If the Natural-JS site you are currently viewing is displayed normally, installation is complete.

## Examples
The example of the Natural-JS homepage you are currently viewing is an example of a client source that is not connected to the application server. However, the example of the `natural-js-spring-boot` project is an example in whose CRUD (create, query, modify, delete) is physically processed by the application server and the DBMS.